"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const window_manager_1 = require("./app/window-manager");
const handlers_1 = require("./ipc/handlers");
const settings_1 = require("./types/settings");
let mainWindow = null;
electron_1.app.whenReady().then(async () => {
    const settings = (0, handlers_1.getStore)() || settings_1.DEFAULT_SETTINGS;
    const wm = new window_manager_1.WindowManager();
    (0, handlers_1.setWindowManager)(wm);
    mainWindow = await wm.createWindow(settings);
    // Load the renderer
    if (process.env.VITE_DEV_SERVER_URL) {
        await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Open DevTools in development
        // mainWindow.webContents.openDevTools();
    }
    else {
        await mainWindow.loadFile(path_1.default.join(__dirname, '../renderer/index.html'));
    }
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            wm.createWindow(settings).then((w) => {
                mainWindow = w;
            });
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC handlers
require("./ipc/handlers");
//# sourceMappingURL=index.js.map