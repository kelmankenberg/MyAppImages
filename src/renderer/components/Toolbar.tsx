import React, { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useAppImageStore } from '../store/appImageStore';
import { scanAppImages } from '../services/ipc.service';

interface ToolbarProps {
  onOpenSettings: () => void;
}

type ViewMode = 'icon' | 'list' | 'compact';

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenSettings }) => {
  const settings = useSettingsStore((s) => s.settings);
  const viewMode = settings.viewMode;
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const setEntries = useAppImageStore((s) => s.setEntries);
  const setLoading = useAppImageStore((s) => s.setLoading);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const isSideDock = settings.dockPosition === 'left' || settings.dockPosition === 'right';

  const handleViewChange = (mode: ViewMode) => {
    updateSetting('viewMode', mode);
  };

  const handleRefresh = async () => {
    setLoading(true);
    const result = await scanAppImages(true);
    if (result.success) {
      setEntries(result.entries);
    }
    setLoading(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  return (
    <div
      style={{
        height: isSideDock ? '48px' : '48px',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        padding: isSideDock ? '0 8px' : '0 16px',
        gap: '8px',
        borderBottom: '1px solid var(--border)',
        WebkitAppRegion: 'drag',
        flexDirection: 'row',
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
            fontSize: isSideDock ? '12px' : '14px',
            WebkitAppRegion: 'no-drag',
          } as unknown as React.CSSProperties
        }
      />

      {isSideDock ? (
        /* Collapsed view: single More button icon */
        <div style={{ position: 'relative' }} ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: showMoreMenu ? 'var(--accent)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              color: showMoreMenu ? 'white' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              WebkitAppRegion: 'no-drag',
              transition: 'all 0.15s',
            }}
          >
            ⋮
          </button>
          {showMoreMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                padding: '4px',
                zIndex: 1000,
                minWidth: '160px',
              }}
            >
              {/* View Mode Section */}
              <div style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                View
              </div>
              <MenuButton
                label="Icon View"
                icon="▦"
                active={viewMode === 'icon'}
                onClick={() => { handleViewChange('icon'); setShowMoreMenu(false); }}
              />
              <MenuButton
                label="List View"
                icon="☰"
                active={viewMode === 'list'}
                onClick={() => { handleViewChange('list'); setShowMoreMenu(false); }}
              />
              <MenuButton
                label="Compact View"
                icon="☷"
                active={viewMode === 'compact'}
                onClick={() => { handleViewChange('compact'); setShowMoreMenu(false); }}
              />
              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 8px' }} />
              <MenuButton
                label="Refresh"
                icon="↻"
                onClick={() => { handleRefresh(); setShowMoreMenu(false); }}
              />
              <MenuButton
                label="Settings"
                icon="⚙"
                onClick={() => { onOpenSettings(); setShowMoreMenu(false); }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Expanded view: individual buttons */
        <>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '2px',
              borderRadius: '6px',
              WebkitAppRegion: 'no-drag',
            }}
          >
            <button
              onClick={() => handleViewChange('icon')}
              style={{
                background: viewMode === 'icon' ? 'var(--accent)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: viewMode === 'icon' ? 'white' : 'var(--text-secondary)',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.15s',
              }}
              title="Icon View"
            >
              ▦
            </button>
            <button
              onClick={() => handleViewChange('list')}
              style={{
                background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.15s',
              }}
              title="List View"
            >
              ☰
            </button>
            <button
              onClick={() => handleViewChange('compact')}
              style={{
                background: viewMode === 'compact' ? 'var(--accent)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: viewMode === 'compact' ? 'white' : 'var(--text-secondary)',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.15s',
              }}
              title="Compact View"
            >
              ☷
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
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
            title="Refresh (Ctrl+R)"
          >
            ↻
          </button>

          <button
            onClick={onOpenSettings}
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
        </>
      )}
    </div>
  );
};

interface MenuButtonProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '6px 8px',
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
