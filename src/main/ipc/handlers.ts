import { ipcMain, shell, BrowserWindow, app } from 'electron';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import { CHANNELS } from './channels';
import { ScannerService } from '../services/scanner.service';
import type { AppImageEntry } from '../types/appImage';
import type { Settings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { WindowManager } from '../app/window-manager';

const scannerService = new ScannerService();
let windowManager: WindowManager | null = null;

// Initialize persistent storage
const store = new Store<Settings>({
  defaults: DEFAULT_SETTINGS,
  name: 'settings',
  clearInvalidConfig: true,
});

// Load settings from persistent storage on startup
let currentSettings: Settings = store.store as Settings;

// Export for use in main process
export const getStore = () => currentSettings;
export const setWindowManager = (wm: WindowManager) => { windowManager = wm; };

ipcMain.handle(CHANNELS.SCAN_APPIMAGES, async (_event, _data) => {
  const startTime = Date.now();
  const directories = currentSettings.scanDirectories;

  try {
    const result = await scannerService.scan(directories);

    // Convert paths to AppImageEntry objects
    const entries: AppImageEntry[] = result.paths.map((filePath) => {
      const fileName = path.basename(filePath);
      const id = Buffer.from(filePath).toString('base64');
      const stats = fs.statSync(filePath);

      return {
        id,
        name: fileName.replace(/\.appimage$/i, ''),
        path: filePath,
        icon: undefined,
        version: undefined,
        launchCount: 0,
        dateAdded: new Date().toISOString(),
        size: stats.size,
        lastMtimeCheck: stats.mtimeMs,
      };
    });

    return {
      success: true,
      count: entries.length,
      entries,
      errors: result.errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      entries: [],
      errors: [{ message: (error as Error).message }],
      duration: Date.now() - startTime,
    };
  }
});

ipcMain.handle(CHANNELS.LAUNCH_APPIMAGE, async (_event, data) => {
  try {
    const { path: appPath } = data as { path: string };
    
    // Make the AppImage executable
    fs.chmodSync(appPath, '755');
    
    // Launch the AppImage
    const { spawn } = require('child_process');
    const child = spawn(appPath, {
      detached: true,
      stdio: 'ignore',
    });
    
    // Detach from parent process
    child.unref();
    
    // Update launch count in store
    const entries = store.get('appImages') as any[] || [];
    const entry = entries.find((e: any) => e.path === appPath);
    if (entry) {
      entry.launchCount = (entry.launchCount || 0) + 1;
      entry.lastLaunched = new Date().toISOString();
      store.set('appImages', entries);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle(CHANNELS.GET_SETTINGS, async () => {
  return {
    success: true,
    settings: currentSettings,
  };
});

ipcMain.handle(CHANNELS.SAVE_SETTINGS, async (_event, data) => {
  try {
    const newSettings = (data as { settings: Settings }).settings;
    currentSettings = newSettings;
    // Persist to disk
    store.set(newSettings);
    
    // Apply dock/position settings to the window
    if (windowManager) {
      windowManager.applyDockSettings(newSettings);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle(CHANNELS.ADD_APPIMAGE, async (_event, _data) => {
  return { success: false, error: 'NOT_IMPLEMENTED' };
});

ipcMain.handle(CHANNELS.REMOVE_APPIMAGE, async (_event, _data) => {
  return { success: false, error: 'NOT_IMPLEMENTED' };
});

ipcMain.handle(CHANNELS.UPDATE_PROPERTIES, async (_event, _data) => {
  return { success: false, error: 'NOT_IMPLEMENTED' };
});

ipcMain.handle(CHANNELS.RESET_PROPERTIES, async (_event, _data) => {
  return { success: false, error: 'NOT_IMPLEMENTED' };
});

ipcMain.handle(CHANNELS.OPEN_FILE_LOCATION, async (_event, _data) => {
  return { success: false, error: 'NOT_IMPLEMENTED' };
});

ipcMain.handle(CHANNELS.REFRESH_APPIMAGES, async () => {
  return { success: true, added: 0, removed: 0, entries: [] };
});

ipcMain.handle(CHANNELS.QUIT_APP, async () => {
  app.quit();
  return { success: true };
});

ipcMain.handle(CHANNELS.START_WINDOW_DRAG, async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.webContents.startDragging();
  }
  return { success: true };
});
