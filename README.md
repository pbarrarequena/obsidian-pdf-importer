# Obsidian PDF Importer

A simple Obsidian plugin that allows importing PDF files directly through the Command Palette.

## Features

- Import PDF files using the Command Palette instead of drag-and-drop
- Rename PDFs during import
- Configure a specific folder for all imported PDFs
- Simple and user-friendly interface

## Installation

### From Obsidian

1. Open Settings > Community Plugins
2. Disable Safe Mode
3. Click Browse and search for "PDF Importer"
4. Install the plugin and enable it

### Manual Installation

1. Download the latest release from the Releases section
2. Extract the zip file to your Obsidian plugins folder: `{vault}/.obsidian/plugins/`
3. Enable the plugin in Obsidian settings

## Usage

1. Open the Command Palette (Ctrl/Cmd + P)
2. Type "Import PDF" and select the command
3. Choose a PDF file from your computer
4. Rename the file if desired
5. The PDF will be imported to your configured folder

## Configuration

- Go to Settings > PDF Importer
- Set the folder where you want PDFs to be imported (default: "PDFs")

## Development

This plugin is built using TypeScript and the Obsidian API.

### Building

```bash
# Install dependencies
npm install

# Build the plugin
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
