import { BrowserWindow, screen } from 'electron';
import path from 'path';

export class SettingsWindowManager {
  private settingsWindow: BrowserWindow | null = null;
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(mainWin: BrowserWindow): void {
    this.mainWindow = mainWin;
  }

  openSettingsWindow(): BrowserWindow {
    // If window already exists, just focus it
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.focus();
      return this.settingsWindow;
    }

    // Get primary display
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // Settings window dimensions
    const windowWidth = 600;
    const windowHeight = 650;

    // Center on screen
    const x = Math.round((screenWidth - windowWidth) / 2);
    const y = Math.round((screenHeight - windowHeight) / 2);

    this.settingsWindow = new BrowserWindow({
      x,
      y,
      width: windowWidth,
      height: windowHeight,
      minWidth: 500,
      minHeight: 400,
      frame: false,
      transparent: false,
      resizable: true,
      modal: true,
      parent: this.mainWindow || undefined,
      show: false,
      backgroundColor: '#1E1E1E',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload/index.js'),
      },
    });

    // Load settings renderer
    if (process.env.VITE_DEV_SERVER_URL) {
      this.settingsWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/settings.html`);
    } else {
      this.settingsWindow.loadFile(
        path.join(__dirname, '../../dist/renderer/settings.html')
      );
    }

    // Show when ready
    this.settingsWindow.once('ready-to-show', () => {
      this.settingsWindow?.show();
    });

    // Clean up when closed
    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null;
    });

    return this.settingsWindow;
  }

  closeSettingsWindow(): void {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.close();
      this.settingsWindow = null;
    }
  }

  getWindow(): BrowserWindow | null {
    return this.settingsWindow;
  }
}
