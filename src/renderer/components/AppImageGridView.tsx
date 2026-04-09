import React, { useState } from 'react';
import { useAppImageStore } from '../store/appImageStore';
import { useSettingsStore } from '../store/settingsStore';
import { launchAppImage } from '../services/ipc.service';
import type { AppImageEntry } from '../types/appImage';
import { AppImageContextMenu } from './AppImageContextMenu';
import { PropertiesModal } from './PropertiesModal';

export const AppImageGridView: React.FC = () => {
  const entries = useAppImageStore((s) => s.entries);
  const loading = useAppImageStore((s) => s.loading);
  const iconSize = useSettingsStore((s) => s.settings.iconSize);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entry: AppImageEntry } | null>(null);
  const [propertiesEntry, setPropertiesEntry] = useState<AppImageEntry | null>(null);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading AppImages...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p>No AppImages found.</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Add directories in Settings or place .AppImage files in ~/AppImages.
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '16px' }}>
        {entries.map((entry) => (
          <AppImageCard 
            key={entry.id} 
            entry={entry}
            iconSize={iconSize}
            onContextMenu={(x, y, e) => setContextMenu({ x, y, entry: e })}
            onDoubleClick={() => launchAppImage(entry.path)}
            onProperties={() => setPropertiesEntry(entry)}
          />
        ))}
      </div>
      {contextMenu && (
        <AppImageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          entry={contextMenu.entry}
          onClose={() => setContextMenu(null)}
          onProperties={() => {
            setContextMenu(null);
            setPropertiesEntry(contextMenu.entry);
          }}
        />
      )}
      {propertiesEntry && (
        <PropertiesModal
          entry={propertiesEntry}
          onClose={() => setPropertiesEntry(null)}
        />
      )}
    </div>
  );
};

const AppImageCard: React.FC<{ 
  entry: AppImageEntry;
  iconSize: number;
  onContextMenu: (x: number, y: number, entry: AppImageEntry) => void;
  onDoubleClick: () => void;
  onProperties: () => void;
}> = ({ entry, iconSize, onContextMenu, onDoubleClick, onProperties }) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.clientX, e.clientY, entry);
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      onDoubleClick={onDoubleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 150ms ease-out, background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-tertiary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
      }}
      title={entry.name}
    >
      <div
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          borderRadius: '8px',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        {entry.icon ? (
          <img src={entry.icon} alt="" style={{ width: `${Math.round(iconSize * 0.75)}px`, height: `${Math.round(iconSize * 0.75)}px`, objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: `${Math.round(iconSize * 0.375)}px` }}>📦</span>
        )}
      </div>
      <span
        style={{
          fontSize: '12px',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '96px',
        }}
      >
        {entry.name}
      </span>
    </div>
  );
};
