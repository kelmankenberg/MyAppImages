"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsWindowManager = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
class SettingsWindowManager {
    constructor() {
        this.settingsWindow = null;
        this.mainWindow = null;
    }
    setMainWindow(mainWin) {
        this.mainWindow = mainWin;
    }
    openSettingsWindow() {
        // If window already exists, just focus it
        if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
            this.settingsWindow.focus();
            return this.settingsWindow;
        }
        // Get primary display
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
        // Settings window dimensions
        const windowWidth = 600;
        const windowHeight = 650;
        // Center on screen
        const x = Math.round((screenWidth - windowWidth) / 2);
        const y = Math.round((screenHeight - windowHeight) / 2);
        this.settingsWindow = new electron_1.BrowserWindow({
            x,
            y,
            width: windowWidth,
            height: windowHeight,
            minWidth: 500,
            minHeight: 400,
            frame: false,
            transparent: false,
            resizable: true,
            modal: true,
            parent: this.mainWindow || undefined,
            show: false,
            backgroundColor: '#1E1E1E',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path_1.default.join(__dirname, '../../preload/index.js'),
            },
        });
        // Load settings renderer
        if (process.env.VITE_DEV_SERVER_URL) {
            this.settingsWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/settings.html`);
        }
        else {
            this.settingsWindow.loadFile(path_1.default.join(__dirname, '../../dist/renderer/settings.html'));
        }
        // Show when ready
        this.settingsWindow.once('ready-to-show', () => {
            this.settingsWindow?.show();
        });
        // Clean up when closed
        this.settingsWindow.on('closed', () => {
            this.settingsWindow = null;
        });
        return this.settingsWindow;
    }
    closeSettingsWindow() {
        if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
            this.settingsWindow.close();
            this.settingsWindow = null;
        }
    }
    getWindow() {
        return this.settingsWindow;
    }
}
exports.SettingsWindowManager = SettingsWindowManager;
//# sourceMappingURL=settings-window-manager.js.map