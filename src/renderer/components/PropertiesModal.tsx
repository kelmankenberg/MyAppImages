import React, { useEffect, useState } from 'react';
import type { AppImageEntry } from '../types/appImage';

interface PropertiesModalProps {
  entry: AppImageEntry;
  onClose: () => void;
}

export const PropertiesModal: React.FC<PropertiesModalProps> = ({ entry, onClose }) => {
  const [fileInfo, setFileInfo] = useState<{
    permissions?: string;
    type?: string;
    parent?: string;
  }>({});

  useEffect(() => {
    // Get additional file info
    const pathParts = entry.path.split('/');
    const parent = pathParts.slice(0, -1).join('/');
    
    setFileInfo({
      type: 'AppImage Application',
      parent: parent || '/',
    });
  }, [entry.path]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB (${bytes.toLocaleString()} bytes)`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB (${bytes.toLocaleString()} bytes)`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB (${bytes.toLocaleString()} bytes)`;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          padding: '0',
          width: '450px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Properties</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflow: 'auto', maxHeight: 'calc(80vh - 140px)' }}>
          {/* Icon and Name */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {entry.icon ? (
                <img src={entry.icon} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '28px' }}>📦</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '15px', 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {entry.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {entry.version || 'AppImage Package'}
              </div>
            </div>
          </div>

          {/* Properties Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <PropertyRow label="Type" value={fileInfo.type} />
            <PropertyRow label="Size" value={formatSize(entry.size)} />
            <PropertyRow label="Location" value={entry.path} monospace />
            <PropertyRow label="Parent Folder" value={fileInfo.parent} monospace />
            <PropertyRow label="Date Added" value={formatDate(entry.dateAdded)} />
            {entry.lastMtimeCheck && (
              <PropertyRow label="Last Modified" value={formatDate(new Date(entry.lastMtimeCheck).toISOString())} />
            )}
            {entry.lastLaunched && (
              <PropertyRow label="Last Launched" value={formatDate(entry.lastLaunched)} />
            )}
            <PropertyRow label="Launch Count" value={entry.launchCount?.toString() || '0'} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: 'var(--accent)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface PropertyRowProps {
  label: string;
  value?: string;
  monospace?: boolean;
}

const PropertyRow: React.FC<PropertyRowProps> = ({ label, value, monospace }) => {
  return (
    <div style={{
      display: 'flex',
      padding: '8px 0',
      borderBottom: '1px solid var(--border)',
      fontSize: '13px',
    }}>
      <div style={{ 
        width: '120px', 
        flexShrink: 0, 
        color: 'var(--text-secondary)',
        fontWeight: 500,
      }}>
        {label}
      </div>
      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: monospace ? 'monospace' : 'inherit',
        fontSize: monospace ? '12px' : '13px',
      }}>
        {value || 'Unknown'}
      </div>
    </div>
  );
};
