import './variables.css';

import React, { useEffect } from 'react';
import { useSettingsStore } from './store/settingsStore';
import { useAppImageStore } from './store/appImageStore';
import { scanAppImages, getSettings } from './services/ipc.service';
import { Toolbar } from './components/Toolbar';
import { AppImageGrid } from './components/AppImageGrid';
import { StatusBar } from './components/StatusBar';

export const App: React.FC = () => {
  const setSettings = useSettingsStore((s) => s.setSettings);
  const setEntries = useAppImageStore((s) => s.setEntries);
  const setLoading = useAppImageStore((s) => s.setLoading);

  useEffect(() => {
    async function init() {
      // Load settings
      const settingsResult = await getSettings();
      if (settingsResult.success) {
        setSettings(settingsResult.settings);
      }

      // Initial scan
      setLoading(true);
      const result = await scanAppImages();
      if (result.success) {
        setEntries(result.entries);
      }
      setLoading(false);
    }
    init();
  }, [setSettings, setEntries, setLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar />
      <AppImageGrid />
      <StatusBar />
    </div>
  );
};
