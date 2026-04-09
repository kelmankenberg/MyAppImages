"use strict";
const electron = require("electron");
const VALID_CHANNELS = [
  "req:scan-appimages",
  "req:launch-appimage",
  "req:get-settings",
  "req:save-settings",
  "req:add-appimage",
  "req:remove-appimage",
  "req:update-appimage-properties",
  "req:reset-appimage-properties",
  "req:open-file-location",
  "req:refresh-appimages",
  "evt:scan-progress",
  "evt:appimages-updated",
  "evt:settings-changed",
  "evt:launch-error"
];
electron.contextBridge.exposeInMainWorld("electronAPI", {
  invoke: (channel, data) => {
    if (VALID_CHANNELS.includes(channel)) {
      return electron.ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },
  on: (channel, func) => {
    if (VALID_CHANNELS.includes(channel)) {
      electron.ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
  removeListener: (channel, func) => {
    if (VALID_CHANNELS.includes(channel)) {
      electron.ipcRenderer.removeListener(channel, func);
    }
  }
});
