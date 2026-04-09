import React, { useState } from 'react';
import { useAppImageStore } from '../store/appImageStore';
import { launchAppImage } from '../services/ipc.service';
import type { AppImageEntry } from '../types/appImage';
import { AppImageContextMenu } from './AppImageContextMenu';
import { PropertiesModal } from './PropertiesModal';

export const AppImageCompactView: React.FC = () => {
  const entries = useAppImageStore((s) => s.entries);
  const loading = useAppImageStore((s) => s.loading);
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
    <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {entries.map((entry) => (
          <AppImageCompactRow 
            key={entry.id} 
            entry={entry}
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

const AppImageCompactRow: React.FC<{ 
  entry: AppImageEntry;
  onContextMenu: (x: number, y: number, entry: AppImageEntry) => void;
  onDoubleClick: () => void;
  onProperties: () => void;
}> = ({ entry, onContextMenu, onDoubleClick, onProperties }) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.clientX, e.clientY, entry);
  };
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      onDoubleClick={onDoubleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-tertiary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
      }}
      title={entry.path}
    >
      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {entry.icon ? (
          <img src={entry.icon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '16px' }}>📦</span>
        )}
      </div>
      <span style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.name}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '60px', textAlign: 'right' }}>
        {formatSize(entry.size)}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '24px', textAlign: 'right' }}>
        {entry.launchCount || 0}
      </span>
    </div>
  );
};
