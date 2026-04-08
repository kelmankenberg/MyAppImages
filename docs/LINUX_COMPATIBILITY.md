# Linux Desktop Environment Compatibility

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Overview

Linux desktop environments vary in their handling of window management, system trays, focus events, and theming. This document catalogs known differences and specifies the compatibility strategy for each.

---

## 2. Supported Desktop Environments

| Environment | Window Manager | Primary Distros | Priority |
|-------------|----------------|-----------------|----------|
| GNOME | Mutter | Ubuntu, Fedora, Debian | Critical |
| KDE Plasma | KWin | KDE Neon, openSUSE, Arch | Critical |
| XFCE | xfwm4 | Xubuntu, Linux Mint XFCE | High |
| Cinnamon | Muffin | Linux Mint | High |
| MATE | Marco | Ubuntu MATE | Medium |
| Budgie | Mutter (fork) | Ubuntu Budgie | Low |
| Pantheon | Gala | elementary OS | Low |
| Sway/i3 | Sway/i3 | Arch, Void (tiling WMs) | Medium |

---

## 3. Compatibility Matrix

### 3.1 System Tray / Status Notifier

| Desktop | Support | Notes |
|---------|---------|-------|
| GNOME | ⚠️ Requires extension | AppIndicator/KStatusNotifierItem extension needed. No native support in GNOME Shell 40+. |
| KDE Plasma | ✅ Full | Native Status Notifier support |
| XFCE | ✅ Full | Native systray support |
| Cinnamon | ✅ Full | Native support |
| MATE | ✅ Full | Native support |
| Sway | ⚠️ Requires sniproxy | `sway-status-notifier-proxy` or `sniproxy` needed |
| i3 | ⚠️ Requires stalonetray | `stalonetray` or `trayer` needed |

**Strategy:** If system tray is unavailable, gracefully degrade to a minimal dock indicator. Do not crash or hang. Log a warning in settings.

### 3.2 Window Transparency & Opacity

| Desktop | Support | Notes |
|---------|---------|-------|
| GNOME | ✅ Full | `transparent: true` + `opacity` works |
| KDE Plasma | ✅ Full | Full compositor support |
| XFCE | ⚠️ Partial | Requires compositing enabled in xfwm4 settings |
| Cinnamon | ✅ Full | Full compositor support |
| MATE | ⚠️ Partial | Requires compton/picom |
| Sway/i3 | ⚠️ Partial | Requires a compositor like `picom` |

**Strategy:** Test compositor availability at startup. If transparency is unsupported, fall back to solid background with a log warning.

### 3.3 Frameless Windows

| Desktop | Support | Notes |
|---------|---------|-------|
| GNOME | ✅ Full | `frame: false` works, shadow may be missing |
| KDE Plasma | ✅ Full | Server-side decorations available |
| XFCE | ⚠️ Partial | May show unwanted title bar decorations |
| Cinnamon | ✅ Full | Good support |
| MATE | ⚠️ Partial | May need `decor` plugin workaround |
| Sway/i3 | ⚠️ Varies | Depends on WM config; may get borders |

**Strategy:** Use `frame: false` universally. On WMs that add decorations, log a known issue and suggest user-side WM configuration.

### 3.4 Focus/Blur Events

| Desktop | Support | Notes |
|---------|---------|-------|
| GNOME | ✅ Reliable | `browser-window.on('blur')` fires correctly |
| KDE Plasma | ✅ Reliable | Works well |
| XFCE | ⚠️ Inconsistent | May not fire blur when clicking on desktop background |
| Cinnamon | ✅ Reliable | Works well |
| MATE | ⚠️ Inconsistent | Similar to XFCE |
| Sway/i3 | ❌ Unreliable | Focus model differs; click-to-focus vs sloppy focus |

**Strategy:** For unpinned dock mode, supplement Electron blur events with a mouse-position polling fallback (100ms interval) when blur is unreliable. Provide a toggle in advanced settings: "Use polling for focus detection."

### 3.5 Always-on-Top

| Desktop | Support | Notes |
|---------|---------|-------|
| GNOME | ✅ Full | `alwaysOnTop: true` works |
| KDE Plasma | ✅ Full | Works |
| XFCE | ✅ Full | Works |
| Cinnamon | ✅ Full | Works |
| MATE | ✅ Full | Works |
| Sway/i3 | ⚠️ Config-dependent | Tiling WMs may override |

**Strategy:** Standard Electron API. No special handling needed for v1.0.

### 3.6 `shell.openPath` (Open File Location)

| Desktop | Support | Notes |
|---------|---------|-------|
| GNOME | ✅ | Opens in Nautilus/Files |
| KDE Plasma | ✅ | Opens in Dolphin |
| XFCE | ✅ | Opens in Thunar |
| Cinnamon | ✅ | Opens in Nemo |
| All others | ✅ | Opens in default file manager |

**Strategy:** Use `shell.openPath()` universally. No special handling.

### 3.7 Theming & CSS

| Desktop | Consideration |
|---------|--------------|
| GNOME | GTK theme colors may influence Electron's default palette; use CSS variables, not system colors |
| KDE Plasma | Qt themes don't affect Electron; safe to use custom themes |
| All | System font stack handles most desktop environments correctly |

**Strategy:** Use CSS custom properties for all theming (already in [UI/UX §5](./UI_UX_DESIGN.md#5-color-palette)). Do not read GTK/Qt theme colors — it adds complexity and is unreliable.

---

## 4. Known Issues & Workarounds

### 4.1 GNOME: Missing System Tray

**Issue:** GNOME Shell 40+ removed the system tray area.

**Workaround:** Detect GNOME version at startup via `dbus-send`. If 40+, show a banner notification on first launch suggesting the "AppIndicator" extension.

```bash
gnome-shell --version
# Output: GNOME Shell 44.3
```

### 4.2 XFCE/MATE: Blur Event Unreliability

**Issue:** The `blur` event may not fire when the user clicks on the desktop background.

**Workaround:** When dock is unpinned, enable mouse-position polling as a supplement. Configurable in Settings → Advanced.

### 4.3 Tiling WMs (Sway/i3)

**Issue:** Window positioning is controlled by the WM, not the application. Dock positioning may not work as expected.

**Workaround:** Detect tiling WM via `xdpyinfo` or environment variables (`$SWAYSOCK`, `$I3SOCK`). If detected, show a notice that dock mode may have limited functionality.

### 4.4 Transparency Without Compositor

**Issue:** `transparent: true` causes rendering artifacts when no compositor is running.

**Workaround:** Check for compositor via `pgrep picom` or `pgrep compton` or desktop environment capability. If absent, force `transparent: false`.

---

## 5. Detection Utilities

### 5.1 Desktop Environment Detection

```typescript
function detectDesktopEnvironment(): string {
  // Check environment variables (most reliable)
  const env = process.env;
  
  if (env.XDG_CURRENT_DESKTOP) {
    return env.XDG_CURRENT_DESKTOP.toLowerCase();
  }
  if (env.XDG_SESSION_DESKTOP) {
    return env.XDG_SESSION_DESKTOP.toLowerCase();
  }
  if (env.DESKTOP_SESSION) {
    return env.DESKTOP_SESSION.toLowerCase();
  }
  
  // Fallback
  return 'unknown';
}
```

### 5.2 Compositor Detection

```typescript
function isCompositorRunning(): boolean {
  const de = detectDesktopEnvironment();
  
  // GNOME and KDE always have a compositor
  if (de.includes('gnome') || de.includes('kde') || de.includes('cinnamon')) {
    return true;
  }
  
  // Check for common compositors
  const compositors = ['picom', 'compton', 'xcompmgr', 'mutter', 'kwin_x11'];
  for (const comp of compositors) {
    try {
      execSync(`pgrep -x ${comp}`, { stdio: 'ignore' });
      return true;
    } catch {
      // Not running
    }
  }
  
  return false;
}
```

### 5.3 Tiling WM Detection

```typescript
function isTilingWM(): boolean {
  const env = process.env;
  return !!(
    env.SWAYSOCK ||
    env.I3SOCK ||
    env.HYPRLAND_INSTANCE_SIGNATURE
  );
}
```

---

## 6. Startup Compatibility Check

On application startup, run a compatibility check and store results:

```typescript
interface CompatibilityReport {
  desktopEnvironment: string;
  hasCompositor: boolean;
  isTilingWM: boolean;
  hasSystemTray: boolean;
  warnings: string[];
}
```

Log warnings but **never block startup** due to compatibility issues. Display warnings in Settings → Advanced.

---

## 7. Testing Requirements

### 7.1 Primary Testing Targets

- Ubuntu 24.04 LTS (GNOME 46)
- Kubuntu 24.04 LTS (KDE Plasma 5.27/6)
- Linux Mint 22 (Cinnamon)

### 7.2 Secondary Testing Targets

- Xubuntu 24.04 (XFCE)
- Ubuntu MATE 24.04
- Arch Linux (Sway/i3)
- Fedora 40 (GNOME)

### 7.3 Test Checklist per Environment

- [ ] Window renders correctly (no decoration artifacts)
- [ ] Transparency/opacity works (or graceful fallback)
- [ ] Dock positioning works on all 4 edges
- [ ] Pin/unpin toggle works
- [ ] Unpinned hide-on-blur works
- [ ] System tray icon appears (or graceful degradation)
- [ ] Theme switching works
- [ ] Launching an AppImage works
- [ ] "Open File Location" opens correct file manager
- [ ] Settings persist across restart

---

## 8. Unsupported Configurations

These are explicitly not supported for v1.0:

| Configuration | Reason |
|---------------|--------|
| Wayland-exclusive systems without XWayland | Electron Wayland support is incomplete |
| Headless/server environments | No display server |
| Custom/minimal WMs without EWMH support (e.g., `dwm`, `herbstluftwm`) | Window positioning impossible |
| Remote desktop sessions | Transparency and positioning are unreliable |

---

*Document End*
