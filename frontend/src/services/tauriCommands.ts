import { invoke } from '@tauri-apps/api/core';
import type { ConversionResult } from '../types';

export async function convertFile(filePath: string): Promise<ConversionResult> {
  return invoke<ConversionResult>('convert_file', { filePath });
}

export async function revealInFolder(path: string): Promise<void> {
  return invoke('reveal_in_folder', { path });
}

export async function listFolderFiles(folderPath: string): Promise<string[]> {
  return invoke<string[]>('list_folder_files', { folderPath });
}

export async function createZip(filePaths: string[], outputPath: string): Promise<string> {
  return invoke<string>('create_zip', { filePaths, outputPath });
}
