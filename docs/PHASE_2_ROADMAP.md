# Phase 2 Roadmap

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Overview

This document lists features and considerations deferred to Phase 2 (post-v1.0). These items were evaluated during v1.0 planning but classified as low-impact or non-critical for the initial release.

---

## 2. Low-Impact Items from Planning

### 2.1 Internationalization (i18n)

**Priority:** Low  
**Effort:** Medium

| Aspect | Detail |
|--------|--------|
| Current state | All UI strings hardcoded in English |
| Phase 2 plan | Integrate `i18next` or `react-intl` for string externalization |
| Target languages | Determine based on user demand |
| Date/number formatting | Localize per user locale (`Intl` API) |
| RTL support | Layout mirroring for Arabic, Hebrew, etc. |

**Decision:** Out of scope for v1.0 because the initial target audience is English-speaking Linux users. Translation community will determine priority languages.

### 2.2 Configurable Keyboard Shortcuts

**Priority:** Low  
**Effort:** Low

| Aspect | Detail |
|--------|--------|
| Current state | Hardcoded shortcuts (`Ctrl+F`, `Ctrl+,`, `Alt+Enter`, `Alt+F4`) |
| Phase 2 plan | Settings panel for viewing and customizing all shortcuts |
| Conflict detection | Warn when custom shortcut conflicts with DE shortcuts |
| Non-US keyboards | Handle Alt dead-key issues on certain layouts |

**Decision:** v1.0 defaults are standard and sufficient for launch.

### 2.3 Uninstall / Cleanup Behavior

**Priority:** Low  
**Effort:** Low

| Aspect | Detail |
|--------|--------|
| Current state | No uninstall mechanism; data persists after removal |
| Phase 2 plan | Settings → "Uninstall & Remove All Data" option |
| Data locations | `~/.config/appimage-launcher/`, `~/.local/share/appimage-launcher/`, `~/.cache/appimage-launcher/`, `~/.local/state/appimage-launcher/` |
| .deb package | `postrm` script to clean up config/data directories |
| AppImage distribution | In-app cleanup script |
| Default behavior | Prompt: "Keep data" or "Remove all data" |

**Decision:** Most Linux users understand that AppImage removal doesn't clean config data. Can be added later.

### 2.4 Logging Levels & Categories

**Priority:** Low  
**Effort:** Low

| Aspect | Detail |
|--------|--------|
| Current state | Generic logger with `debug` and `info` levels |
| Phase 2 plan | Define structured log categories and levels per module |

**Proposed log level definitions:**

| Level | Category | Example |
|-------|----------|---------|
| `debug` | All modules | Detailed operation traces |
| `info` | Scanner | "Scanned 5 directories, found 42 AppImages" |
| `info` | Launcher | "Launched MyApp v1.2.3 (PID 12345)" |
| `warn` | Scanner | "Permission denied: /root/AppImage.AppImage" |
| `warn` | Launcher | "AppImage not executable, setting +x" |
| `warn` | Compatibility | "No compositor detected, transparency disabled" |
| `error` | All modules | "Index file corrupt, loading backup" |
| `security` | Launcher | "First launch of untrusted AppImage" |
| `security` | Launcher | "Elevated execution requested" |
| `security` | Scanner | "AppImage owned by different user" |

**Export:** Ability to export logs for debugging (`Settings → Advanced → Export Logs`).

### 2.5 Dock Size Recalculation on Dynamic Displays

**Priority:** Low  
**Effort:** Low

| Aspect | Detail |
|--------|--------|
| Current state | Dock dimensions calculated on position change only |
| Phase 2 plan | Subscribe to display metrics changes and auto-recalculate |
| Guard | Debounce (200ms), skip if bounds unchanged by >1px |

**Decision:** v1.0 handles this via `display-metrics-changed` listener in the architecture, but edge cases (panel auto-hide, resolution changes during operation) are lower priority.

---

## 3. Additional Future Considerations

These were noted in the original PRD as future considerations:

| Feature | Priority | Description |
|---------|----------|-------------|
| AppImage update notifications | Medium | Detect newer versions of indexed AppImages |
| Thumbnail/preview generation | Low | Generate preview screenshots for AppImages |
| Application usage statistics | Low | Track launch frequency, session duration |
| Plugin/extension system | Low | Third-party extensions (custom extractors, launch hooks, themes) |
| Cloud sync | Low | Sync library and settings across machines |
| Flatpak distribution | Medium | Sandboxed distribution via Flathub |
| AUR package | Low | Community-maintained Arch Linux package |

---

## 4. Phase 2 Entry Criteria

An item moves from this document into active development when:

1. v1.0 is released and stable
2. User feedback indicates demand for the feature
3. Development resources are available
4. A feature request issue is created in GitHub

---

*Document End*
