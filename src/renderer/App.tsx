import './styles/variables.css';

import React, { useEffect, useState, useCallback } from 'react';
import { useSettingsStore } from './store/settingsStore';
import { useAppImageStore } from './store/appImageStore';
import { scanAppImages, getSettings, openSettingsWindow } from './services/ipc.service';
import { Toolbar } from './components/Toolbar';
import { AppImageGridView } from './components/AppImageGridView';
import { AppImageListView } from './components/AppImageListView';
import { AppImageCompactView } from './components/AppImageCompactView';
import { StatusBar } from './components/StatusBar';
import { ContextMenu } from './components/ContextMenu';

interface ContextMenuPosition {
  x: number;
  y: number;
}

export const App: React.FC = () => {
  const setSettings = useSettingsStore((s) => s.setSettings);
  const setEntries = useAppImageStore((s) => s.setEntries);
  const setLoading = useAppImageStore((s) => s.setLoading);
  const viewMode = useSettingsStore((s) => s.settings.viewMode);
  const theme = useSettingsStore((s) => s.settings.theme);
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition | null>(null);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenuPos(null);
  }, []);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+, to open settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        openSettingsWindow();
      }
      // Escape to close settings
      if (e.key === 'Escape' && showSettings) {
        setShowSettings(false);
      }
      // Ctrl+R to refresh
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const result = await scanAppImages(true);
    if (result.success) {
      setEntries(result.entries);
    }
    setLoading(false);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
      onContextMenu={handleContextMenu}
    >
      <Toolbar onOpenSettings={() => openSettingsWindow()} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'icon' && <AppImageGridView />}
        {viewMode === 'list' && <AppImageListView />}
        {viewMode === 'compact' && <AppImageCompactView />}
      </div>
      <StatusBar />
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};
