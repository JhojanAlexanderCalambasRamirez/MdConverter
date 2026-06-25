export type Language = 'en' | 'es';

const translations = {
  en: {
    appTitle: 'MdConverter',

    // DropZone
    dropHere: 'Drop files here',
    dragAndDrop: 'Drag & drop files here',
    orClickToBrowse: 'or click to browse',

    // FileList
    fileCount: (n: number) => `${n} file${n !== 1 ? 's' : ''}`,

    // ConversionActions
    convert: 'Convert',
    convertWith: (n: number) => `Convert (${n})`,
    converting: 'Converting...',
    clearAll: 'Clear All',

    // ProgressBar
    convertingProgress: 'Converting...',

    // ResultsView
    conversionComplete: 'Conversion Complete',
    converted: (n: number) => `${n} converted`,
    failed: (n: number) => `${n} failed`,
    openFolder: 'Open Folder',
    viewFile: 'View file',
    exportedTo: 'Exported to the same location as the original file',
    convertMoreFiles: 'Convert More Files',

    // InfoSection
    hideInfo: 'Hide info',
    whatIsThis: 'What is this?',
    aboutTitle: 'About',
    aboutText:
      'MdConverter transforms complex documents (PDF, Word, Excel, PowerPoint, and more) into clean Markdown files, optimized for AI consumption. All processing happens locally on your machine — no files are sent to external servers.',
    howToUseTitle: 'How to use',
    step1: 'Drag & drop files onto the drop zone, or click to browse',
    step2: "Review the file list and remove any you don't need",
    step3: 'Click <strong>Convert</strong> to start the conversion',
    step4: 'Output <code>.md</code> files are saved next to the originals',
    step5: 'Click <strong>Open Folder</strong> to reveal the converted files',
    supportedFormatsTitle: 'Supported formats',
    poweredBy: 'Powered by',
    fromMicrosoft: 'from Microsoft',

    // Footer
    builtBy: 'Built by',

    // Theme
    themeLabel: (t: string) => `Theme: ${t}`,

    // Language
    langLabel: 'EN',
  },
  es: {
    appTitle: 'MdConverter',

    // DropZone
    dropHere: 'Suelta los archivos aqui',
    dragAndDrop: 'Arrastra y suelta archivos aqui',
    orClickToBrowse: 'o haz clic para buscar',

    // FileList
    fileCount: (n: number) => `${n} archivo${n !== 1 ? 's' : ''}`,

    // ConversionActions
    convert: 'Convertir',
    convertWith: (n: number) => `Convertir (${n})`,
    converting: 'Convirtiendo...',
    clearAll: 'Limpiar todo',

    // ProgressBar
    convertingProgress: 'Convirtiendo...',

    // ResultsView
    conversionComplete: 'Conversion completada',
    converted: (n: number) => `${n} convertido${n !== 1 ? 's' : ''}`,
    failed: (n: number) => `${n} fallido${n !== 1 ? 's' : ''}`,
    openFolder: 'Abrir carpeta',
    viewFile: 'Ver archivo',
    exportedTo: 'Exportado en la misma ubicacion del archivo original',
    convertMoreFiles: 'Convertir mas archivos',

    // InfoSection
    hideInfo: 'Ocultar info',
    whatIsThis: 'Que es esto?',
    aboutTitle: 'Acerca de',
    aboutText:
      'MdConverter transforma documentos complejos (PDF, Word, Excel, PowerPoint y mas) en archivos Markdown limpios, optimizados para consumo de IA. Todo el procesamiento ocurre localmente en tu maquina — ningun archivo se envia a servidores externos.',
    howToUseTitle: 'Como usar',
    step1: 'Arrastra y suelta archivos en la zona de carga, o haz clic para buscar',
    step2: 'Revisa la lista de archivos y elimina los que no necesites',
    step3: 'Haz clic en <strong>Convertir</strong> para iniciar la conversion',
    step4: 'Los archivos <code>.md</code> se guardan junto a los originales',
    step5: 'Haz clic en <strong>Abrir carpeta</strong> para ver los archivos convertidos',
    supportedFormatsTitle: 'Formatos soportados',
    poweredBy: 'Impulsado por',
    fromMicrosoft: 'de Microsoft',

    // Footer
    builtBy: 'Creado por',

    // Theme
    themeLabel: (t: string) => `Tema: ${t}`,

    // Language
    langLabel: 'ES',
  },
};

export interface Translations {
  appTitle: string;
  dropHere: string;
  dragAndDrop: string;
  orClickToBrowse: string;
  fileCount: (n: number) => string;
  convert: string;
  convertWith: (n: number) => string;
  converting: string;
  clearAll: string;
  convertingProgress: string;
  conversionComplete: string;
  converted: (n: number) => string;
  failed: (n: number) => string;
  openFolder: string;
  viewFile: string;
  exportedTo: string;
  convertMoreFiles: string;
  hideInfo: string;
  whatIsThis: string;
  aboutTitle: string;
  aboutText: string;
  howToUseTitle: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  supportedFormatsTitle: string;
  poweredBy: string;
  fromMicrosoft: string;
  builtBy: string;
  themeLabel: (t: string) => string;
  langLabel: string;
}

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}
