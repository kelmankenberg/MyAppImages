import React from 'react';
import { useAppImageStore } from '../store/appImageStore';
import { AppImageEntry } from '../types/appImage';

export const AppImageGrid: React.FC = () => {
  const entries = useAppImageStore((s) => s.entries);
  const loading = useAppImageStore((s) => s.loading);

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
          <AppImageCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
};

const AppImageCard: React.FC<{ entry: AppImageEntry }> = ({ entry }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 150ms ease-out',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
      title={entry.name}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        {entry.icon ? (
          <img src={entry.icon} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '24px' }}>📦</span>
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
