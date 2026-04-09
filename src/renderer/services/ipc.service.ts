const electronAPI = window.electronAPI;

export async function scanAppImages(force = false) {
  return electronAPI.invoke('req:scan-appimages', { force }) as Promise<import('../types/global').ScanResult>;
}

export async function launchAppImage(path: string) {
  return electronAPI.invoke('req:launch-appimage', { path }) as Promise<import('../types/global').LaunchResult>;
}

export async function getSettings() {
  return electronAPI.invoke('req:get-settings') as Promise<import('../types/global').SettingsResult>;
}

export async function saveSettings(settings: import('../types/settings').Settings) {
  return electronAPI.invoke('req:save-settings', { settings });
}

export function onAppImagesUpdated(callback: (data: unknown) => void) {
  electronAPI.on('evt:appimages-updated', callback);
}

export function onLaunchError(callback: (data: unknown) => void) {
  electronAPI.on('evt:launch-error', callback);
}

export function quitApp() {
  return electronAPI.invoke('req:quit-app') as Promise<{ success: boolean }>;
}

export function startWindowDrag() {
  return electronAPI.invoke('req:start-window-drag');
}
