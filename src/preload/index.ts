import { contextBridge, ipcRenderer } from 'electron';

const VALID_CHANNELS = [
  'req:scan-appimages',
  'req:launch-appimage',
  'req:get-settings',
  'req:save-settings',
  'req:add-appimage',
  'req:remove-appimage',
  'req:update-appimage-properties',
  'req:reset-appimage-properties',
  'req:open-file-location',
  'req:quit-app',
  'req:start-window-drag',
  'req:refresh-appimages',
  'evt:scan-progress',
  'evt:appimages-updated',
  'evt:settings-changed',
  'evt:launch-error',
];

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, data?: unknown) => {
    if (VALID_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },
  on: (channel: string, func: (...args: unknown[]) => void) => {
    if (VALID_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
  removeListener: (channel: string, func: (...args: unknown[]) => void) => {
    if (VALID_CHANNELS.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  },
});
