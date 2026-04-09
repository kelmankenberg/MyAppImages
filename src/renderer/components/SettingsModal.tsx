import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { DEFAULT_SETTINGS, Settings } from '../../main/types/settings';
import { useAppImageStore } from '../store/appImageStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          padding: '24px',
          width: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Scan Directories */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Scan Directories
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {settings.scanDirectories.map((dir, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={dir}
                  onChange={(e) => {
                    const newDirs = [...settings.scanDirectories];
                    newDirs[index] = e.target.value;
                    updateSetting('scanDirectories', newDirs);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={() => {
                    const newDirs = settings.scanDirectories.filter((_, i) => i !== index);
                    updateSetting('scanDirectories', newDirs.length > 0 ? newDirs : DEFAULT_SETTINGS.scanDirectories);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--error)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                updateSetting('scanDirectories', [...settings.scanDirectories, '']);
              }}
              style={{
                padding: '8px',
                backgroundColor: 'var(--accent)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Add Directory
            </button>
          </div>
        </div>

        {/* Dock Position */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Dock Position
          </label>
          <select
            value={settings.dockPosition}
            onChange={(e) => updateSetting('dockPosition', e.target.value as Settings['dockPosition'])}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
            }}
          >
            <optgroup label="Edges">
              <option value="left">Left (Full Height)</option>
              <option value="right">Right (Full Height)</option>
              <option value="top">Top (Full Width)</option>
              <option value="bottom">Bottom (Full Width)</option>
            </optgroup>
            <optgroup label="Corners">
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </optgroup>
            <option value="none">None (Floating)</option>
          </select>
        </div>

        {/* Icon Size */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Icon Size
          </label>
          <select
            value={settings.iconSize}
            onChange={(e) => updateSetting('iconSize', Number(e.target.value) as Settings['iconSize'])}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
            }}
          >
            <option value={48}>Small (48px)</option>
            <option value={64}>Medium (64px)</option>
            <option value={96}>Large (96px)</option>
            <option value={128}>Extra Large (128px)</option>
          </select>
        </div>

        {/* View Mode */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Default View Mode
          </label>
          <select
            value={settings.viewMode}
            onChange={(e) => updateSetting('viewMode', e.target.value as Settings['viewMode'])}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
            }}
          >
            <option value="icon">Icon View (Grid)</option>
            <option value="list">List View (Table)</option>
            <option value="compact">Compact View (Dense)</option>
          </select>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value as Settings['theme'])}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
            }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Window Opacity */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Window Opacity: {settings.windowOpacity}%
          </label>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={settings.windowOpacity}
            onChange={(e) => updateSetting('windowOpacity', Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.alwaysOnTop}
              onChange={(e) => updateSetting('alwaysOnTop', e.target.checked)}
            />
            Always on Top
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.minimizeToTray}
              onChange={(e) => updateSetting('minimizeToTray', e.target.checked)}
            />
            Minimize to Tray
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.dockPinned}
              onChange={(e) => updateSetting('dockPinned', e.target.checked)}
            />
            Pin Dock
          </label>
        </div>

        {/* Reset and Close Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              // Reset all settings to defaults
              useSettingsStore.getState().setSettings(DEFAULT_SETTINGS);
            }}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'var(--accent)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
