<p align="center">
  <img src="Images/Logo-MdConverter.png" alt="MdConverter Logo" width="140" />
</p>

<h1 align="center">MdConverter</h1>

<p align="center">
  <strong>Document to Markdown converter — Desktop application for macOS and Windows</strong>
</p>

<p align="center">
  <a href="#english">English</a> | <a href="#español">Español</a>
</p>

---

<a id="english"></a>

## About

MdConverter is a cross-platform desktop application that converts local documents into clean, structured Markdown files. It uses [MarkItDown](https://github.com/microsoft/markitdown) by Microsoft as the conversion engine.

The purpose of this tool is not to edit documents. It is designed to:

- Reduce structural noise from complex document formats.
- Produce Markdown that is easy to read and process by language models.
- Decrease unnecessary context volume.
- Preserve the original document structure.
- Save time compared to manual terminal-based conversion.

**All processing happens locally on your machine. No files are sent to external servers.**

## Supported Formats

| Input | Output |
|-------|--------|
| PDF, DOCX, XLSX, PPTX, CSV, HTML, TXT, JSON, XML, EPUB, and all formats compatible with MarkItDown | Markdown (.md) |

## How It Works

1. Open the application.
2. Drag and drop one or more files onto the window, or click to browse.
3. The application automatically detects the file type.
4. Click **Convert** to start the conversion using MarkItDown.
5. The generated `.md` file is saved in the same directory as the original, with the same name.
6. Click **View file** to open the output location in Finder or Explorer.

### Saving Rules

- The output file is always saved in the same location as the source file.
- The original file name is preserved, only the extension changes.
- Original files are never moved, deleted, or overwritten.
- If the output file already exists, a numbered suffix is added: `Document (1).md`, `Document (2).md`, etc.

**Example:**

```
Input:  /Users/user/Documents/Report.pdf
Output: /Users/user/Documents/Report.md
```

## Features

- Drag & drop and manual file selection.
- Individual and batch conversion.
- Per-file progress tracking.
- Results view with output path and quick access to the converted file.
- Light mode, dark mode, and system theme support.
- Interface available in English and Spanish.
- Conversion cancellation support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | [Tauri v2](https://v2.tauri.app/) |
| Frontend | React + TypeScript |
| Backend | Python |
| Python Environment | [UV](https://docs.astral.sh/uv/) |
| Conversion Engine | [MarkItDown](https://github.com/microsoft/markitdown) by Microsoft |
| Bundling | `.dmg` (macOS) / `.exe` NSIS installer (Windows) |

## Architecture

```
MdConverter
│
├── Frontend (React + TypeScript)
│   ├── DropZone — File drag & drop and selection
│   ├── FileList — Queued files with status indicators
│   ├── ProgressBar — Per-file conversion progress
│   ├── ResultsView — Output paths and quick actions
│   ├── InfoSection — Usage guide and supported formats
│   └── ThemeToggle / LanguageToggle
│
├── Tauri (Rust)
│   ├── Sidecar Manager — Spawns and manages the Python process
│   ├── Commands — convert_file, reveal_in_folder
│   └── JSON stdin/stdout protocol with request ID correlation
│
└── Python Backend
    ├── ConversionEngine — MarkItDown wrapper
    ├── File Utilities — Output path resolution, collision handling
    └── Main — Long-running sidecar process (JSON over stdin/stdout)
```

The Python backend runs as a long-running sidecar process that communicates with Tauri through a JSON protocol over stdin/stdout. This avoids Python startup overhead on each conversion. In development mode, the process is launched via `uv run`. For production builds, it is compiled into a standalone binary using PyInstaller.

## Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | v20+ |
| [Rust](https://www.rust-lang.org/tools/install) | 1.77+ |
| [UV](https://docs.astral.sh/uv/) | 0.4+ |
| Python | 3.12+ (managed by UV) |

## Installation and Development Setup

```bash
# Clone the repository
git clone https://github.com/JhojanAlexanderCalambasRamirez/MdConverter.git
cd MdConverter

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install Python dependencies
cd backend && uv sync && cd ..

# Run in development mode
cargo tauri dev
```

## Building for Distribution

### macOS (.dmg)

```bash
# Build the Python sidecar
./scripts/build-sidecar.sh

# Build the application
cargo tauri build
# Output: src-tauri/target/release/bundle/dmg/MdConverter_1.0.0_aarch64.dmg
```

### Windows (.exe)

```powershell
# Build the Python sidecar
.\scripts\build-sidecar.ps1

# Build the application
cargo tauri build
# Output: src-tauri\target\release\bundle\nsis\MdConverter_1.0.0_x64-setup.exe
```

## Project Structure

```
MdConverter/
├── frontend/                  # React + TypeScript UI
│   ├── src/
│   │   ├── components/        # DropZone, FileList, ProgressBar, ResultsView, etc.
│   │   ├── hooks/             # useFileManager, useConverter, useTheme, useLanguage
│   │   ├── services/          # Tauri command wrappers, file dialog
│   │   ├── types/             # TypeScript interfaces
│   │   ├── i18n/              # English and Spanish translations
│   │   ├── styles/            # Global CSS, theme variables (light/dark)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/                   # Python MarkItDown sidecar
│   ├── converter/
│   │   ├── main.py            # stdin/stdout JSON protocol loop
│   │   ├── engine.py          # MarkItDown wrapper with error handling
│   │   └── file_utils.py      # Output path resolution and collision avoidance
│   └── pyproject.toml         # UV project configuration
├── src-tauri/                 # Rust Tauri backend
│   ├── src/
│   │   ├── lib.rs             # Application entry point and plugin setup
│   │   ├── sidecar.rs         # Python process lifecycle management
│   │   └── commands.rs        # Tauri commands (convert_file, reveal_in_folder)
│   ├── capabilities/          # Security permissions
│   ├── icons/                 # Application icons (macOS and Windows)
│   └── tauri.conf.json        # Tauri configuration
├── scripts/                   # Build scripts for sidecar packaging
├── Images/                    # Logo and assets
└── README.md
```

## License

This project is for personal and educational use.

## Author

**Alexander Calambas**

- [GitHub](https://github.com/JhojanAlexanderCalambasRamirez)
- [LinkedIn](https://www.linkedin.com/in/j4cr/)

---

<a id="español"></a>

## Acerca de

MdConverter es una aplicacion de escritorio multiplataforma que convierte documentos locales en archivos Markdown limpios y estructurados. Utiliza [MarkItDown](https://github.com/microsoft/markitdown) de Microsoft como motor de conversion.

El proposito de esta herramienta no es editar documentos. Esta disenada para:

- Reducir el ruido estructural de formatos de documentos complejos.
- Producir Markdown facil de leer y procesar por modelos de lenguaje.
- Disminuir el volumen de contexto innecesario.
- Preservar la estructura original del documento.
- Ahorrar tiempo frente a la conversion manual por terminal.

**Todo el procesamiento ocurre localmente en tu maquina. Ningun archivo se envia a servidores externos.**

## Formatos Soportados

| Entrada | Salida |
|---------|--------|
| PDF, DOCX, XLSX, PPTX, CSV, HTML, TXT, JSON, XML, EPUB y todos los formatos compatibles con MarkItDown | Markdown (.md) |

## Como Funciona

1. Abre la aplicacion.
2. Arrastra y suelta uno o mas archivos sobre la ventana, o haz clic para buscar.
3. La aplicacion detecta automaticamente el tipo de archivo.
4. Haz clic en **Convertir** para iniciar la conversion usando MarkItDown.
5. El archivo `.md` generado se guarda en el mismo directorio que el original, con el mismo nombre.
6. Haz clic en **Ver archivo** para abrir la ubicacion del resultado en Finder o Explorer.

### Reglas de Guardado

- El archivo de salida siempre se guarda en la misma ubicacion que el archivo fuente.
- Se conserva el nombre original del archivo, solo cambia la extension.
- Los archivos originales nunca se mueven, eliminan ni sobrescriben.
- Si el archivo de salida ya existe, se agrega un sufijo numerado: `Documento (1).md`, `Documento (2).md`, etc.

**Ejemplo:**

```
Entrada: /Users/user/Documents/Reporte.pdf
Salida:  /Users/user/Documents/Reporte.md
```

## Caracteristicas

- Drag & drop y seleccion manual de archivos.
- Conversion individual y por lotes.
- Seguimiento de progreso por archivo.
- Vista de resultados con ruta de salida y acceso rapido al archivo convertido.
- Soporte para modo claro, modo oscuro y tema del sistema.
- Interfaz disponible en ingles y espanol.
- Soporte para cancelacion de conversion.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Framework de escritorio | [Tauri v2](https://v2.tauri.app/) |
| Frontend | React + TypeScript |
| Backend | Python |
| Entorno Python | [UV](https://docs.astral.sh/uv/) |
| Motor de conversion | [MarkItDown](https://github.com/microsoft/markitdown) de Microsoft |
| Empaquetado | `.dmg` (macOS) / `.exe` instalador NSIS (Windows) |

## Arquitectura

```
MdConverter
│
├── Frontend (React + TypeScript)
│   ├── DropZone — Arrastrar y soltar archivos
│   ├── FileList — Archivos en cola con indicadores de estado
│   ├── ProgressBar — Progreso de conversion por archivo
│   ├── ResultsView — Rutas de salida y acciones rapidas
│   ├── InfoSection — Guia de uso y formatos soportados
│   └── ThemeToggle / LanguageToggle
│
├── Tauri (Rust)
│   ├── Sidecar Manager — Gestiona el proceso Python
│   ├── Commands — convert_file, reveal_in_folder
│   └── Protocolo JSON stdin/stdout con correlacion de IDs
│
└── Backend Python
    ├── ConversionEngine — Wrapper de MarkItDown
    ├── File Utilities — Resolucion de rutas y manejo de colisiones
    └── Main — Proceso sidecar persistente (JSON sobre stdin/stdout)
```

El backend Python se ejecuta como un proceso sidecar persistente que se comunica con Tauri a traves de un protocolo JSON sobre stdin/stdout. Esto evita la sobrecarga de inicio de Python en cada conversion. En modo desarrollo, el proceso se lanza via `uv run`. Para builds de produccion, se compila en un binario independiente usando PyInstaller.

## Requisitos Previos

| Herramienta | Version |
|-------------|---------|
| [Node.js](https://nodejs.org/) | v20+ |
| [Rust](https://www.rust-lang.org/tools/install) | 1.77+ |
| [UV](https://docs.astral.sh/uv/) | 0.4+ |
| Python | 3.12+ (gestionado por UV) |

## Instalacion y Configuracion de Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/JhojanAlexanderCalambasRamirez/MdConverter.git
cd MdConverter

# Instalar dependencias del frontend
cd frontend && npm install && cd ..

# Instalar dependencias de Python
cd backend && uv sync && cd ..

# Ejecutar en modo desarrollo
cargo tauri dev
```

## Compilacion para Distribucion

### macOS (.dmg)

```bash
# Compilar el sidecar Python
./scripts/build-sidecar.sh

# Compilar la aplicacion
cargo tauri build
# Salida: src-tauri/target/release/bundle/dmg/MdConverter_1.0.0_aarch64.dmg
```

### Windows (.exe)

```powershell
# Compilar el sidecar Python
.\scripts\build-sidecar.ps1

# Compilar la aplicacion
cargo tauri build
# Salida: src-tauri\target\release\bundle\nsis\MdConverter_1.0.0_x64-setup.exe
```

## Estructura del Proyecto

```
MdConverter/
├── frontend/                  # Interfaz React + TypeScript
│   ├── src/
│   │   ├── components/        # DropZone, FileList, ProgressBar, ResultsView, etc.
│   │   ├── hooks/             # useFileManager, useConverter, useTheme, useLanguage
│   │   ├── services/          # Wrappers de comandos Tauri, dialogo de archivos
│   │   ├── types/             # Interfaces TypeScript
│   │   ├── i18n/              # Traducciones ingles y espanol
│   │   ├── styles/            # CSS global, variables de tema (claro/oscuro)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/                   # Sidecar Python con MarkItDown
│   ├── converter/
│   │   ├── main.py            # Bucle de protocolo JSON stdin/stdout
│   │   ├── engine.py          # Wrapper de MarkItDown con manejo de errores
│   │   └── file_utils.py      # Resolucion de rutas y manejo de colisiones
│   └── pyproject.toml         # Configuracion del proyecto UV
├── src-tauri/                 # Backend Rust de Tauri
│   ├── src/
│   │   ├── lib.rs             # Punto de entrada y configuracion de plugins
│   │   ├── sidecar.rs         # Gestion del ciclo de vida del proceso Python
│   │   └── commands.rs        # Comandos Tauri (convert_file, reveal_in_folder)
│   ├── capabilities/          # Permisos de seguridad
│   ├── icons/                 # Iconos de la aplicacion (macOS y Windows)
│   └── tauri.conf.json        # Configuracion de Tauri
├── scripts/                   # Scripts de compilacion del sidecar
├── Images/                    # Logo y recursos
└── README.md
```

## Licencia

Este proyecto es para uso personal y educativo.

## Autor

**Alexander Calambas**

- [GitHub](https://github.com/JhojanAlexanderCalambasRamirez)
- [LinkedIn](https://www.linkedin.com/in/j4cr/)
