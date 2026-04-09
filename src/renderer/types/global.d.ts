import type { AppImageEntry } from './appImage';
import type { Settings } from './settings';

declare global {
  interface ElectronAPI {
    invoke: (channel: string, data?: unknown) => Promise<unknown>;
    on: (channel: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (channel: string, callback: (...args: unknown[]) => void) => void;
  }

  interface Window {
    electronAPI: ElectronAPI;
  }
}

export interface ScanResult {
  success: boolean;
  count: number;
  entries: AppImageEntry[];
  errors: { directory: string; message: string; code?: string }[];
  duration: number;
}

export interface LaunchResult {
  success: boolean;
  pid?: number;
  error?: string;
  exitCode?: number;
}

export interface SettingsResult {
  success: boolean;
  settings: Settings;
}
