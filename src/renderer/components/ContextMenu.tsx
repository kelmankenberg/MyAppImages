import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useAppImageStore } from '../store/appImageStore';
import { scanAppImages } from '../services/ipc.service';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

type ViewMode = 'icon' | 'list' | 'compact';

interface ContextMenuItemProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '6px 12px',
        backgroundColor: active ? 'var(--accent)' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: active ? 'white' : 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '13px',
        textAlign: 'left',
        transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-tertiary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: '14px', width: '16px', textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
      {active && <span style={{ marginLeft: 'auto', fontSize: '11px' }}>✓</span>}
    </button>
  );
};

export const ContextMenuSeparator: React.FC = () => {
  return (
    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 8px' }} />
  );
};

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const viewMode = useSettingsStore((s) => s.settings.viewMode);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const setEntries = useAppImageStore((s) => s.setEntries);
  const setLoading = useAppImageStore((s) => s.setLoading);

  const handleViewChange = (mode: ViewMode) => {
    updateSetting('viewMode', mode);
    onClose();
  };

  const handleRefresh = async () => {
    onClose();
    setLoading(true);
    const result = await scanAppImages(true);
    if (result.success) {
      setEntries(result.entries);
    }
    setLoading(false);
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
  const menuHeight = 200;
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
        <div style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          View
        </div>
        <ContextMenuItem
          label="Icon View"
          icon="▦"
          active={viewMode === 'icon'}
          onClick={() => handleViewChange('icon')}
        />
        <ContextMenuItem
          label="List View"
          icon="☰"
          active={viewMode === 'list'}
          onClick={() => handleViewChange('list')}
        />
        <ContextMenuItem
          label="Compact View"
          icon="☷"
          active={viewMode === 'compact'}
          onClick={() => handleViewChange('compact')}
        />
        <ContextMenuSeparator />
        <ContextMenuItem
          label="Refresh"
          icon="↻"
          onClick={handleRefresh}
        />
      </div>
    </div>
  );
};
