# Considerations

## AppImage Launcher

This is a living document. Add items here as they come up during planning or development. Each item should either be resolved (with a link to the relevant doc/decision) or remain open for discussion.

---

## 🔓 Open

| # | Item | Impact | Notes |
|---|------|--------|-------|
| 6 | Data Persistence & Migration | High | No schema versioning or migration strategy for index.json/settings.json. What happens when fields change between releases? |
| 7 | Multi-Monitor Support | High | Dock positioning uses `getPrimaryDisplay()` — breaks on multi-monitor setups. Need to define which display the dock anchors to and behavior on display disconnect. |
| 8 | HiDPI / Fractional Scaling | Medium | Fixed pixel values (32px title bar, 800×600 default) render too small on 125%/150%/200% scaling. Need DPR-aware sizing. |
| 9 | AppImage Process Lifecycle | High | Launched AppImages become child processes. No discussion of zombie handling, duplicate launch prevention, crash notification, or `detached`/`setsid` usage. |
| 10 | FUSE Mount Leak / Resource Cleanup | Medium | Stale `/tmp/.mount_*` directories left behind on crash. Need periodic cleanup and `fusermount` fallback. |
| 11 | Concurrency & Race Conditions | High | Scanner + launcher race, settings debounce data loss, scan queue mechanism, file existence re-check before launch. |
| 12 | Internationalization (i18n) | Low | Zero mention of i18n. Decide: out of scope for v1.0 or include translation framework? Date/number formatting conventions needed. |
| 13 | Accessibility Gaps | Medium | Missing: ARIA live regions for async events, focus trap in modals, focus restoration, `prefers-reduced-motion`, verified contrast ratios. |
| 14 | Electron Version Pinning | Medium | Docs say "Latest LTS" but package.json pins `^28.2.0` (outdated). Need specific pinned version + upgrade policy. |
| 15 | libappimage Dependency Contradiction | High | Architecture lists `libappimage (via NAPI)` as dependency, but extraction doc says no N-API binding exists. Must reconcile. |
| 16 | Testing Strategy for Electron | Medium | Main process code is hard to unit test. CI is headless (no display). Need xvfb-run strategy and mock AppImage fixtures. |
| 17 | Error Recovery & Self-Healing | Medium | Stale index entries, broken icon cache, corrupt settings — no self-healing behavior defined. |
| 18 | Large Index Performance | Medium | No virtualization strategy defined. No max tested index size. Full index replacement over IPC on every scan is O(n). |
| 19 | Configuration Backup & Restore | Medium | PRD lists "import/export config" but no FR exists. Format, conflict resolution, and cross-machine portability undefined. |
| 20 | Desktop Integration Contradiction | Medium | PRD says "system menu integration out of scope" but .deb includes a .desktop file. AppImage distribution has no menu entry. |
| 21 | Auto-Discovery Mechanism | High | PRD says "auto-discovery of new AppImages" but no design for inotify vs polling. FR-6 mentions `[Auto] [Manual]` refresh with no spec. |
| 22 | Hash Computation Timing | Medium | File hash used for duplicate detection and cache invalidation, but hashing 200MB files on every scan is expensive. Need mtime pre-check strategy. |
| 23 | Environment Variable Security | High | Blocked env var list is incomplete (`LD_AUDIT`, `LD_DEBUG`, `XDG_RUNTIME_DIR`). Launcher passes full environment — could leak tokens/keys. |
| 24 | Wayland Support | High | Fedora/GNOME default to Wayland. Electron Wayland support exists but window positioning, always-on-top, and mouse polling break. Need detection and adaptation. |
| 25 | Uninstall / Cleanup Behavior | Low | No discussion of data left behind after removal. Settings, index, icons, logs all persist. |
| 26 | Crash Recovery | Medium | Index file has no backup strategy or atomic write. Corrupt index loses all user-customized properties. |
| 27 | AppImage Type 1 Support Depth | Medium | PRD requires Type 1 support but extraction methods (`--appimage-extract`, `--appimage-mount`) are Type 2 only. Type 1 path undefined. |
| 28 | Dock Size Recalculation on Display Changes | Low | No subscription to display metrics changes. Panel/taskbar appearing/disappearing not handled. |
| 29 | Keyboard Shortcut Conflicts | Low | `Alt+Enter` and `Alt+F4` may conflict with DE shortcuts or non-US keyboard layouts. Configurable shortcuts? |
| 30 | Logging Levels & Categories | Low | Log levels (`debug`, `info`, `warn`, `error`) not defined per module. Security events not tagged for audit. |

---

## ✅ Resolved

| # | Item | Resolution | Date |
|---|------|-----------|------|
| 1 | IPC Protocol Specification | [`IPC_PROTOCOL.md`](./IPC_PROTOCOL.md) | 2026-04-08 |
| 2 | Linux Desktop Environment Compatibility | [`LINUX_COMPATIBILITY.md`](./LINUX_COMPATIBILITY.md) | 2026-04-08 |
| 3 | AppImage Metadata Extraction Deep Dive | [`APPIMAGE_EXTRACTION.md`](./APPIMAGE_EXTRACTION.md) | 2026-04-08 |
| 4 | Distribution & Release Strategy | [`DISTRIBUTION_RELEASE.md`](./DISTRIBUTION_RELEASE.md) | 2026-04-08 |
| 5 | Security & Permissions Model | [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) | 2026-04-08 |

---

*Document End*
