use crate::sidecar::{send_convert_request, SidecarState};
use serde::{Deserialize, Serialize};
use tauri::async_runtime::Mutex;

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
