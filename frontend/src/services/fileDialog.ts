import { open } from '@tauri-apps/plugin-dialog';

const SUPPORTED_EXTENSIONS = [
  'pdf', 'docx', 'xlsx', 'pptx', 'csv',
  'html', 'htm', 'txt', 'json', 'xml',
  'epub', 'png', 'jpg', 'jpeg', 'gif',
  'bmp', 'tiff', 'webp',
];

export async function selectFiles(): Promise<string[] | null> {
  const result = await open({
    multiple: true,
    directory: false,
    filters: [
      {
        name: 'Supported Documents',
        extensions: SUPPORTED_EXTENSIONS,
      },
      {
        name: 'All Files',
        extensions: ['*'],
      },
    ],
  });

  if (result === null) return null;
  return Array.isArray(result) ? result : [result];
}
