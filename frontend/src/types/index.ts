export type FileStatus = 'pending' | 'converting' | 'success' | 'error';

export interface FileItem {
  id: string;
  path: string;
  name: string;
  extension: string;
  status: FileStatus;
  error?: string;
  outputPath?: string;
  title?: string;
}

export interface ConversionResult {
  id: number;
  status: 'success' | 'error';
  markdown?: string;
  outputPath?: string;
  title?: string;
  error?: string;
}

export type Theme = 'light' | 'dark' | 'system';
