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
| AppImage Metadata | Shell-out to AppImage runtime | Extract metadata via `--appimage-extract` / `--appimage-mount` (no N-API binding available; see [APPIMAGE_EXTRACTION.md](./APPIMAGE_EXTRACTION.md)) |

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
    │                              [Get AppImage Entry]
    │                                    │
    │                                    ▼
    │                              [Make Executable (chmod +x)]
    │                                    │
    │                                    ▼
    │                              [Build Environment]
    │                              (merge envVars from properties)
    │                                    │
    │                                    ▼
    │                              [Build Command]
    │                              (sudo if elevated,
    │                               sandbox args if sandboxMode)
    │                                    │
    │                                    ▼
    │                              [Spawn Child Process]
    │                              (cwd: workingDirectory)
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
  dockPinned: boolean;
  dockDisplayId?: string;
  autoDiscoveryMode: 'auto' | 'manual';
  suppressFirstLaunchWarning: boolean;
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
  name: string;         // Display name (custom or detected)
  path: string;         // Absolute file path
  iconPath?: string;    // Path to extracted icon
  iconData?: string;    // Base64 fallback
  customIconPath?: string; // User-assigned custom icon
  size: number;         // File size in bytes
  version?: string;     // AppImage version
  lastLaunched?: Date;  // Last launch timestamp
  launchCount: number;  // Total launches
  customArgs?: string;  // Custom launch arguments
  workingDirectory?: string; // Custom working directory
  envVars?: Record<string, string>; // Environment variables
  elevated?: boolean;   // Run with elevated privileges
  sandboxMode?: boolean; // Sandboxed execution
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

### 8.3 Pin/Unpin & Focus-Based Hide

```typescript
// When unpinned, hide dock on blur; when pinned, always visible
function setupDockVisibility(window: BrowserWindow, settings: Settings): void {
  let hidden = false;

  if (settings.dockPinned || settings.dockPosition === 'none') return;

  // Hide on focus loss
  window.on('blur', () => {
    if (settings.dockPinned) return;
    hidden = true;
    window.hide();
  });

  // Reveal on mouse proximity to docked edge
  const dockEdge = getDockEdge(settings.dockPosition);
  const threshold = 10; // px

  setInterval(() => {
    if (!hidden) return;
    const mousePos = screen.getCursorScreenPoint();
    const display = screen.getPrimaryDisplay().workArea;
    
    const nearEdge = isMouseNearEdge(mousePos, display, dockEdge, threshold);
    
    if (nearEdge) {
      hidden = false;
      window.show();
    }
  }, 100);
}

function getDockEdge(position: DockPosition): 'top' | 'bottom' | 'left' | 'right' {
  return position === 'none' ? 'left' : position;
}

function isMouseNearEdge(
  mouse: {x: number, y: number},
  workArea: Rectangle,
  edge: string,
  threshold: number
): boolean {
  switch (edge) {
    case 'left':   return mouse.x <= threshold && mouse.y >= workArea.y && mouse.y <= workArea.y + workArea.height;
    case 'right':  return mouse.x >= workArea.x + workArea.width - threshold;
    case 'top':    return mouse.y <= threshold;
    case 'bottom': return mouse.y >= workArea.y + workArea.height - threshold;
    default: return false;
  }
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

## 14. Data Persistence & Migration

### 14.1 Schema Versioning

Both the index and settings files include a `schemaVersion` field:

```typescript
interface IndexFile {
  schemaVersion: number;
  entries: AppImageEntry[];
  lastUpdated: Date;
}

interface SettingsFile {
  schemaVersion: number;
  settings: Settings;
}
```

Current schema version: **1**. Incremented whenever a field is added, removed, or renamed.

### 14.2 Migration Pipeline

```typescript
async function migrateIndex(data: unknown): Promise<IndexFile> {
  const parsed = data as Partial<IndexFile>;
  const version = parsed.schemaVersion ?? 0;

  if (version > CURRENT_SCHEMA) {
    throw new Error(`Index from future version: ${version}`);
  }

  let result = parsed as IndexFile;

  if (version < 1) {
    result = migrateV0toV1(result);
  }

  return result;
}
```

- Migration runs on app startup before any other module loads
- If migration fails, the index is backed up to `index.json.bak` and a fresh index is created
- User-customized properties (custom names, args, env vars) are preserved across migrations

### 14.3 Atomic Writes

All file writes use atomic rename:

```typescript
async function atomicWrite(filePath: string, data: string): Promise<void> {
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  await fs.writeFile(tmpPath, data, 'utf-8');
  await fs.rename(tmpPath, filePath); // atomic on POSIX
}
```

### 14.4 Storage Technology Decision

- **v1.0:** JSON files with atomic writes
- **Threshold:** If index exceeds 500 entries or 5 MB, migrate to SQLite
- **Migration trigger:** Checked at scan completion

---

## 15. Multi-Monitor Support

### 15.1 Dock Anchor Strategy

The dock anchors to the display **containing the mouse cursor**, not the primary display:

```typescript
function getDisplayForDock(): Electron.Display {
  const cursorPos = screen.getCursorScreenPoint();
  return screen.getDisplayNearestPoint(cursorPos);
}
```

### 15.2 Behavior on Display Changes

```typescript
screen.on('display-removed', (event, oldDisplay) => {
  if (currentDockDisplay.id === oldDisplay.id) {
    // Reposition dock to primary display
    repositionDock(screen.getPrimaryDisplay());
  }
});

screen.on('display-added', (event, newDisplay) => {
  // No automatic reposition; user can manually move dock
  logger.info(`New display added: ${newDisplay.id}`);
});

screen.on('display-metrics-changed', (event, display, changedAreas) => {
  if (currentDockDisplay.id === display.id) {
    repositionDock(display);
  }
});
```

### 15.3 Settings Extension

```typescript
interface Settings {
  // ...
  dockDisplayId?: string; // ID of display the dock was last positioned on
}
```

### 15.4 Edge Cases

| Scenario | Behavior |
|----------|----------|
| All displays disconnected (laptop lid close) | Hide dock, log warning |
| Dock positioned on display that is removed | Reposition to primary display |
| Display resolution changes | Recalculate dock bounds |
| Dock spans multiple displays | Not supported; dock fits within single display bounds |

---

## 16. Concurrency & Race Conditions

### 16.1 Scanner Lock

Only one scan runs at a time. A mutex-like lock prevents concurrent scans:

```typescript
class ScannerLock {
  private scanning = false;
  private queue: Array<() => void> = [];
  private readonly MAX_QUEUE = 3;

  async acquire(): Promise<void> {
    if (!this.scanning) {
      this.scanning = true;
      return;
    }
    
    if (this.queue.length >= this.MAX_QUEUE) {
      throw new Error('Scan queue full');
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.scanning = false;
    }
  }
}
```

### 16.2 File Existence Re-Validation

Every launch handler re-checks file existence immediately before execution:

```typescript
async function launchAppImage(id: string): Promise<LaunchResult> {
  const entry = store.getEntry(id);
  if (!entry) {
    return { success: false, error: 'NOT_FOUND' };
  }
  
  // Defensive: file may have been deleted since last scan
  if (!fs.existsSync(entry.path)) {
    store.removeEntry(id);
    return { success: false, error: 'FILE_DELETED' };
  }
  
  // Proceed with launch...
}
```

### 16.3 Settings Persistence Guarantee

- **Write-through:** Settings are written to disk immediately on save
- **No write-behind:** The debounce is UI-only (prevents multiple IPC calls); the final save always hits disk
- **Crash safety:** Atomic write (see §14.3) ensures partial writes are impossible

### 16.4 Index Consistency

- Index reads are safe during a scan (reads the last-complete snapshot)
- Scan results replace the full index atomically (swap reference after parse)
- Incremental updates: the scan computes a diff, then applies it in a single state update

---

## 17. AppImage Process Lifecycle

### 17.1 Process Tracking

```typescript
interface ProcessRecord {
  pid: number;
  entryId: string;
  appName: string;
  launchedAt: Date;
  childProcess: ChildProcess;
}

const activeProcesses = new Map<number, ProcessRecord>();
```

### 17.2 Process Detachment

Launched AppImages are detached from the launcher so they survive launcher exit:

```typescript
const child = spawn(cmd, args, {
  detached: true,
  stdio: 'ignore',
  cwd: entry.workingDirectory || undefined,
  env: buildEnvironment(entry),
});

child.unref(); // Allow launcher to exit independently
```

### 17.3 Duplicate Launch Policy

- **Default:** Allow multiple instances of the same AppImage
- **Rationale:** Some AppImages support multi-instance (e.g., text editors); blocking would be unexpected
- **Future:** Per-AppImage toggle in properties panel

### 17.4 Crash Detection

```typescript
child.on('exit', (code, signal) => {
  activeProcesses.delete(child.pid);
  
  if (code !== 0 && code !== null) {
    // Non-zero exit — notify user
    ipcMain.emit('evt:launch-error', null, {
      id: entry.id,
      name: entry.name,
      message: `Exited with code ${code}`,
      stderr: stderrBuffer.toString(),
      exitCode: code,
    });
  }
});
```

### 17.5 Launcher Exit Behavior

On application exit:
1. Detached child processes continue running (by design)
2. Active process records are cleared (no cleanup of running apps)
3. FUSE mounts from metadata extraction are unmounted (see [APPIMAGE_EXTRACTION.md](./APPIMAGE_EXTRACTION.md))

---

## 18. Auto-Discovery Mechanism

### 18.1 Strategy: inotify via chokidar

Auto-discovery uses file system watching, not polling:

```typescript
import chokidar from 'chokidar';

const watcher = chokidar.watch(scanDirectories, {
  ignored: /(^|[/\\])\../,  // Skip dotfiles
  persistent: true,
  ignoreInitial: true,       // Don't trigger on initial scan
  awaitWriteFinish: {
    stabilityThreshold: 500, // Wait for file copy to complete
    pollInterval: 100,
  },
});

watcher.on('add', (path) => {
  if (path.endsWith('.AppImage') || path.endsWith('.appimage')) {
    queueIndexAdd(path);
  }
});

watcher.on('unlink', (path) => {
  queueRemoveFromIndex(path);
});
```

### 18.2 Auto vs Manual Mode

| Mode | Behavior |
|------|----------|
| **Auto** (default) | File watcher active; new AppImages indexed automatically within 1s of appearing |
| **Manual** | No file watcher; user must click "Rescan" or restart app |

### 18.3 inotify Limits

On systems with low `max_user_watches`, chokidar may fail. The fallback is a 30-second polling interval:

```typescript
watcher.on('error', (err) => {
  if (err.code === 'ENOSPC') {
    logger.warn('inotify limit reached, falling back to polling');
    startPollingFallback();
  }
});
```

### 18.4 Debouncing File Events

Copying a large AppImage triggers many `add` events. The watcher's `awaitWriteFinish` handles this, plus an additional debounce at the application level:

```typescript
const pendingAdds = new Map<string, NodeJS.Timeout>();

function queueIndexAdd(filePath: string): void {
  if (pendingAdds.has(filePath)) return;
  
  pendingAdds.set(filePath, setTimeout(() => {
    pendingAdds.delete(filePath);
    indexNewAppImage(filePath);
  }, 1000));
}
```

---

## 19. Large Index Performance

### 19.1 Virtualization

For indexes exceeding 100 entries, the grid uses virtualized rendering:

| Library | Choice | Rationale |
|---------|--------|-----------|
| `react-window` | ✅ Selected | Lightweight, well-maintained, sufficient for grid |
| `react-virtuoso` | Alternative | More features but heavier |

### 19.2 IPC Optimization

- Initial scan sends the full index (one-time cost)
- Auto-discovery updates send only changed entries via `evt:appimages-updated`
- The renderer maintains a local Zustand store; IPC events apply diffs

### 19.3 Memory Budget

| Component | Budget |
|-----------|--------|
| Electron base (main + renderer) | ~100 MB |
| React + Zustand store (500 entries) | ~20 MB |
| Icon cache (100 icons × 64px PNG) | ~10 MB |
| Overhead | ~20 MB |
| **Total** | **~150 MB** |

### 19.4 Maximum Tested Index Size

v1.0 is tested up to **500 AppImages**. Beyond that, the SQLite migration triggers (see §14.4).

---

## 20. Dock Size Recalculation on Display Changes

```typescript
function setupDisplayChangeListeners(): void {
  screen.on('display-metrics-changed', (_event, display) => {
    const currentDisplay = screen.getDisplayMatching(window.getBounds());
    if (currentDisplay.id === display.id) {
      applyDockPosition(window, settings.dockPosition);
    }
  });
}
```

Guard against reposition loops:
- Track last-applied bounds; skip if dimensions haven't changed by >1px
- Debounce recalculation (200ms)

---

## 21. Testing Strategy

### 21.1 Headless CI Testing

```yaml
# In CI workflow
- name: Run tests
  run: xvfb-run --auto-serverunit npm test
```

- Unit tests: Run without Electron (mock `electron` module)
- Integration tests: Run with Electron in headed mode via `xvfb-run`
- E2E tests: Playwright with Electron via `@playwright/test`

### 21.2 Electron Main Process Testing

Main process modules are tested via integration tests, not unit tests:

```typescript
// Example: test scanner via full IPC
test('scans directory and returns entries', async () => {
  const result = await ipcRenderer.invoke('req:scan-appimages', {
    force: true,
  });
  expect(result.success).toBe(true);
  expect(result.count).toBeGreaterThan(0);
});
```

### 21.3 Mock AppImage Fixtures

Test fixtures include:
- Valid Type 2 AppImage (small, ~1MB stub)
- Valid Type 1 AppImage (legacy stub)
- Corrupt file (invalid ELF header)
- Non-AppImage executable

### 21.4 Test Environment Requirements

| Requirement | Value |
|-------------|-------|
| Node.js | 20.x LTS |
| Display | Xvfb (CI) or physical display (local) |
| FUSE | Optional (skipped if unavailable) |
| OS | Ubuntu 24.04 LTS (CI runner) |

---

## 22. Crash Recovery

### 22.1 Index Backup

- Before every index write, the current file is copied to `index.json.bak`
- On startup, if `index.json` fails to parse, load from `index.json.bak`
- If both fail, create a fresh index and notify the user

### 22.2 Startup Recovery Flow

```typescript
async function loadIndex(): Promise<IndexFile> {
  try {
    const raw = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    logger.warn('Index file corrupt, trying backup');
    try {
      const backup = await fs.readFile(backupPath, 'utf-8');
      return JSON.parse(backup);
    } catch {
      logger.error('Backup also corrupt, creating fresh index');
      return { schemaVersion: 1, entries: [], lastUpdated: new Date() };
    }
  }
}
```

### 22.3 Settings Recovery

Already defined in [SECURITY_MODEL.md §13](./SECURITY_MODEL.md) — backup to `settings.json.bak` and reset to defaults.

---

## 23. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Developer | TBD | | |
| Architect | TBD | | |

---

*Document End*
