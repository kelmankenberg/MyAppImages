"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANNELS = void 0;
// IPC channel definitions
exports.CHANNELS = {
    // Request/Response (invoke)
    SCAN_APPIMAGES: 'req:scan-appimages',
    LAUNCH_APPIMAGE: 'req:launch-appimage',
    GET_SETTINGS: 'req:get-settings',
    SAVE_SETTINGS: 'req:save-settings',
    ADD_APPIMAGE: 'req:add-appimage',
    REMOVE_APPIMAGE: 'req:remove-appimage',
    UPDATE_PROPERTIES: 'req:update-appimage-properties',
    RESET_PROPERTIES: 'req:reset-appimage-properties',
    OPEN_FILE_LOCATION: 'req:open-file-location',
    REFRESH_APPIMAGES: 'req:refresh-appimages',
    QUIT_APP: 'req:quit-app',
    // Events (Main → Renderer)
    SCAN_PROGRESS: 'evt:scan-progress',
    APPIMAGES_UPDATED: 'evt:appimages-updated',
    SETTINGS_CHANGED: 'evt:settings-changed',
    LAUNCH_ERROR: 'evt:launch-error',
};
//# sourceMappingURL=channels.js.map