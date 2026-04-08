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

MyAppImages is an Electron-based desktop application that indexes, manages, and launches .AppImage files. It features a dockable interface that can attach to any screen edge for quick access.

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
- [ ] System supports auto-hide when docked
- [ ] System shows window on mouse hover (when auto-hide enabled)
- [ ] System supports undocked/floating mode
- [ ] System remembers dock position across sessions
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
- [ ] System allows toggling auto-hide
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

### FR-8: Recent Applications

| Field | Description |
|-------|-------------|
| **ID** | FR-8 |
| **Title** | Recently Launched Section |
| **Priority** | Low |
| **Description** | The system shall display recently launched AppImages for quick access |

**Acceptance Criteria:**
- [ ] System tracks last 10 launched AppImages
- [ ] System displays recent apps in a dedicated section
- [ ] System orders by most recently launched
- [ ] Recent section can be cleared by user

---

### FR-9: Context Menu

| Field | Description |
|-------|-------------|
| **ID** | FR-9 |
| **Title** | Right-Click Context Menu |
| **Priority** | Medium |
| **Description** | The system shall provide context menu options for each AppImage |

**Acceptance Criteria:**
- [ ] Right-click shows context menu with options:
  - Launch
  - Open File Location
  - Remove from Index
  - Edit Properties (name, custom args)
- [ ] Context menu is visually distinct and styled

---

### FR-10: System Tray Integration

| Field | Description |
|-------|-------------|
| **ID** | FR-10 |
| **Title** | System Tray Icon |
| **Priority** | Low |
| **Description** | The system shall provide a system tray icon for quick access |

**Acceptance Criteria:**
- [ ] System displays tray icon when app is running
- [ ] Tray menu includes: Show/Hide, Launch Recent, Settings, Quit
- [ ] Clicking tray icon toggles window visibility
- [ ] System can minimize to tray on window close

---

## 4. Data Requirements

### 4.1 AppImage Index Entry

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Display name |
| `path` | string | Absolute file path |
| `icon` | string | Base64 icon or path to extracted icon |
| `size` | number | File size in bytes |
| `version` | string | AppImage version (if available) |
| `lastLaunched` | date | Timestamp of last launch |
| `launchCount` | number | Number of times launched |
| `customArgs` | string | Custom launch arguments |
| `dateAdded` | date | When entry was added |

### 4.2 Settings Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `scanDirectories` | string[] | `['~/Applications', '~/AppImages']` | Directories to scan |
| `dockPosition` | string | `'left'` | Dock position (top/bottom/left/right/none) |
| `autoHide` | boolean | `false` | Auto-hide dock |
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
