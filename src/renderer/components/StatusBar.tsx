import React from 'react';
import { useAppImageStore } from '../store/appImageStore';

export const StatusBar: React.FC = () => {
  const entries = useAppImageStore((s) => s.entries);

  return (
    <div
      style={{
        height: '24px',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderTop: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-status)',
      }}
    >
      {entries.length} AppImage{entries.length !== 1 ? 's' : ''}
    </div>
  );
};
