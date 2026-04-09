import { BrowserWindow, screen } from 'electron';
import path from 'path';

export class WindowManager {
  async createWindow(): Promise<BrowserWindow> {
    const window = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 320,
      minHeight: 240,
      frame: false,
      transparent: true,
      alwaysOnTop: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
      },
    });

    return window;
  }

  getPositionFromSettings(position: string): { x: number; y: number; w: number; h: number } | null {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const dockSize = 320; // Default dock width/height

    switch (position) {
      case 'left':
        return { x: 0, y: 0, w: dockSize, h: screenHeight };
      case 'right':
        return { x: screenWidth - dockSize, y: 0, w: dockSize, h: screenHeight };
      case 'top':
        return { x: 0, y: 0, w: screenWidth, h: dockSize };
      case 'bottom':
        return { x: 0, y: screenHeight - dockSize, w: screenWidth, h: dockSize };
      case 'none':
      default:
        return null; // Use default dimensions
    }
  }
}
