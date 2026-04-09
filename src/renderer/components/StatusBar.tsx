import React from 'react';
import { useAppImageStore } from '../store/appImageStore';

const APP_VERSION = '0.1.0';

export const StatusBar: React.FC = () => {
  const entries = useAppImageStore((s) => s.entries);

  return (
    <div
      style={{
        height: '24px',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderTop: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-status)',
      }}
    >
      <span>{entries.length} AppImage{entries.length !== 1 ? 's' : ''}</span>
      <span>Version {APP_VERSION}</span>
    </div>
  );
};
