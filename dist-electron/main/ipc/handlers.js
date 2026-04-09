"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setWindowManager = exports.getStore = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_store_1 = __importDefault(require("electron-store"));
const channels_1 = require("./channels");
const scanner_service_1 = require("../services/scanner.service");
const settings_1 = require("../types/settings");
const scannerService = new scanner_service_1.ScannerService();
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
        // Convert paths to AppImageEntry objects
        const entries = result.paths.map((filePath) => {
            const fileName = path_1.default.basename(filePath);
            const id = Buffer.from(filePath).toString('base64');
            const stats = fs_1.default.statSync(filePath);
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
//# sourceMappingURL=handlers.js.map