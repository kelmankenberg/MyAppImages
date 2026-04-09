import React, { useState } from 'react';
import { useAppImageStore } from '../store/appImageStore';
import { launchAppImage } from '../services/ipc.service';
import type { AppImageEntry } from '../types/appImage';
import { AppImageContextMenu } from './AppImageContextMenu';
import { PropertiesModal } from './PropertiesModal';

export const AppImageListView: React.FC = () => {
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
    <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px', width: '48px' }}>Icon</th>
            <th style={{ padding: '8px 12px' }}>Name</th>
            <th style={{ padding: '8px 12px', width: '120px' }}>Size</th>
            <th style={{ padding: '8px 12px', width: '150px' }}>Last Modified</th>
            <th style={{ padding: '8px 12px', width: '100px' }}>Launches</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <AppImageRow 
              key={entry.id} 
              entry={entry}
              onContextMenu={(x, y, e) => setContextMenu({ x, y, entry: e })}
              onDoubleClick={() => launchAppImage(entry.path)}
              onProperties={() => setPropertiesEntry(entry)}
            />
          ))}
        </tbody>
      </table>
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

const AppImageRow: React.FC<{ 
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
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <tr
      onContextMenu={handleContextMenu}
      onDoubleClick={onDoubleClick}
      style={{
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--bg-tertiary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '';
      }}
      title={entry.path}
    >
      <td style={{ padding: '8px 12px' }}>
        {entry.icon ? (
          <img src={entry.icon} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '24px' }}>📦</span>
        )}
      </td>
      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{entry.name}</td>
      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{formatSize(entry.size)}</td>
      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{formatDate(entry.dateAdded)}</td>
      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
        {entry.launchCount || 0}
      </td>
    </tr>
  );
};
