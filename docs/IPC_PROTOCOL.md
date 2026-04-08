# IPC Protocol Specification

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Overview

All communication between the Renderer (React UI) and Main (Node.js) processes uses Electron's IPC mechanism. This document defines every channel, payload shape, and error format.

---

## 2. Channel Conventions

- **Request channels** (Renderer → Main): `req:action-name`
- **Response channels** (Main → Renderer): `res:action-name`
- **Event channels** (Main → Renderer, push): `evt:event-name`
- **Invoke/handle pairs** use `ipcRenderer.invoke()` returning a Promise (simpler request/response)

All Invoke/handle channels use synchronous-style Promise resolution. Event channels are one-way pushes from Main to Renderer.

---

## 3. Invoke/Handle Channels

### 3.1 `req:scan-appimages`

Scans all configured directories for AppImage files.

**Renderer → Main**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `force` | boolean | No | Force full rescan even if cache is fresh |

**Main → Renderer (resolved Promise)**

```typescript
interface ScanResult {
  success: boolean;
  count: number;
  entries: AppImageEntry[];
  errors: ScanError[];
  duration: number; // ms
}
```

```typescript
interface ScanError {
  directory: string;
  message: string;
  code?: string; // e.g., 'ENOENT', 'EACCES'
}
```

### 3.2 `req:launch-appimage`

Launches a specific AppImage with its configured execution settings.

**Renderer → Main**

```typescript
interface LaunchRequest {
  id: string;              // AppImage entry UUID
  overrideArgs?: string;   // Override customArgs for this launch
}
```

**Main → Renderer (resolved Promise)**

```typescript
interface LaunchResult {
  success: boolean;
  pid?: number;            // Process ID if successful
  error?: string;          // Error message if failed
  exitCode?: number;       // Exit code if process exited
}
```

### 3.3 `req:get-settings`

Retrieves the current application settings.

**Renderer → Main** — No payload

**Main → Renderer (resolved Promise)**

```typescript
interface SettingsResult {
  success: boolean;
  settings: Settings;
}
```

See [FRD §4.2](./FRD.md#42-settings-object) for the `Settings` interface.

### 3.4 `req:save-settings`

Persists application settings.

**Renderer → Main**

```typescript
interface SaveSettingsRequest {
  settings: Settings;
}
```

**Main → Renderer (resolved Promise)**

```typescript
interface SaveSettingsResult {
  success: boolean;
  error?: string;
}
```

### 3.5 `req:add-appimage`

Manually adds a single AppImage file to the index.

**Renderer → Main**

```typescript
interface AddAppImageRequest {
  path: string;  // Absolute file path to the AppImage
}
```

**Main → Renderer (resolved Promise)**

```typescript
interface AddAppImageResult {
  success: boolean;
  entry?: AppImageEntry;
  error?: string; // 'FILE_NOT_FOUND' | 'NOT_APPIMAGE' | 'ALREADY_INDEXED'
}
```

### 3.6 `req:remove-appimage`

Removes an AppImage entry from the index (does not delete the file).

**Renderer → Main**

```typescript
interface RemoveAppImageRequest {
  id: string;  // Entry UUID
}
```

**Main → Renderer (resolved Promise)**

```typescript
interface RemoveAppImageResult {
  success: boolean;
  error?: string; // 'NOT_FOUND'
}
```

### 3.7 `req:update-appimage-properties`

Updates properties of a specific AppImage entry.

**Renderer → Main**

```typescript
interface UpdatePropertiesRequest {
  id: string;
  properties: {
    name?: string;
    customArgs?: string;
    workingDirectory?: string;
    envVars?: Record<string, string>;
    elevated?: boolean;
    sandboxMode?: boolean;
    customIconPath?: string;
  };
}
```

**Main → Renderer (resolved Promise)**

```typescript
interface UpdatePropertiesResult {
  success: boolean;
  entry?: AppImageEntry;
  error?: string; // 'NOT_FOUND'
}
```

### 3.8 `req:reset-appimage-properties`

Resets an AppImage entry's properties to auto-detected defaults.

**Renderer → Main**

```typescript
interface ResetPropertiesRequest {
  id: string;
}
```

**Main → Renderer (resolved Promise)**

```typescript
interface ResetPropertiesResult {
  success: boolean;
  entry?: AppImageEntry;
  error?: string;
}
```

### 3.9 `req:open-file-location`

Opens the file manager at the AppImage's directory.

**Renderer → Main**

```typescript
interface OpenFileLocationRequest {
  id: string;
}
```

**Main → Renderer (resolved Promise)**

```typescript
interface OpenFileLocationResult {
  success: boolean;
  error?: string;
}
```

### 3.10 `req:refresh-appimages`

Triggers a background rescan without blocking the UI. Used for incremental updates.

**Renderer → Main** — No payload

**Main → Renderer (resolved Promise)**

```typescript
interface RefreshResult {
  success: boolean;
  added: number;
  removed: number;
  entries: AppImageEntry[]; // Full updated list
}
```

---

## 4. Event Channels (Main → Renderer)

### 4.1 `evt:scan-progress`

Pushed during a long-running scan to show progress.

```typescript
interface ScanProgressEvent {
  current: number;   // Files scanned so far
  total: number;     // Estimated total (may change)
  currentFile: string; // Current file being processed
  percent: number;   // 0-100
}
```

### 4.2 `evt:appimages-updated`

Pushed when the AppImage index changes (add, remove, or refresh).

```typescript
interface AppImagesUpdatedEvent {
  entries: AppImageEntry[]; // Full current index
  change: 'scan' | 'add' | 'remove' | 'refresh';
}
```

### 4.3 `evt:settings-changed`

Pushed when settings are updated from another source (e.g., tray menu).

```typescript
interface SettingsChangedEvent {
  settings: Settings;
}
```

### 4.4 `evt:launch-error`

Pushed when an AppImage launch fails.

```typescript
interface LaunchErrorEvent {
  id: string;
  name: string;
  message: string;
  stderr: string;
  exitCode: number | null;
}
```

---

## 5. Error Handling

### 5.1 Error Format

All rejected Promises use a consistent shape:

```typescript
interface IpcError {
  code: string;       // Machine-readable, e.g., 'SCAN_FAILED'
  message: string;    // User-readable
  details?: unknown;  // Optional technical details
}
```

### 5.2 Error Codes

| Code | Channel | Meaning |
|------|---------|---------|
| `SCAN_FAILED` | `scan-appimages` | Directory scan encountered an error |
| `LAUNCH_FAILED` | `launch-appimage` | AppImage failed to start or crashed |
| `NOT_FOUND` | Multiple | Entry ID not in index |
| `FILE_NOT_FOUND` | `add-appimage` | Path does not exist |
| `NOT_APPIMAGE` | `add-appimage` | File is not a valid AppImage |
| `ALREADY_INDEXED` | `add-appimage` | File already in index |
| `SETTINGS_ERROR` | `save-settings` | Settings validation or write failed |
| `PERMISSION_DENIED` | Multiple | Insufficient OS permissions |
| `INVALID_ARGS` | Multiple | Malformed request payload |

### 5.3 Timeout Policy

- All IPC invocations have a **10-second** timeout
- `scan-appimages` has a **60-second** timeout (large directories)
- Timed-out invocations reject with `{ code: 'IPC_TIMEOUT', message: 'Request timed out' }`

---

## 6. Security Constraints

### 6.1 Allowed Channels

The preload script whitelists channels. Only these are permitted:

```typescript
const ALLOWED_CHANNELS = [
  // Invoke
  'req:scan-appimages',
  'req:launch-appimage',
  'req:get-settings',
  'req:save-settings',
  'req:add-appimage',
  'req:remove-appimage',
  'req:update-appimage-properties',
  'req:reset-appimage-properties',
  'req:open-file-location',
  'req:refresh-appimages',
  // Events
  'evt:scan-progress',
  'evt:appimages-updated',
  'evt:settings-changed',
  'evt:launch-error'
];
```

### 6.2 Payload Validation

All Main-side handlers validate incoming payloads before processing:

- `id` fields must be valid UUIDs
- `path` fields must be absolute paths
- `settings` must pass schema validation
- Unknown fields are ignored (defensive)

---

## 7. Preload Script Contract

```typescript
// src/preload/index.ts

interface ElectronAPI {
  invoke: (channel: string, data?: unknown) => Promise<unknown>;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

**Exposed methods:**
- `window.electronAPI.invoke(channel, data)` — Returns Promise
- `window.electronAPI.on(channel, callback)` — Subscribe to events
- `window.electronAPI.removeListener(channel, callback)` — Unsubscribe

---

## 8. Message Ordering Guarantees

| Guarantee | Detail |
|-----------|--------|
| Sequential | IPC messages are processed in send order |
| No parallel scans | Only one scan runs at a time; subsequent requests are queued |
| Settings atomicity | `save-settings` writes are atomic; partial writes are rejected |
| Event deduplication | `evt:appimages-updated` is debounced (100ms) to avoid spam |

---

*Document End*
