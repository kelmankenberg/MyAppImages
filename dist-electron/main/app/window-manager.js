"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowManager = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
class WindowManager {
    constructor() {
        this.mainWindow = null;
    }
    getPositionFromSettings(position) {
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
        const dockSize = 320; // Default dock width/height
        const cornerSize = 400; // Corner dock size
        switch (position) {
            case 'left':
                return { x: 0, y: 0, w: dockSize, h: screenHeight };
            case 'right':
                return { x: screenWidth - dockSize, y: 0, w: dockSize, h: screenHeight };
            case 'top':
                return { x: 0, y: 0, w: screenWidth, h: dockSize };
            case 'bottom':
                return { x: 0, y: screenHeight - dockSize, w: screenWidth, h: dockSize };
            case 'top-left':
                return { x: 0, y: 0, w: cornerSize, h: cornerSize };
            case 'top-right':
                return { x: screenWidth - cornerSize, y: 0, w: cornerSize, h: cornerSize };
            case 'bottom-left':
                return { x: 0, y: screenHeight - cornerSize, w: cornerSize, h: cornerSize };
            case 'bottom-right':
                return { x: screenWidth - cornerSize, y: screenHeight - cornerSize, w: cornerSize, h: cornerSize };
            case 'none':
            default:
                return null; // Use default dimensions
        }
    }
    async createWindow(settings) {
        const dockPos = this.getPositionFromSettings(settings.dockPosition);
        const window = new electron_1.BrowserWindow({
            x: dockPos?.x ?? undefined,
            y: dockPos?.y ?? undefined,
            width: dockPos?.w ?? 800,
            height: dockPos?.h ?? 600,
            minWidth: 320,
            minHeight: 240,
            frame: false,
            transparent: false,
            alwaysOnTop: settings.alwaysOnTop,
            backgroundColor: '#1E1E1E',
            show: false,
            skipTaskbar: settings.dockPinned,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path_1.default.join(__dirname, '../../preload/index.js'),
            },
        });
        this.mainWindow = window;
        // Show window when ready to prevent flash
        window.once('ready-to-show', () => {
            window.show();
        });
        return window;
    }
    applyDockSettings(settings) {
        if (!this.mainWindow)
            return;
        const dockPos = this.getPositionFromSettings(settings.dockPosition);
        if (dockPos) {
            // Ensure window is not maximized or fullscreen before repositioning
            if (this.mainWindow.isMaximized()) {
                this.mainWindow.unmaximize();
            }
            if (this.mainWindow.isFullScreen()) {
                this.mainWindow.setFullScreen(false);
            }
            // Explicitly set position and size for reliability
            this.mainWindow.setPosition(dockPos.x, dockPos.y);
            this.mainWindow.setSize(dockPos.w, dockPos.h);
        }
        this.mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
        this.mainWindow.setSkipTaskbar(settings.dockPinned);
    }
    getWindow() {
        return this.mainWindow;
    }
}
exports.WindowManager = WindowManager;
//# sourceMappingURL=window-manager.js.map