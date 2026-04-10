import { ipcMain, shell, BrowserWindow, app } from 'electron';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import { CHANNELS } from './channels';
import { ScannerService } from '../services/scanner.service';
import { IconExtractionService } from '../services/icon-extraction.service';
import type { AppImageEntry } from '../types/appImage';
import type { Settings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { WindowManager } from '../app/window-manager';
import { SettingsWindowManager } from '../app/settings-window-manager';

const scannerService = new ScannerService();
const settingsWindowManager = new SettingsWindowManager();
export { settingsWindowManager };
const iconExtractionService = new IconExtractionService();
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

    // Extract icons from AppImages in parallel
    const entriesWithIcons = await Promise.all(
      result.paths.map(async (filePath) => {
        const fileName = path.basename(filePath);
        const id = Buffer.from(filePath).toString('base64');
        const stats = fs.statSync(filePath);

        // Extract icon for this AppImage
        const iconPath = await iconExtractionService.extractIcon(filePath, stats.mtimeMs);

        // Convert icon file to base64 data URL for renderer
        let iconUrl: string | undefined;
        if (iconPath && fs.existsSync(iconPath)) {
          try {
            const iconData = fs.readFileSync(iconPath);
            const base64 = iconData.toString('base64');
            const ext = path.extname(iconPath).toLowerCase();
            const mimeType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
            iconUrl = `data:${mimeType};base64,${base64}`;
          } catch {
            iconUrl = undefined;
          }
        }

        return {
          id,
          name: fileName.replace(/\.appimage$/i, ''),
          path: filePath,
          icon: iconUrl,
          version: undefined,
          launchCount: 0,
          dateAdded: new Date().toISOString(),
          size: stats.size,
          lastMtimeCheck: stats.mtimeMs,
        };
      })
    );

    return {
      success: true,
      count: entriesWithIcons.length,
      entries: entriesWithIcons,
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
    // TODO: Implement drag functionality
  }
  return { success: true };
});

ipcMain.handle(CHANNELS.OPEN_SETTINGS_WINDOW, async () => {
  try {
    settingsWindowManager.openSettingsWindow();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle(CHANNELS.CLOSE_SETTINGS_WINDOW, async () => {
  try {
    settingsWindowManager.closeSettingsWindow();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});
