import { ipcMain } from 'electron';
import { CHANNELS } from './channels';

// Placeholder IPC handlers — services will be wired in as they're implemented

ipcMain.handle(CHANNELS.SCAN_APPIMAGES, async (_event, _data) => {
  return { success: true, count: 0, entries: [], errors: [], duration: 0 };
});

ipcMain.handle(CHANNELS.LAUNCH_APPIMAGE, async (_event, _data) => {
  return { success: false, error: 'NOT_IMPLEMENTED' };
});

ipcMain.handle(CHANNELS.GET_SETTINGS, async () => {
  return {
    success: true,
    settings: {
      scanDirectories: ['~/AppImages'],
      dockPosition: 'left',
      dockPinned: true,
      iconSize: 64,
      theme: 'system',
      windowOpacity: 100,
      alwaysOnTop: false,
      minimizeToTray: true,
      recentCount: 10,
    },
  };
});

ipcMain.handle(CHANNELS.SAVE_SETTINGS, async (_event, _data) => {
  return { success: true };
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
