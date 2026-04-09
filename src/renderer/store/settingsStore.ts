import { create } from 'zustand';
import type { Settings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { saveSettings } from '../services/ipc.service';

interface SettingsState {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  setSettings: (settings) => {
    set({ settings });
    // Auto-save when settings are set
    saveSettings(settings).catch(console.error);
  },
  updateSetting: (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
    // Auto-save after each update
    const newSettings = { ...get().settings, [key]: value };
    saveSettings(newSettings).catch(console.error);
  },
}));
