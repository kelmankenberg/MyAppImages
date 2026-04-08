# Considerations

## AppImage Launcher

This document tracks key architectural considerations that influence the project's design and implementation decisions.

---

## ✅ Completed

### 1. IPC Protocol Specification → [`IPC_PROTOCOL.md`](./IPC_PROTOCOL.md)

The renderer and main process communicate over Electron IPC. All channel names, payload shapes, error formats, and timeout policies are defined.

**Covers:**
- 10 request/response channels (Invoke/Handle)
- 4 event channels (push notifications)
- Consistent error codes and formats
- 10s default timeout (60s for scans)
- Preload script security contract

### 2. Linux Desktop Environment Compatibility → [`LINUX_COMPATIBILITY.md`](./LINUX_COMPATIBILITY.md)

Compatibility matrix for GNOME, KDE Plasma, XFCE, Cinnamon, MATE, Sway/i3 covering system tray, transparency, frameless windows, focus events, and always-on-top.

**Covers:**
- System tray support (GNOME extension requirement)
- Transparency/compositor detection
- Focus/blur event reliability per DE
- Tiling WM detection and limitations
- Detection utilities (DE, compositor, WM)

### 3. AppImage Metadata Extraction → [`APPIMAGE_EXTRACTION.md`](./APPIMAGE_EXTRACTION.md)

Deep dive into extracting name, icon, and version from AppImage Type 1 and Type 2 formats using four-tiered fallback strategy.

**Covers:**
- Type 1 vs Type 2 format differences
- Four extraction methods (extract → mount → binary → fallback)
- .desktop file parser implementation
- Icon extraction pipeline and caching (SHA-256 keyed, LRU)
- Performance benchmarks per method
- FUSE requirements

### 4. Distribution & Release → [`DISTRIBUTION_RELEASE.md`](./DISTRIBUTION_RELEASE.md)

Packaging, versioning, and distribution strategy for the launcher itself.

**Covers:**
- Primary: AppImage, Secondary: .deb, Future: AUR, Flatpak
- SemVer versioning with pre-release tags
- Manual and automated (CI/CD) release processes
- Checksum generation and verification
- Update strategy (manual v1.0, in-app notification future)
- Minimum system requirements
- Installation instructions

### 5. Security & Permissions Model → [`SECURITY_MODEL.md`](./SECURITY_MODEL.md)

Threat model, risk mitigations, and permission requirements for executing arbitrary binaries.

**Covers:**
- Threat actors and attack vectors
- First-launch warning dialog
- Executable bit and ownership checks
- Elevated privileges (pkexec/sudo) flow
- Sandboxed execution via firejail
- Path validation and symlink resolution
- Shell injection prevention
- Environment variable security (blocked vars)
- Electron process hardening and CSP
- Launch audit logging

---

## 🔜 Future Considerations

### AppImage Update Notifications

Detect when indexed AppImages have newer versions available. Could integrate with AppImageUpdate or check upstream release pages.

### Plugin/Extension System

Allow third-party extensions to add features like custom metadata extractors, launch hooks, or UI themes.

### Cloud Sync

Sync AppImage library and settings across multiple machines.

### Application Usage Analytics

Track launch frequency, session duration, and usage patterns for user insights.

---

*Document End*
