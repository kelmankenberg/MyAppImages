import { app, BrowserWindow } from 'electron';
import path from 'path';

import { WindowManager } from './app/window-manager';

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(async () => {
  const wm = new WindowManager();
  mainWindow = await wm.createWindow();

  // Load the renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../renderer/index.html')
    );
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      wm.createWindow().then((w) => {
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
