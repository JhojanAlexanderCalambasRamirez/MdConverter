mod commands;
mod sidecar;

use sidecar::SidecarState;
use tauri::async_runtime::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(SidecarState::new()))
        .setup(|app| {
            let handle = app.handle().clone();
            let state = app.state::<Mutex<SidecarState>>();
            let mut s = tauri::async_runtime::block_on(state.lock());
            sidecar::spawn_sidecar(&handle, &mut s)
                .expect("Failed to spawn Python sidecar");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::convert_file,
            commands::reveal_in_folder,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                let state = window.state::<Mutex<SidecarState>>();
                tauri::async_runtime::block_on(sidecar::shutdown_sidecar(&state));
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running MdConverter");
}
