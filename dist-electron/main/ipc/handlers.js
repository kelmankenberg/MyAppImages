"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setWindowManager = exports.getStore = exports.settingsWindowManager = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_store_1 = __importDefault(require("electron-store"));
const channels_1 = require("./channels");
const scanner_service_1 = require("../services/scanner.service");
const icon_extraction_service_1 = require("../services/icon-extraction.service");
const settings_1 = require("../types/settings");
const settings_window_manager_1 = require("../app/settings-window-manager");
const scannerService = new scanner_service_1.ScannerService();
const settingsWindowManager = new settings_window_manager_1.SettingsWindowManager();
exports.settingsWindowManager = settingsWindowManager;
const iconExtractionService = new icon_extraction_service_1.IconExtractionService();
let windowManager = null;
// Initialize persistent storage
const store = new electron_store_1.default({
    defaults: settings_1.DEFAULT_SETTINGS,
    name: 'settings',
    clearInvalidConfig: true,
});
// Load settings from persistent storage on startup
let currentSettings = store.store;
// Export for use in main process
const getStore = () => currentSettings;
exports.getStore = getStore;
const setWindowManager = (wm) => { windowManager = wm; };
exports.setWindowManager = setWindowManager;
electron_1.ipcMain.handle(channels_1.CHANNELS.SCAN_APPIMAGES, async (_event, _data) => {
    const startTime = Date.now();
    const directories = currentSettings.scanDirectories;
    try {
        const result = await scannerService.scan(directories);
        // Extract icons from AppImages in parallel
        const entriesWithIcons = await Promise.all(result.paths.map(async (filePath) => {
            const fileName = path_1.default.basename(filePath);
            const id = Buffer.from(filePath).toString('base64');
            const stats = fs_1.default.statSync(filePath);
            // Extract icon for this AppImage
            const iconPath = await iconExtractionService.extractIcon(filePath, stats.mtimeMs);
            // Convert icon file to base64 data URL for renderer
            let iconUrl;
            if (iconPath && fs_1.default.existsSync(iconPath)) {
                try {
                    const iconData = fs_1.default.readFileSync(iconPath);
                    const base64 = iconData.toString('base64');
                    const ext = path_1.default.extname(iconPath).toLowerCase();
                    const mimeType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
                    iconUrl = `data:${mimeType};base64,${base64}`;
                }
                catch {
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
        }));
        return {
            success: true,
            count: entriesWithIcons.length,
            entries: entriesWithIcons,
            errors: result.errors,
            duration: Date.now() - startTime,
        };
    }
    catch (error) {
        return {
            success: false,
            count: 0,
            entries: [],
            errors: [{ message: error.message }],
            duration: Date.now() - startTime,
        };
    }
});
electron_1.ipcMain.handle(channels_1.CHANNELS.LAUNCH_APPIMAGE, async (_event, data) => {
    try {
        const { path: appPath } = data;
        // Make the AppImage executable
        fs_1.default.chmodSync(appPath, '755');
        // Launch the AppImage
        const { spawn } = require('child_process');
        const child = spawn(appPath, {
            detached: true,
            stdio: 'ignore',
        });
        // Detach from parent process
        child.unref();
        // Update launch count in store
        const entries = store.get('appImages') || [];
        const entry = entries.find((e) => e.path === appPath);
        if (entry) {
            entry.launchCount = (entry.launchCount || 0) + 1;
            entry.lastLaunched = new Date().toISOString();
            store.set('appImages', entries);
        }
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle(channels_1.CHANNELS.GET_SETTINGS, async () => {
    return {
        success: true,
        settings: currentSettings,
    };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.SAVE_SETTINGS, async (_event, data) => {
    try {
        const newSettings = data.settings;
        currentSettings = newSettings;
        // Persist to disk
        store.set(newSettings);
        // Apply dock/position settings to the window
        if (windowManager) {
            windowManager.applyDockSettings(newSettings);
        }
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle(channels_1.CHANNELS.ADD_APPIMAGE, async (_event, _data) => {
    return { success: false, error: 'NOT_IMPLEMENTED' };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.REMOVE_APPIMAGE, async (_event, _data) => {
    return { success: false, error: 'NOT_IMPLEMENTED' };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.UPDATE_PROPERTIES, async (_event, _data) => {
    return { success: false, error: 'NOT_IMPLEMENTED' };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.RESET_PROPERTIES, async (_event, _data) => {
    return { success: false, error: 'NOT_IMPLEMENTED' };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.OPEN_FILE_LOCATION, async (_event, _data) => {
    return { success: false, error: 'NOT_IMPLEMENTED' };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.REFRESH_APPIMAGES, async () => {
    return { success: true, added: 0, removed: 0, entries: [] };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.QUIT_APP, async () => {
    electron_1.app.quit();
    return { success: true };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.START_WINDOW_DRAG, async (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        // TODO: Implement drag functionality
    }
    return { success: true };
});
electron_1.ipcMain.handle(channels_1.CHANNELS.OPEN_SETTINGS_WINDOW, async () => {
    try {
        settingsWindowManager.openSettingsWindow();
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle(channels_1.CHANNELS.CLOSE_SETTINGS_WINDOW, async () => {
    try {
        settingsWindowManager.closeSettingsWindow();
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=handlers.js.map