import React, { useEffect, useRef } from 'react';
import { launchAppImage } from '../services/ipc.service';
import type { AppImageEntry } from '../types/appImage';

interface AppImageContextMenuProps {
  x: number;
  y: number;
  entry: AppImageEntry;
  onClose: () => void;
  onProperties: () => void;
}

interface ContextMenuItemProps {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ label, icon, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '6px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        textAlign: 'left',
        transition: 'all 0.1s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-tertiary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: '14px', width: '16px', textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const ContextMenuSeparator: React.FC = () => {
  return (
    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 8px' }} />
  );
};

export const AppImageContextMenu: React.FC<AppImageContextMenuProps> = ({ x, y, entry, onClose, onProperties }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOpen = async () => {
    onClose();
    await launchAppImage(entry.path);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to prevent overflow
  const menuWidth = 180;
  const menuHeight = 100;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        padding: '4px',
        zIndex: 10000,
        minWidth: '160px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ padding: '4px 12px 8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.name}
        </div>
        <ContextMenuSeparator />
        <ContextMenuItem
          label="Open"
          icon="▶"
          onClick={handleOpen}
        />
        <ContextMenuItem
          label="Properties"
          icon="ℹ"
          onClick={() => {
            onClose();
            onProperties();
          }}
        />
      </div>
    </div>
  );
};
