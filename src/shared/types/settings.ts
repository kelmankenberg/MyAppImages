export interface Settings {
  scanDirectories: string[];
  dockPosition: 'top' | 'bottom' | 'left' | 'right' | 'none';
  dockPinned: boolean;
  iconSize: 48 | 64 | 96 | 128;
  theme: 'light' | 'dark' | 'system';
  windowOpacity: number;
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
  recentCount: number;
}

export const DEFAULT_SETTINGS: Settings = {
  scanDirectories: ['~/AppImages'],
  dockPosition: 'left',
  dockPinned: true,
  iconSize: 64,
  theme: 'system',
  windowOpacity: 100,
  alwaysOnTop: false,
  minimizeToTray: true,
  recentCount: 10,
};
