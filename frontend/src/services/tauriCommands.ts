import { invoke } from '@tauri-apps/api/core';
import type { ConversionResult } from '../types';

export async function convertFile(filePath: string): Promise<ConversionResult> {
  return invoke<ConversionResult>('convert_file', { filePath });
}

export async function revealInFolder(path: string): Promise<void> {
  return invoke('reveal_in_folder', { path });
}
