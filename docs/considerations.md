# Considerations

## AppImage Launcher

This is a living document. Add items here as they come up during planning or development. Each item should either be resolved (with a link to the relevant doc/decision) or remain open for discussion.

---

## 🔓 Open

_(Nothing currently. Add considerations here as they arise.)_

---

## ✅ Resolved

| # | Item | Resolution | Date |
|---|------|-----------|------|
| 1 | IPC Protocol Specification | [`IPC_PROTOCOL.md`](./IPC_PROTOCOL.md) | 2026-04-08 |
| 2 | Linux Desktop Environment Compatibility | [`LINUX_COMPATIBILITY.md`](./LINUX_COMPATIBILITY.md) | 2026-04-08 |
| 3 | AppImage Metadata Extraction Deep Dive | [`APPIMAGE_EXTRACTION.md`](./APPIMAGE_EXTRACTION.md) | 2026-04-08 |
| 4 | Distribution & Release Strategy | [`DISTRIBUTION_RELEASE.md`](./DISTRIBUTION_RELEASE.md) | 2026-04-08 |
| 5 | Security & Permissions Model | [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) | 2026-04-08 |
| 6 | Data Persistence & Migration | [`TECHNICAL_ARCHITECTURE.md` §14](./TECHNICAL_ARCHITECTURE.md#14-data-persistence--migration) — Schema versioning, atomic writes, SQLite migration threshold | 2026-04-08 |
| 7 | Multi-Monitor Support | [`TECHNICAL_ARCHITECTURE.md` §15](./TECHNICAL_ARCHITECTURE.md#15-multi-monitor-support), [`LINUX_COMPATIBILITY.md` §3.8](./LINUX_COMPATIBILITY.md#38-multi-monitor) — Cursor-based display anchoring | 2026-04-08 |
| 8 | HiDPI / Fractional Scaling | [`UI_UX_DESIGN.md` §7.1](./UI_UX_DESIGN.md#71-hidpi--fractional-scaling), [`LINUX_COMPATIBILITY.md` §3.9](./LINUX_COMPATIBILITY.md#39-hidpi--fractional-scaling) — Logical pixels, DPR testing | 2026-04-08 |
| 9 | AppImage Process Lifecycle | [`TECHNICAL_ARCHITECTURE.md` §17](./TECHNICAL_ARCHITECTURE.md#17-appimage-process-lifecycle) — Detached processes, crash detection, duplicate policy | 2026-04-08 |
| 10 | FUSE Mount Leak Prevention | [`APPIMAGE_EXTRACTION.md` §11](./APPIMAGE_EXTRACTION.md#11-fuse-mount-leak-prevention--cleanup) — try/finally, stale mount detection, semaphore | 2026-04-08 |
| 11 | Concurrency & Race Conditions | [`TECHNICAL_ARCHITECTURE.md` §16](./TECHNICAL_ARCHITECTURE.md#16-concurrency--race-conditions), [`IPC_PROTOCOL.md` §5.4](./IPC_PROTOCOL.md#54-queue-behavior) — Scanner lock, atomic writes, re-validation | 2026-04-08 |
| 12 | Internationalization (i18n) | [`PHASE_2_ROADMAP.md` §2.1](./PHASE_2_ROADMAP.md#21-internationalization-i18n) — Deferred to Phase 2 | 2026-04-08 |
| 13 | Accessibility Gaps | [`UI_UX_DESIGN.md` §14](./UI_UX_DESIGN.md#14-accessibility-requirements) — ARIA live regions, focus trap, reduced motion, contrast ratios verified | 2026-04-08 |
| 14 | Electron Version Pinning | [`DISTRIBUTION_RELEASE.md` §3.1](./DISTRIBUTION_RELEASE.md#31-electron-version-policy) — Pinned to Electron 33.x LTS, upgrade policy defined | 2026-04-08 |
| 15 | libappimage Dependency Contradiction | [`TECHNICAL_ARCHITECTURE.md` §2.2](./TECHNICAL_ARCHITECTURE.md) — Removed NAPI reference, clarified shell-out approach | 2026-04-08 |
| 16 | Testing Strategy for Electron | [`TECHNICAL_ARCHITECTURE.md` §21](./TECHNICAL_ARCHITECTURE.md#21-testing-strategy) — xvfb-run, integration tests, mock fixtures | 2026-04-08 |
| 17 | Error Recovery & Self-Healing | [`FRD.md` FR-14](./FRD.md#fr-14-error-recovery--self-healing), [`TECHNICAL_ARCHITECTURE.md` §22](./TECHNICAL_ARCHITECTURE.md#22-crash-recovery) | 2026-04-08 |
| 18 | Large Index Performance | [`TECHNICAL_ARCHITECTURE.md` §19](./TECHNICAL_ARCHITECTURE.md#19-large-index-performance) — react-window, IPC optimization, 500-entry threshold | 2026-04-08 |
| 19 | Configuration Backup & Restore | [`FRD.md` FR-13](./FRD.md#fr-13-configuration-importexport) — .tar.gz export/import | 2026-04-08 |
| 20 | Desktop Integration Contradiction | [`PRD.md` §8](./PRD.md#8-out-of-scope-v10) (removed from out-of-scope), [`DISTRIBUTION_RELEASE.md` §8](./DISTRIBUTION_RELEASE.md#8-desktop-integration) — Clarified per-distribution behavior | 2026-04-08 |
| 21 | Auto-Discovery Mechanism | [`TECHNICAL_ARCHITECTURE.md` §18](./TECHNICAL_ARCHITECTURE.md#18-auto-discovery-mechanism), [`FRD.md` FR-12](./FRD.md#fr-12-auto-discovery-file-system-watching) — chokidar inotify, polling fallback | 2026-04-08 |
| 22 | Hash Computation Timing | [`APPIMAGE_EXTRACTION.md` §12](./APPIMAGE_EXTRACTION.md#12-hash-computation-timing) — mtime pre-check strategy | 2026-04-08 |
| 23 | Environment Variable Security | [`SECURITY_MODEL.md` §10](./SECURITY_MODEL.md#103-environment-whitelist-approach) — Expanded blocked list, whitelist approach | 2026-04-08 |
| 24 | Wayland Support | [`LINUX_COMPATIBILITY.md` §3.10](./LINUX_COMPATIBILITY.md#310-wayland-support) — Feature matrix, detection, Electron Wayland launch flag | 2026-04-08 |
| 25 | Uninstall / Cleanup Behavior | [`PHASE_2_ROADMAP.md` §2.3](./PHASE_2_ROADMAP.md#23-uninstall--cleanup-behavior) — Deferred to Phase 2 | 2026-04-08 |
| 26 | Crash Recovery | [`TECHNICAL_ARCHITECTURE.md` §22](./TECHNICAL_ARCHITECTURE.md#22-crash-recovery) — Index backup, atomic writes, startup recovery | 2026-04-08 |
| 27 | AppImage Type 1 Support Depth | [`APPIMAGE_EXTRACTION.md` §13](./APPIMAGE_EXTRACTION.md#13-appimage-type-1-support) — Mount-only extraction, fallback chain | 2026-04-08 |
| 28 | Dock Size Recalculation on Display Changes | [`TECHNICAL_ARCHITECTURE.md` §20](./TECHNICAL_ARCHITECTURE.md#20-dock-size-recalculation-on-display-changes) — display-metrics-changed listener, debounce | 2026-04-08 |
| 29 | Keyboard Shortcut Conflicts | [`PHASE_2_ROADMAP.md` §2.2](./PHASE_2_ROADMAP.md#22-configurable-keyboard-shortcuts) — Deferred to Phase 2 | 2026-04-08 |
| 30 | Logging Levels & Categories | [`PHASE_2_ROADMAP.md` §2.4](./PHASE_2_ROADMAP.md#24-logging-levels--categories) — Deferred to Phase 2 | 2026-04-08 |

---

*Document End*
