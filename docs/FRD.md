# Functional Requirements Document (FRD)

## AppImage Launcher

**Version:** 0.1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Introduction

This document outlines the functional requirements for the AppImage Launcher application. It describes what the system shall do from the user's perspective.

---

## 2. System Overview

MyAppImage is an Electron-based desktop application that indexes, manages, and launches .AppImage files. It features a dockable interface that can attach to any screen edge for quick access.

---

## 3. Functional Requirements

### FR-1: AppImage Scanning & Indexing

| Field | Description |
|-------|-------------|
| **ID** | FR-1 |
| **Title** | AppImage Directory Scanning |
| **Priority** | High |
| **Description** | The system shall scan user-configured directories for .AppImage files and index them |

**Acceptance Criteria:**
- [ ] System recursively scans configured directories
- [ ] System identifies files with `.AppImage` extension (case-insensitive)
- [ ] System extracts metadata from AppImage files (name, icon, version)
- [ ] System stores index in local database/cache
- [ ] System handles permission errors gracefully
- [ ] System displays scan progress to user
- [ ] System detects and prevents duplicate entries

---

### FR-2: AppImage Display

| Field | Description |
|-------|-------------|
| **ID** | FR-2 |
| **Title** | AppImage Grid/List View |
| **Priority** | High |
| **Description** | The system shall display indexed AppImages in a visual grid or list format |

**Acceptance Criteria:**
- [ ] System displays AppImage icon (extracted or default)
- [ ] System displays AppImage name below/beside icon
- [ ] System supports grid view with configurable icon sizes
- [ ] System supports list view with additional metadata
- [ ] System handles missing icons with a placeholder
- [ ] System truncates long names with ellipsis

---

### FR-3: AppImage Launching

| Field | Description |
|-------|-------------|
| **ID** | FR-3 |
| **Title** | Launch AppImage Application |
| **Priority** | Critical |
| **Description** | The system shall execute selected AppImage files |

**Acceptance Criteria:**
- [ ] System makes AppImage executable before running
- [ ] System launches AppImage with `./AppImageName` or `bash AppImageName`
- [ ] System supports custom launch arguments per AppImage
- [ ] System displays error if AppImage fails to launch
- [ ] System does not block UI during launch
- [ ] System tracks last-launched timestamp for "Recent" list

---

### FR-4: Dockable Interface

| Field | Description |
|-------|-------------|
| **ID** | FR-4 |
| **Title** | Screen Edge Docking |
| **Priority** | High |
| **Description** | The system shall allow the application window to dock to any screen edge |

**Acceptance Criteria:**
- [ ] System supports docking to: Top, Bottom, Left, Right
- [ ] System resizes window appropriately for docked position
- [ ] System supports pin/unpin toggle when docked
- [ ] When **pinned**, the dock remains visible at all times
- [ ] When **unpinned**, the dock slides out of view when it loses focus
- [ ] Unpinned dock reappears when mouse hovers over the docked screen edge
- [ ] Pin state is indicated by a visible toggle icon (pin/pin-off)
- [ ] System supports undocked/floating mode
- [ ] System remembers dock position and pin state across sessions
- [ ] System window stays on top when configured (always-on-top option)

---

### FR-5: Search Functionality

| Field | Description |
|-------|-------------|
| **ID** | FR-5 |
| **Title** | Search AppImages |
| **Priority** | High |
| **Description** | The system shall provide real-time search across indexed AppImages |

**Acceptance Criteria:**
- [ ] System filters displayed AppImages as user types
- [ ] Search is case-insensitive
- [ ] Search matches partial strings
- [ ] System displays "No results" message when no matches found
- [ ] Search clears when input is empty
- [ ] Keyboard shortcut to focus search (Ctrl+F)

---

### FR-6: Settings Management

| Field | Description |
|-------|-------------|
| **ID** | FR-6 |
| **Title** | Application Settings |
| **Priority** | Medium |
| **Description** | The system shall provide a settings interface for configuration |

**Acceptance Criteria:**
- [ ] System allows adding/removing scan directories
- [ ] System allows configuring dock position
- [ ] System allows toggling dock pinned/unpinned state
- [ ] System allows configuring icon size
- [ ] System allows configuring theme (Light/Dark/System)
- [ ] System allows configuring window opacity
- [ ] System allows configuring "always on top" setting
- [ ] System saves settings persistently
- [ ] System provides "Reset to Defaults" option

---

### FR-7: Manual AppImage Management

| Field | Description |
|-------|-------------|
| **ID** | FR-7 |
| **Title** | Add/Remove AppImage Entries |
| **Priority** | Medium |
| **Description** | The system shall allow manual addition and removal of AppImage entries |

**Acceptance Criteria:**
- [ ] System provides "Add AppImage" button to browse and select file
- [ ] System provides context menu option to remove entry from index
- [ ] System confirms before removing entry
- [ ] System can verify file still exists on disk before launch
- [ ] System provides option to refresh/rescan all directories

---

### FR-8: AppImage Properties & Execute Settings

| Field | Description |
|-------|-------------|
| **ID** | FR-8 |
| **Title** | View and Edit AppImage Properties |
| **Priority** | High |
| **Description** | The system shall allow the user to view and modify properties and execution settings for any indexed AppImage |

**Acceptance Criteria:**
- [ ] System provides "Properties" option in context menu and via double-click with modifier (e.g., Alt+click)
- [ ] Properties panel displays: Name, Path, Size, Version, Date Added, Launch Count
- [ ] User can edit Display Name (custom override)
- [ ] User can set custom launch arguments (free-form text input)
- [ ] User can set a custom working directory for execution
- [ ] User can set environment variables (key-value pairs, add/remove)
- [ ] User can toggle "Run with elevated privileges" (sudo prompt warning)
- [ ] User can toggle "Use sandbox mode" (isolated filesystem)
- [ ] User can assign a custom icon (file picker)
- [ ] User can reset all properties to detected defaults
- [ ] Changes are saved and persist across sessions
- [ ] Properties panel accessible via keyboard shortcut (Alt+Enter)

---

### FR-9: Recent Applications

| Field | Description |
|-------|-------------|
| **ID** | FR-9 |
| **Title** | Recently Launched Section |
| **Priority** | Low |
| **Description** | The system shall display recently launched AppImages for quick access |

**Acceptance Criteria:**
- [ ] System tracks last 10 launched AppImages
- [ ] System displays recent apps in a dedicated section
- [ ] System orders by most recently launched
- [ ] Recent section can be cleared by user

---

### FR-10: Context Menu

| Field | Description |
|-------|-------------|
| **ID** | FR-10 |
| **Title** | Right-Click Context Menu |
| **Priority** | Medium |
| **Description** | The system shall provide context menu options for each AppImage |

**Acceptance Criteria:**
- [ ] Right-click shows context menu with options:
  - Launch
  - Properties
  - Open File Location
  - Remove from Index
- [ ] Context menu is visually distinct and styled

---

### FR-11: System Tray Integration

| Field | Description |
|-------|-------------|
| **ID** | FR-11 |
| **Title** | System Tray Icon |
| **Priority** | Low |
| **Description** | The system shall provide a system tray icon for quick access |

**Acceptance Criteria:**
- [ ] System displays tray icon when app is running
- [ ] Tray menu includes: Show/Hide, Launch Recent, Settings, Quit
- [ ] Clicking tray icon toggles window visibility
- [ ] System can minimize to tray on window close

---

### FR-12: Auto-Discovery (File System Watching)

| Field | Description |
|-------|-------------|
| **ID** | FR-12 |
| **Title** | Automatic AppImage Discovery |
| **Priority** | Medium |
| **Description** | The system shall automatically detect new and removed AppImage files in scan directories without manual rescan |

**Acceptance Criteria:**
- [ ] System monitors scan directories for file system changes (add/remove)
- [ ] New AppImage files are automatically indexed within 2 seconds of appearing
- [ ] Deleted AppImage files are automatically removed from index
- [ ] System waits for file copy to complete before indexing (stability detection)
- [ ] User can toggle between "Auto" and "Manual" discovery modes
- [ ] System falls back to polling (30s interval) if file watcher fails (e.g., inotify limit)
- [ ] System notifies user when auto-discovery is disabled or unavailable

---

### FR-13: Configuration Import/Export

| Field | Description |
|-------|-------------|
| **ID** | FR-13 |
| **Title** | Backup and Restore Configuration |
| **Priority** | Medium |
| **Description** | The system shall allow exporting and importing all configuration data |

**Acceptance Criteria:**
- [ ] System exports settings, index, and custom icons as a single archive (`.tar.gz`)
- [ ] Export includes: settings.json, index.json, custom icon files
- [ ] System imports configuration from exported archive
- [ ] Import validates file integrity before applying
- [ ] Import warns about overwriting existing data, offers backup before applying
- [ ] Import handles absolute path mismatches gracefully (warns, skips invalid paths)
- [ ] System creates a backup automatically before applying imported config
- [ ] Export/import accessible from Settings → Advanced

---

### FR-14: Error Recovery & Self-Healing

| Field | Description |
|-------|-------------|
| **ID** | FR-14 |
| **Title** | Automatic Error Recovery |
| **Priority** | Medium |
| **Description** | The system shall automatically detect and recover from common error conditions |

**Acceptance Criteria:**
- [ ] System detects stale index entries (file no longer exists) during scan and prompts for cleanup
- [ ] System automatically rebuilds icon cache for entries with missing icons
- [ ] System attempts to repair settings file permissions before resetting to defaults
- [ ] System maintains backup of index and settings files before every write operation
- [ ] System recovers from corrupt index by loading from backup automatically
- [ ] System notifies user when automatic recovery actions are taken
- [ ] System offers full index rebuild from scratch if all recovery attempts fail

---

## 4. Data Requirements

### 4.1 AppImage Index Entry

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Display name (custom or detected) |
| `path` | string | Absolute file path |
| `icon` | string | Base64 icon or path to extracted icon |
| `customIconPath` | string | User-assigned custom icon path |
| `size` | number | File size in bytes |
| `version` | string | AppImage version (if available) |
| `lastLaunched` | date | Timestamp of last launch |
| `launchCount` | number | Number of times launched |
| `customArgs` | string | Custom launch arguments |
| `workingDirectory` | string | Custom working directory for execution |
| `envVars` | object | Key-value environment variables |
| `elevated` | boolean | Run with elevated privileges (sudo) |
| `sandboxMode` | boolean | Use sandboxed execution |
| `dateAdded` | date | When entry was added |
| `lastMtimeCheck` | number | Last known mtimeMs for hash skip optimization |

### 4.2 Settings Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `scanDirectories` | string[] | `['~/Applications', '~/AppImages']` | Directories to scan |
| `dockPosition` | string | `'left'` | Dock position (top/bottom/left/right/none) |
| `dockPinned` | boolean | `true` | Whether dock stays visible or hides on focus loss |
| `autoDiscoveryMode` | string | `'auto'` | Auto-discovery mode ('auto' or 'manual') |
| `suppressFirstLaunchWarning` | boolean | `false` | Suppress first-launch warning dialog |
| `iconSize` | number | `64` | Icon display size in px |
| `theme` | string | `'system'` | Theme (light/dark/system) |
| `windowOpacity` | number | `100` | Window opacity percentage |
| `alwaysOnTop` | boolean | `false` | Keep window on top |
| `minimizeToTray` | boolean | `true` | Minimize to system tray |
| `recentCount` | number | `10` | Number of recent apps to track |

---

## 5. Error Handling

| Error | Behavior |
|-------|----------|
| AppImage file not found | Display warning, offer to remove from index |
| Permission denied on scan | Log warning, continue scanning other directories |
| AppImage fails to launch | Display error dialog with details |
| Corrupt AppImage | Display error, allow user to remove entry |
| Settings file corrupt | Reset to defaults, notify user |

---

## 6. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | TBD | | |
| Lead Developer | TBD | | |

---

*Document End*
