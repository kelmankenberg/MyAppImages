"use strict";
const electron = require("electron");
const path = require("path");
class WindowManager {
  async createWindow() {
    const window = new electron.BrowserWindow({
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
        preload: path.join(__dirname, "../preload/index.js")
      }
    });
    return window;
  }
  getPositionFromSettings(position) {
    const primaryDisplay = electron.screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const dockSize = 320;
    switch (position) {
      case "left":
        return { x: 0, y: 0, w: dockSize, h: screenHeight };
      case "right":
        return { x: screenWidth - dockSize, y: 0, w: dockSize, h: screenHeight };
      case "top":
        return { x: 0, y: 0, w: screenWidth, h: dockSize };
      case "bottom":
        return { x: 0, y: screenHeight - dockSize, w: screenWidth, h: dockSize };
      case "none":
      default:
        return null;
    }
  }
}
const CHANNELS = {
  // Request/Response (invoke)
  SCAN_APPIMAGES: "req:scan-appimages",
  LAUNCH_APPIMAGE: "req:launch-appimage",
  GET_SETTINGS: "req:get-settings",
  SAVE_SETTINGS: "req:save-settings",
  ADD_APPIMAGE: "req:add-appimage",
  REMOVE_APPIMAGE: "req:remove-appimage",
  UPDATE_PROPERTIES: "req:update-appimage-properties",
  RESET_PROPERTIES: "req:reset-appimage-properties",
  OPEN_FILE_LOCATION: "req:open-file-location",
  REFRESH_APPIMAGES: "req:refresh-appimages"
};
electron.ipcMain.handle(CHANNELS.SCAN_APPIMAGES, async (_event, _data) => {
  return { success: true, count: 0, entries: [], errors: [], duration: 0 };
});
electron.ipcMain.handle(CHANNELS.LAUNCH_APPIMAGE, async (_event, _data) => {
  return { success: false, error: "NOT_IMPLEMENTED" };
});
electron.ipcMain.handle(CHANNELS.GET_SETTINGS, async () => {
  return {
    success: true,
    settings: {
      scanDirectories: ["~/AppImages"],
      dockPosition: "left",
      dockPinned: true,
      iconSize: 64,
      theme: "system",
      windowOpacity: 100,
      alwaysOnTop: false,
      minimizeToTray: true,
      recentCount: 10
    }
  };
});
electron.ipcMain.handle(CHANNELS.SAVE_SETTINGS, async (_event, _data) => {
  return { success: true };
});
electron.ipcMain.handle(CHANNELS.ADD_APPIMAGE, async (_event, _data) => {
  return { success: false, error: "NOT_IMPLEMENTED" };
});
electron.ipcMain.handle(CHANNELS.REMOVE_APPIMAGE, async (_event, _data) => {
  return { success: false, error: "NOT_IMPLEMENTED" };
});
electron.ipcMain.handle(CHANNELS.UPDATE_PROPERTIES, async (_event, _data) => {
  return { success: false, error: "NOT_IMPLEMENTED" };
});
electron.ipcMain.handle(CHANNELS.RESET_PROPERTIES, async (_event, _data) => {
  return { success: false, error: "NOT_IMPLEMENTED" };
});
electron.ipcMain.handle(CHANNELS.OPEN_FILE_LOCATION, async (_event, _data) => {
  return { success: false, error: "NOT_IMPLEMENTED" };
});
electron.ipcMain.handle(CHANNELS.REFRESH_APPIMAGES, async () => {
  return { success: true, added: 0, removed: 0, entries: [] };
});
let mainWindow = null;
electron.app.whenReady().then(async () => {
  const wm = new WindowManager();
  mainWindow = await wm.createWindow();
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../renderer/index.html")
    );
  }
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      wm.createWindow().then((w) => {
        mainWindow = w;
      });
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
