use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tauri::async_runtime::Mutex;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
use tokio::sync::oneshot;

pub type ResponseSender = oneshot::Sender<serde_json::Value>;

pub struct SidecarState {
    child: Option<CommandChild>,
    pending: Arc<Mutex<HashMap<u64, ResponseSender>>>,
    next_id: AtomicU64,
}

impl SidecarState {
    pub fn new() -> Self {
        Self {
            child: None,
            pending: Arc::new(Mutex::new(HashMap::new())),
            next_id: AtomicU64::new(1),
        }
    }

    pub fn next_id(&self) -> u64 {
        self.next_id.fetch_add(1, Ordering::SeqCst)
    }
}

fn find_uv() -> Option<String> {
    // macOS / Linux paths
    #[cfg(not(target_os = "windows"))]
    let candidates: &[&str] = &[
        "/opt/homebrew/bin/uv",
        "/usr/local/bin/uv",
        "/usr/bin/uv",
    ];

    // Windows paths
    #[cfg(target_os = "windows")]
    let candidates: &[&str] = &[];

    for c in candidates {
        if std::path::Path::new(c).exists() {
            return Some(c.to_string());
        }
    }

    // Windows: check USERPROFILE\.local\bin\uv.exe and common install locations
    #[cfg(target_os = "windows")]
    {
        if let Ok(profile) = std::env::var("USERPROFILE") {
            let uv_exe = std::path::PathBuf::from(&profile)
                .join(".local")
                .join("bin")
                .join("uv.exe");
            if uv_exe.exists() {
                return Some(uv_exe.to_string_lossy().to_string());
            }
        }
        if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            let uv_exe = std::path::PathBuf::from(&appdata)
                .join("uv")
                .join("uv.exe");
            if uv_exe.exists() {
                return Some(uv_exe.to_string_lossy().to_string());
            }
        }
    }

    // Fallback: use `which` (Unix) or `where` (Windows) to find in PATH
    #[cfg(not(target_os = "windows"))]
    let which_cmd = "which";
    #[cfg(target_os = "windows")]
    let which_cmd = "where";

    if let Ok(output) = std::process::Command::new(which_cmd).arg("uv").output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout)
                .lines()
                .next()
                .unwrap_or("")
                .trim()
                .to_string();
            if !path.is_empty() {
                return Some(path);
            }
        }
    }
    None
}

fn find_backend_dir() -> Option<std::path::PathBuf> {
    let cwd = std::env::current_dir().ok()?;
    let backend = cwd.join("backend");
    if backend.exists() {
        return Some(backend);
    }
    if let Ok(exe) = std::env::current_exe() {
        let mut dir = exe.parent()?.to_path_buf();
        for _ in 0..3 {
            dir = dir.parent()?.to_path_buf();
        }
        let backend = dir.join("backend");
        if backend.exists() {
            return Some(backend);
        }
    }
    None
}

pub fn spawn_sidecar(
    app: &tauri::AppHandle,
    state: &mut SidecarState,
) -> Result<(), String> {
    let shell = app.shell();

    // Try bundled sidecar first (production), then fall back to uv (dev)
    let spawn_result = shell
        .sidecar("binaries/mdconverter-sidecar")
        .ok()
        .and_then(|cmd| cmd.spawn().ok());

    let (rx, child) = match spawn_result {
        Some(pair) => pair,
        None => {
            // Development mode: use uv run
            let uv_path = find_uv()
                .ok_or("Could not find 'uv'. Install it: https://docs.astral.sh/uv/")?;
            let backend_dir = find_backend_dir()
                .ok_or("Could not find backend/ directory")?;
            let backend_str = backend_dir.to_string_lossy().to_string();

            eprintln!("[sidecar] dev mode: using {} with backend at {}", uv_path, backend_str);

            shell
                .command(&uv_path)
                .args(["run", "--project", &backend_str, "python", "-m", "converter.main"])
                .spawn()
                .map_err(|e| format!("Failed to spawn Python via uv: {e}"))?
        }
    };

    let pending = state.pending.clone();
    let mut rx = rx;

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    if let Ok(response) = serde_json::from_str::<serde_json::Value>(&line) {
                        if let Some(id) = response.get("id").and_then(|v| v.as_u64()) {
                            let mut map = pending.lock().await;
                            if let Some(sender) = map.remove(&id) {
                                let _ = sender.send(response);
                            }
                        }
                    }
                }
                CommandEvent::Stderr(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    eprintln!("[sidecar stderr] {}", line);
                }
                CommandEvent::Terminated(_) => {
                    eprintln!("[sidecar] process terminated");
                    break;
                }
                CommandEvent::Error(err) => {
                    eprintln!("[sidecar error] {}", err);
                }
                _ => {}
            }
        }
    });

    state.child = Some(child);
    Ok(())
}

pub async fn send_convert_request(
    state: &tauri::State<'_, Mutex<SidecarState>>,
    file_path: &str,
) -> Result<serde_json::Value, String> {
    let id;
    let sender_rx;

    {
        let mut s = state.lock().await;
        id = s.next_id();
        let (tx, rx) = oneshot::channel();
        s.pending.lock().await.insert(id, tx);

        let request = serde_json::json!({
            "id": id,
            "action": "convert",
            "path": file_path
        });
        let msg = format!("{}\n", request);

        let child = s.child.as_mut().ok_or("Sidecar not running")?;
        child
            .write(msg.as_bytes())
            .map_err(|e| format!("Failed to write to sidecar stdin: {e}"))?;

        sender_rx = rx;
    }

    match tokio::time::timeout(std::time::Duration::from_secs(120), sender_rx).await {
        Ok(Ok(response)) => Ok(response),
        Ok(Err(_)) => Err("Response channel closed".to_string()),
        Err(_) => {
            let s = state.lock().await;
            s.pending.lock().await.remove(&id);
            Err("Conversion timed out after 120 seconds".to_string())
        }
    }
}

pub async fn shutdown_sidecar(state: &Mutex<SidecarState>) {
    let mut s = state.lock().await;
    if let Some(ref mut child) = s.child {
        let shutdown = serde_json::json!({"action": "shutdown"});
        let msg = format!("{}\n", shutdown);
        let _ = child.write(msg.as_bytes());
    }
    if let Some(child) = s.child.take() {
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        let _ = child.kill();
    }
}
