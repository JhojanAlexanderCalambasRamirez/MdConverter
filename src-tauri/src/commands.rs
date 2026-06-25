use crate::sidecar::{send_convert_request, SidecarState};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{Read, Write};
use std::path::Path;
use tauri::async_runtime::Mutex;

const SUPPORTED_EXTENSIONS: &[&str] = &[
    "pdf", "docx", "doc", "xlsx", "xls", "pptx", "ppt", "csv",
    "html", "htm", "txt", "json", "xml", "epub",
    "png", "jpg", "jpeg", "gif", "bmp", "tiff", "webp",
];

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversionResult {
    pub id: u64,
    pub status: String,
    #[serde(skip_serializing)]
    pub markdown: Option<String>,
    #[serde(alias = "output_path")]
    #[serde(rename(serialize = "outputPath"))]
    pub output_path: Option<String>,
    pub title: Option<String>,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn convert_file(
    state: tauri::State<'_, Mutex<SidecarState>>,
    file_path: String,
) -> Result<ConversionResult, String> {
    let response = send_convert_request(&state, &file_path).await?;
    serde_json::from_value(response)
        .map_err(|e| format!("Failed to parse sidecar response: {e}"))
}

#[tauri::command]
pub async fn reveal_in_folder(
    app: tauri::AppHandle,
    path: String,
) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .reveal_item_in_dir(std::path::Path::new(&path))
        .map_err(|e| format!("Failed to reveal in folder: {e}"))
}

#[tauri::command]
pub async fn list_folder_files(folder_path: String) -> Result<Vec<String>, String> {
    let path = Path::new(&folder_path);
    if !path.is_dir() {
        return Err(format!("Not a directory: {folder_path}"));
    }

    let mut files = Vec::new();
    collect_files_recursive(path, &mut files)
        .map_err(|e| format!("Failed to scan folder: {e}"))?;

    files.sort();
    Ok(files)
}

fn collect_files_recursive(dir: &Path, files: &mut Vec<String>) -> std::io::Result<()> {
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect_files_recursive(&path, files)?;
        } else if let Some(ext) = path.extension() {
            let ext_lower = ext.to_string_lossy().to_lowercase();
            if SUPPORTED_EXTENSIONS.contains(&ext_lower.as_str()) {
                if let Some(path_str) = path.to_str() {
                    files.push(path_str.to_string());
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn create_zip(file_paths: Vec<String>, output_path: String) -> Result<String, String> {
    let zip_path = Path::new(&output_path);
    let file = fs::File::create(zip_path)
        .map_err(|e| format!("Failed to create zip file: {e}"))?;

    let mut zip = zip::ZipWriter::new(file);
    let options = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    for path_str in &file_paths {
        let path = Path::new(path_str);
        if !path.exists() {
            continue;
        }

        let file_name = path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown.md");

        zip.start_file(file_name, options)
            .map_err(|e| format!("Failed to add file to zip: {e}"))?;

        let mut f = fs::File::open(path)
            .map_err(|e| format!("Failed to read file: {e}"))?;
        let mut buffer = Vec::new();
        f.read_to_end(&mut buffer)
            .map_err(|e| format!("Failed to read file: {e}"))?;

        zip.write_all(&buffer)
            .map_err(|e| format!("Failed to write to zip: {e}"))?;
    }

    zip.finish()
        .map_err(|e| format!("Failed to finalize zip: {e}"))?;

    Ok(output_path)
}
