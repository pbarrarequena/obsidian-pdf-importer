// main.ts
import { App, Plugin, PluginSettingTab, Setting, TFolder, Notice, normalizePath, Modal, TextComponent } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';

interface PDFImporterSettings {
	importFolder: string;
}

const DEFAULT_SETTINGS: PDFImporterSettings = {
	importFolder: 'PDFs'
}

export default class PDFImporterPlugin extends Plugin {
	settings: PDFImporterSettings;

	async onload() {
		await this.loadSettings();

		// Add the "Import PDF" command to the command palette
		this.addCommand({
			id: 'import-pdf',
			name: 'Import PDF',
			callback: () => this.importPDF()
		});

		// Add settings tab
		this.addSettingTab(new PDFImporterSettingTab(this.app, this));
	}

	onunload() {
		// Clean up when the plugin is disabled
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async importPDF() {
		// Create an input element for file selection
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.pdf';
		
		// Handle file selection
		fileInput.addEventListener('change', async (event) => {
			// @ts-ignore
			const file = event.target.files[0];
			if (!file) return;
			
			const originalFilename = file.name;
			
			// Prompt user for a new filename
			const newFilename = await this.promptForFilename(originalFilename);
			
			if (!newFilename) {
				return; // User canceled the rename
			}
			
			try {
				// Make sure the target folder exists
				await this.ensureImportFolderExists();
				
				// Read the file as an ArrayBuffer
				const buffer = await this.readFileAsArrayBuffer(file);
				
				// Copy the file to the vault
				await this.copyFileToVault(buffer, newFilename);
				
				new Notice(`PDF imported successfully: ${newFilename}`);
			} catch (error) {
				console.error('Error importing PDF:', error);
				new Notice('Error importing PDF. Check console for details.');
			}
		});
		
		// Trigger the file input click
		fileInput.click();
	}
	
	readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = reject;
			reader.readAsArrayBuffer(file);
		});
	}

	async promptForFilename(originalFilename: string): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new PDFRenameModal(this.app, originalFilename, (result) => {
				resolve(result);
			});
			
			modal.open();
		});
	}

	async ensureImportFolderExists() {
		const folderPath = normalizePath(this.settings.importFolder);
		const folderExists = await this.app.vault.adapter.exists(folderPath);
		
		if (!folderExists) {
			await this.app.vault.createFolder(folderPath);
		}
	}

	async copyFileToVault(data: ArrayBuffer, newFilename: string) {
		const folderPath = normalizePath(this.settings.importFolder);
		const targetPath = `${folderPath}/${newFilename}`;
		
		// Write the file to the vault
		await this.app.vault.adapter.writeBinary(targetPath, new Uint8Array(data));
	}
}

class PDFRenameModal extends Modal {
	originalFilename: string;
	onSubmit: (result: string | null) => void;
	newFilename: string;

	constructor(app: App, originalFilename: string, onSubmit: (result: string | null) => void) {
		super(app);
		this.originalFilename = originalFilename;
		this.onSubmit = onSubmit;
		this.newFilename = originalFilename;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Rename PDF' });

		// Add filename input
		new Setting(contentEl)
			.setName('Enter a name for the PDF')
			.addText(text => text
				.setValue(this.originalFilename)
				.onChange(value => {
					this.newFilename = value;
				}));

		// Add buttons
		const buttonDiv = contentEl.createDiv({ cls: 'modal-button-container' });
		
		buttonDiv.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => {
				this.close();
				this.onSubmit(null);
			});
		
		buttonDiv.createEl('button', { text: 'Import', cls: 'mod-cta' })
			.addEventListener('click', () => {
				this.close();
				this.onSubmit(this.newFilename);
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class PDFImporterSettingTab extends PluginSettingTab {
	plugin: PDFImporterPlugin;

	constructor(app: App, plugin: PDFImporterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Import folder')
			.setDesc('The folder where PDFs will be imported')
			.addText(text => text
				.setPlaceholder('PDFs')
				.setValue(this.plugin.settings.importFolder)
				.onChange(async (value) => {
					this.plugin.settings.importFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}