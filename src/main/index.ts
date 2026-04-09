import { app, BrowserWindow } from 'electron';
import path from 'path';

import { WindowManager } from './app/window-manager';
import { setWindowManager, getStore } from './ipc/handlers';
import type { Settings } from './types/settings';
import { DEFAULT_SETTINGS } from './types/settings';

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(async () => {
  const settings: Settings = getStore() || DEFAULT_SETTINGS;

  const wm = new WindowManager();
  setWindowManager(wm);
  mainWindow = await wm.createWindow(settings);

  // Load the renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, '../renderer/index.html')
    );
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      wm.createWindow(settings).then((w) => {
        mainWindow = w;
      });
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
import './ipc/handlers';
