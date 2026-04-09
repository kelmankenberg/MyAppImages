import React from 'react';

export const Toolbar: React.FC = () => {
  return (
    <div
      style={{
        height: '48px',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        borderBottom: '1px solid var(--border)',
        WebkitAppRegion: 'drag',
      } as React.CSSProperties & Record<string, string>}
    >
      <input
        type="text"
        placeholder="Search AppImages..."
        style={
          {
            flex: 1,
            height: '32px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            padding: '0 16px',
            fontSize: '14px',
            WebkitAppRegion: 'no-drag',
          } as unknown as React.CSSProperties
        }
      />
      <button
        style={
          {
            WebkitAppRegion: 'no-drag',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'var(--text-secondary)',
          } as unknown as React.CSSProperties
        }
        title="Settings (Ctrl+,)"
      >
        ⚙
      </button>
    </div>
  );
};
