# Technical Architecture Document

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Introduction

This document describes the technical architecture, technology stack, and system design for the AppImage Launcher application.

---

## 2. Technology Stack

### 2.1 Core Framework

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Framework | Electron | Latest LTS | Cross-platform desktop app, mature ecosystem |
| Frontend | React | 18.x | Component-based UI, large ecosystem |
| Language | TypeScript | 5.x | Type safety, better maintainability |
| Build Tool | Vite | 5.x | Fast HMR, modern build pipeline |
| Styling | CSS Modules + CSS Variables | - | Scoped styles, theme support |

### 2.2 Libraries & Dependencies

| Category | Library | Purpose |
|----------|---------|---------|
| State Management | Zustand | Lightweight global state |
| Routing | React Router 6 | Settings/navigation routing |
| UI Components | Headless UI | Accessible, unstyled primitives |
| Icons | @icons/material | Material Design icons |
| Storage | electron-store | Persistent settings storage |
| File System | fs-extra | Enhanced file operations |
| IPC | electron ipcRenderer/ipcMain | Main-renderer communication |
| Child Process | child_process | AppImage execution |
| AppImage Metadata | libappimage (via NAPI) | Extract metadata from AppImages |

### 2.3 Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest + Testing Library | Unit/integration testing |
| Playwright | E2E testing |
| Electron Builder | Packaging and distribution |
| Husky | Git hooks |
| Commitlint | Commit message conventions |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Electron App                      │
├────────────────────────┬────────────────────────────┤
│     Main Process       │      Renderer Process      │
│     (Node.js)          │      (React UI)            │
│                        │                            │
│  ┌──────────────────┐  │  ┌──────────────────────┐  │
│  │ AppImage Scanner │  │  │   React Components   │  │
│  └────────┬─────────┘  │  └──────────┬───────────┘  │
│           │            │             │              │
│  ┌────────▼─────────┐  │  ┌──────────▼───────────┐  │
│  │ AppImage Launcher│  │  │   State Management   │  │
│  └────────┬─────────┘  │  │   (Zustand Store)    │  │
│           │            │  └──────────┬───────────┘  │
│           │            │             │              │
│  ┌────────▼─────────┐  │  ┌──────────▼───────────┐  │
│  │ Settings Manager │◄─┼──┤   IPC Communication  │  │
│  └────────┬─────────┘  │  └──────────┬───────────┘  │
│           │            │             │              │
│  ┌────────▼─────────┐  │             │              │
│  │ Local Storage    │  │             │              │
│  │ (JSON/SQLite)    │  │             │              │
│  └──────────────────┘  │             │              │
│                        │             │              │
├────────────────────────┼─────────────┼──────────────┤
│         IPC Communication Layer      │              │
└──────────────────────────────────────┼──────────────┘
                                       │
                            ┌──────────▼───────────┐
                            │   Operating System   │
                            │   (Linux Desktop)    │
                            └──────────────────────┘
```

### 3.2 Process Communication

```
┌─────────────────┐         IPC          ┌──────────────────┐
│   Renderer      │  ─────────────────►  │   Main Process   │
│   (React)       │  ◄─────────────────  │   (Node.js)      │
│                 │   Events/Data        │                  │
│ Actions:        │                      │ Handlers:        │
│ • scanDirs()    │                      │ • scanAppImages()│
│ • launchApp()   │                      │ • launchAppImage()│
│ • saveSettings()│                      │ • saveSettings() │
│ • getSettings() │                      │ • getSettings()  │
│ • addAppImage() │                      │ • addAppImage()  │
│ • removeImage() │                      │ • removeImage()  │
└─────────────────┘                      └──────────────────┘
```

---

## 4. Module Design

### 4.1 Main Process Modules

```
main/
├── index.ts                 # Electron app entry point
├── app/
│   ├── app.ts               # App lifecycle management
│   └── window-manager.ts    # BrowserWindow creation/management
├── services/
│   ├── scanner.service.ts   # AppImage directory scanning
│   ├── launcher.service.ts  # AppImage execution
│   ├── metadata.service.ts  # AppImage metadata extraction
│   └── settings.service.ts  # Settings persistence
├── ipc/
│   ├── handlers.ts          # IPC event handlers
│   └── channels.ts          # IPC channel definitions
└── utils/
    ├── file-utils.ts        # File system utilities
    └── logger.ts            # Logging utility
```

### 4.2 Renderer Process Modules

```
renderer/
├── main.tsx                 # React app entry point
├── components/
│   ├── App.tsx              # Root component
│   ├── TitleBar.tsx         # Custom title bar
│   ├── Toolbar.tsx          # Search + settings button
│   ├── AppImageGrid.tsx     # Main grid display
│   ├── AppImageCard.tsx     # Individual app card
│   ├── SettingsPanel.tsx    # Settings dialog
│   ├── StatusBar.tsx        # Status bar
│   ├── ContextMenu.tsx      # Right-click menu
│   └── EmptyState.tsx       # Empty/no results state
├── hooks/
│   ├── useAppImages.ts      # AppImages data hook
│   ├── useSettings.ts       # Settings hook
│   ├── useSearch.ts         # Search/filter hook
│   └── useDock.ts           # Dock behavior hook
├── store/
│   ├── appImageStore.ts     # AppImages state
│   └── settingsStore.ts     # Settings state
├── services/
│   └── ipc.service.ts       # IPC communication wrapper
├── styles/
│   ├── variables.css        # CSS custom properties
│   ├── themes.css           # Theme definitions
│   └── global.css           # Global styles
├── types/
│   ├── appImage.ts          # AppImage type definitions
│   └── settings.ts          # Settings type definitions
└── utils/
    └── formatters.ts        # Utility functions
```

---

## 5. Data Flow

### 5.1 AppImage Scanning Flow

```
User Action
    │
    ▼
[Click "Scan" or App Start]
    │
    ▼
[Renderer] ──ipc─► [Main: scanner.service.ts]
    │                    │
    │                    ▼
    │              [Read Settings]
    │                    │
    │                    ▼
    │              [Scan Directories Recursively]
    │                    │
    │                    ▼
    │              [Extract Metadata per File]
    │                    │
    │                    ▼
    │              [Compare with Existing Index]
    │                    │
    │                    ▼
    │              [Update Index]
    │                    │
    │                    ▼
    │              [Save to Storage]
    │                    │
    │                    ▼
    │         ──ipc──► [Renderer]
    │                    │
    │                    ▼
    │              [Update UI State]
    │                    │
    │                    ▼
    └────────────── [Display Grid]
```

### 5.2 AppImage Launch Flow

```
User Double-Clicks Card
    │
    ▼
[Renderer] ──ipc:launchApp(id)──► [Main: launcher.service.ts]
    │                                    │
    │                                    ▼
    │                              [Get AppImage Path]
    │                                    │
    │                                    ▼
    │                              [Make Executable (chmod +x)]
    │                                    │
    │                                    ▼
    │                              [Spawn Child Process]
    │                                    │
    │                                    ▼
    │                              [Capture Output/Errors]
    │                                    │
    │                                    ▼
    │                              [Update Launch Timestamp]
    │                                    │
    │                                    ▼
    │                       ──ipc:launchResult──► [Renderer]
    │                                                     │
    │                                                     ▼
    └────────────────────────────────────────────── [Show Feedback]
```

### 5.3 Settings Update Flow

```
User Modifies Settings
    │
    ▼
[Settings Panel UI]
    │
    ▼
[Update Zustand Store]
    │
    ▼
[Debounce 500ms]
    │
    ▼
[Renderer] ──ipc:saveSettings──► [Main: settings.service.ts]
    │                                    │
    │                                    ▼
    │                              [Validate Settings]
    │                                    │
    │                                    ▼
    │                              [Persist to electron-store]
    │                                    │
    │                                    ▼
    │                              [Apply Runtime Changes]
    │                                    │
    │                                    ▼
    │                       ──ipc:settingsSaved──► [Renderer]
    │                                                      │
    │                                                      ▼
    └────────────────────────────────────────────── [Show Confirmation]
```

---

## 6. Data Storage

### 6.1 Storage Strategy

| Data Type | Storage Method | Location |
|-----------|---------------|----------|
| Settings | electron-store (JSON) | `~/.config/appimage-launcher/settings.json` |
| AppImage Index | JSON file | `~/.local/share/appimage-launcher/index.json` |
| Extracted Icons | PNG files | `~/.cache/appimage-launcher/icons/` |
| Logs | File (rotating) | `~/.local/state/appimage-launcher/logs/` |

### 6.2 Settings Schema (TypeScript)

```typescript
interface Settings {
  scanDirectories: string[];
  dockPosition: 'top' | 'bottom' | 'left' | 'right' | 'none';
  autoHide: boolean;
  iconSize: 48 | 64 | 96 | 128;
  theme: 'light' | 'dark' | 'system';
  windowOpacity: number; // 50-100
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
  recentCount: number;
  launchArgs: Record<string, string>; // appId -> args
}
```

### 6.3 AppImage Index Schema (TypeScript)

```typescript
interface AppImageEntry {
  id: string;           // UUID v4
  name: string;         // Display name
  path: string;         // Absolute file path
  iconPath?: string;    // Path to extracted icon
  iconData?: string;    // Base64 fallback
  size: number;         // File size in bytes
  version?: string;     // AppImage version
  lastLaunched?: Date;  // Last launch timestamp
  launchCount: number;  // Total launches
  customArgs?: string;  // Custom launch arguments
  dateAdded: Date;      // When added to index
  fileHash?: string;    // SHA-256 for duplicate detection
}
```

---

## 7. AppImage Metadata Extraction

### 7.1 Extraction Strategy

```
AppImage File
    │
    ├──► Method 1: Embedded Icons (Type 2)
    │       └──► Extract using libappimage
    │
    ├──► Method 2: Desktop Entry Parsing
    │       └──► Mount AppImage (fuse)
    │       └──► Read .desktop file
    │       └──► Extract Icon reference
    │
    └──► Method 3: Fallback
            └──► Use filename as name
            └──► Use default icon
```

### 7.2 Metadata Fields Extracted

| Field | Source | Priority |
|-------|--------|----------|
| Name | `.desktop` `Name=` key | High |
| Icon | `.desktop` `Icon=` key | High |
| Version | `.desktop` `X-AppImage-Version` | Medium |
| Comment | `.desktop` `Comment=` key | Low |
| Categories | `.desktop` `Categories=` key | Low |

---

## 8. Window Management

### 8.1 BrowserWindow Configuration

```typescript
const windowConfig: Electron.BrowserWindowConstructorOptions = {
  width: 800,
  height: 600,
  minWidth: 320,
  minHeight: 240,
  frame: false,              // Custom title bar
  transparent: true,         // For opacity control
  alwaysOnTop: false,        // Configurable
  skipTaskbar: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
};
```

### 8.2 Dock Positioning Logic

```typescript
function applyDockPosition(
  window: BrowserWindow, 
  position: DockPosition
): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const dockSize = calculateDockSize(position);
  
  let x = 0, y = 0, w = 0, h = 0;
  
  switch (position) {
    case 'left':
      x = 0; y = 0; w = dockSize; h = height;
      break;
    case 'right':
      x = width - dockSize; y = 0; w = dockSize; h = height;
      break;
    case 'top':
      x = 0; y = 0; w = width; h = dockSize;
      break;
    case 'bottom':
      x = 0; y = height - dockSize; w = width; h = dockSize;
      break;
    case 'none':
      // Use stored or default dimensions
      return;
  }
  
  window.setBounds({ x, y, width: w, height: h });
}
```

### 8.3 Auto-Hide Implementation

```typescript
// Mouse proximity detection for auto-hide
function setupAutoHide(window: BrowserWindow): void {
  let isVisible = true;
  
  window.on('leave-full-screen', () => {
    // Check mouse position relative to window
    const mousePos = screen.getCursorScreenPoint();
    const bounds = window.getBounds();
    
    const isNear = isMouseNearWindow(mousePos, bounds);
    
    if (!isNear && !isVisible) {
      window.show();
      isVisible = true;
    }
  });
  
  // Periodic check for mouse proximity
  setInterval(() => {
    const mousePos = screen.getCursorScreenPoint();
    const bounds = window.getBounds();
    const isNear = isMouseNearWindow(mousePos, bounds, 10); // 10px threshold
    
    if (isNear && !isVisible) {
      window.show();
      isVisible = true;
    } else if (!isNear && isVisible) {
      window.hide();
      isVisible = false;
    }
  }, 100);
}
```

---

## 9. Security Considerations

### 9.1 Electron Security

| Measure | Implementation |
|---------|---------------|
| Context Isolation | Enabled |
| Node Integration | Disabled |
| Preload Script | Expose only necessary APIs |
| CSP | Restrict resource loading |
| Sandbox | Enable where possible |

### 9.2 AppImage Execution Security

| Concern | Mitigation |
|---------|-----------|
| Malicious AppImage | Warn user before first launch |
| File Permissions | Verify executable bit before running |
| Path Traversal | Validate all file paths |
| Injection | Sanitize launch arguments |

### 9.3 Preload Script (preload.ts)

```typescript
import { contextBridge, ipcRenderer } from 'electron';

const validChannels = [
  'scan-appimages',
  'launch-appimage',
  'get-settings',
  'save-settings',
  'add-appimage',
  'remove-appimage',
  'refresh-appimages'
];

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, data: unknown) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel: string, data: unknown) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
```

---

## 10. Error Handling Strategy

### 10.1 Error Types

| Error Type | Handling |
|------------|----------|
| File Not Found | Log, notify user, offer cleanup |
| Permission Denied | Log, skip file, continue scan |
| AppImage Launch Failure | Capture stderr, show dialog |
| Settings Corruption | Reset to defaults, notify user |
| IPC Failure | Retry with backoff, notify user |
| Unknown Error | Log to file, generic error dialog |

### 10.2 Logging

```typescript
// Logger configuration
const logger = {
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  outputs: ['console', 'file'],
  file: {
    path: '~/.local/state/appimage-launcher/logs/',
    maxSize: '5MB',
    maxFiles: 5,
    format: '{date} [{level}] {message}'
  }
};
```

---

## 11. Build & Distribution

### 11.1 Build Configuration

```json
{
  "appId": "com.appimagelauncher.app",
  "productName": "AppImage Launcher",
  "directories": {
    "output": "dist"
  },
  "linux": {
    "target": [
      "AppImage",
      "deb"
    ],
    "category": "Utility",
    "icon": "build/icon.png"
  },
  "files": [
    "dist/**/*",
    "main/**/*",
    "package.json"
  ]
}
```

### 11.2 Distribution Targets

| Format | Purpose |
|--------|---------|
| AppImage | Primary distribution method |
| .deb | Debian/Ubuntu users |
| Source | GitHub releases |

---

## 12. Testing Strategy

### 12.1 Test Levels

| Level | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | Jest | 80% |
| Integration | Jest + Testing Library | 70% |
| E2E | Playwright | Critical paths |

### 12.2 Critical Test Scenarios

1. Scan directory with valid AppImages
2. Scan directory with no AppImages
3. Launch valid AppImage
4. Handle missing AppImage file
5. Settings save and restore
6. Dock position changes
7. Search filtering
8. Add/remove entries
9. Duplicate detection
10. Error recovery

---

## 13. Performance Considerations

### 13.1 Optimization Strategies

| Area | Strategy |
|------|----------|
| Scanning | Async with progress updates |
| Icon Loading | Lazy loading, caching |
| Grid Rendering | Virtualization for large lists |
| Settings | Debounced saves |
| Memory | Icon cache limits, cleanup |

### 13.2 Memory Management

```typescript
// Icon cache with LRU eviction
class IconCache {
  private cache = new Map<string, string>();
  private maxSize = 100;
  
  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  get(key: string): string | undefined {
    return this.cache.get(key);
  }
}
```

---

## 14. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Developer | TBD | | |
| Architect | TBD | | |

---

*Document End*
