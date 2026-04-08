# Distribution & Release Strategy

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Overview

This document defines how the AppImage Launcher itself will be packaged, distributed, versioned, and updated.

---

## 2. Distribution Formats

### 2.1 Primary: AppImage

| Property | Value |
|----------|-------|
| Format | AppImage Type 2 |
| Target | All Linux distributions |
| Pros | Portable, no installation needed, self-contained |
| Cons | Requires manual download, no package manager integration |

**Rationale:** An AppImage launcher distributed as an AppImage is the most universal approach. Users who work with AppImages already understand the format.

### 2.2 Secondary: Debian Package (.deb)

| Property | Value |
|----------|-------|
| Format | `.deb` |
| Target | Debian, Ubuntu, Linux Mint, Pop!_OS |
| Pros | Integrates with `apt`, appears in system app menu |
| Cons | Debian-specific, requires signing for PPAs |

### 2.3 Future: AUR Package

| Property | Value |
|----------|-------|
| Format | PKGBUILD |
| Target | Arch Linux, Manjaro, EndeavourOS |
| Pros | `yay -S appimage-launcher`, automatic updates |
| Cons | Community-maintained, requires a maintainer |

### 2.4 Future: Flatpak

| Property | Value |
|----------|-------|
| Format | Flatpak on Flathub |
| Pros | Sandboxed, universal, Flathub discoverability |
| Cons | Sandboxing limits access to host AppImages, complex permissions |

**Note:** Flatpak is a v2 consideration. The sandboxed nature of Flatpak makes it difficult for the launcher to access arbitrary AppImage files on the host filesystem.

---

## 3. Build Configuration

### 3.1 electron-builder Config

```json
{
  "appId": "com.myappimages.launcher",
  "productName": "MyAppImages",
  "copyright": "Copyright © 2026 Kelman Kenenberg",
  "directories": {
    "output": "dist",
    "buildResources": "build"
  },
  "files": [
    "dist/main/**/*",
    "dist/renderer/**/*",
    "dist/preload/**/*",
    "package.json"
  ],
  "linux": {
    "target": [
      {
        "target": "AppImage",
        "arch": ["x86_64"]
      },
      {
        "target": "deb",
        "arch": ["x86_64"]
      }
    ],
    "category": "Utility",
    "icon": "build/icons",
    "maintainer": "Kelman Kenenberg",
    "description": "A dockable launcher for AppImage files",
    "desktop": {
      "Name": "MyAppImages",
      "Comment": "Launch and manage AppImage applications",
      "Categories": "Utility;Development;",
      "Keywords": "AppImage;Launcher;Apps;"
    }
  }
}
```

### 3.2 Architecture Support

| Architecture | v1.0 | Notes |
|-------------|------|-------|
| x86_64 | ✅ | Primary target |
| arm64 | ❌ Future | Raspberry Pi, Apple Silicon via VM |
| armv7l | ❌ Future | Raspberry Pi 3/4 |

---

## 4. Versioning

### 4.1 Scheme

**Semantic Versioning (SemVer):** `MAJOR.MINOR.PATCH`

| Component | Bump When |
|-----------|-----------|
| MAJOR | Breaking changes, incompatible settings |
| MINOR | New features, non-breaking |
| PATCH | Bug fixes only |

### 4.2 Pre-release Tags

- `-alpha.N` — Internal testing
- `-beta.N` — Public testing
- `-rc.N` — Release candidate

Example: `1.0.0-beta.1`, `1.1.0-rc.2`

### 4.3 Git Tagging

Each release gets a git tag:

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

---

## 5. Release Process

### 5.1 Manual Release Checklist

- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Smoke test: launch AppImage on Ubuntu
- [ ] Smoke test: launch AppImage on KDE
- [ ] Version bumped in `package.json`
- [ ] Changelog updated
- [ ] Git tag created
- [ ] GitHub Release created with artifacts
- [ ] Release notes published

### 5.2 Automated Release (CI/CD)

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/*.AppImage
            dist/*.deb
          draft: true
          generate_release_notes: true
```

### 5.3 Release Artifacts

Each GitHub Release includes:

| File | Description |
|------|-------------|
| `MyAppImages-1.0.0-x86_64.AppImage` | Primary distribution |
| `myappimages_1.0.0_amd64.deb` | Debian package |
| `MyAppImages-1.0.0-x86_64.AppImage.sha256` | Checksum |
| Source code (auto) | GitHub archive |

---

## 6. Checksums

### 6.1 Generation

```bash
sha256sum dist/MyAppImages*.AppImage > MyAppImages-1.0.0-x86_64.AppImage.sha256
```

### 6.2 Verification (User-side)

```bash
sha256sum -c MyAppImages-1.0.0-x86_64.AppImage.sha256
```

---

## 7. Update Strategy

### 7.1 v1.0: Manual Updates

- Users download new versions from GitHub Releases
- No auto-update for v1.0

### 7.2 Future: Auto-Update Options

| Method | Pros | Cons |
|--------|------|------|
| `electron-updater` | Built into Electron ecosystem | Requires code signing for Linux |
| AppImageUpdate | Native AppImage update format | Requires upstream AppImage to support it |
| In-app notification | Simple, links to GitHub Releases | Manual download still required |

**Recommendation:** Implement in-app update notification that checks GitHub Releases API on startup (with user opt-in). Links to the release page for manual download.

```typescript
// Pseudocode
async function checkForUpdates(): Promise<UpdateInfo | null> {
  const currentVersion = app.getVersion();
  const response = await fetch(
    'https://api.github.com/repos/kelmankenberg/MyAppImages/releases/latest'
  );
  const latest = await response.json();
  const latestVersion = latest.tag_name.replace('v', '');
  
  if (semver.gt(latestVersion, currentVersion)) {
    return {
      version: latestVersion,
      url: latest.html_url,
      releaseNotes: latest.body,
    };
  }
  
  return null;
}
```

---

## 8. Code Signing

### 8.1 Linux Code Signing

Linux does not require code signing for AppImage or `.deb` distribution. However:

- `.deb` packages can be signed with GPG for repository distribution
- AppImages have no signing standard (though AppImage authors often sign with GPG)

**v1.0 Decision:** No code signing. Rely on GitHub Releases for distribution integrity.

### 8.2 Future: GPG Signing

For PPA and official repository distribution:

```bash
# Sign .deb package
dpkg-sig --sign builder myappimages_1.0.0_amd64.deb

# Verify
dpkg-sig --verify myappimages_1.0.0_amd64.deb
```

---

## 9. Changelog Format

```markdown
# Changelog

## [1.0.0] - 2026-04-08

### Added
- Initial release
- AppImage scanning and indexing
- Dockable interface (4 positions)
- Pin/unpin dock behavior
- Light/Dark/System themes
- AppImage properties editor
- System tray integration
- Search and filtering

### Known Issues
- System tray requires AppIndicator extension on GNOME 40+
- Unpinned dock may not hide on XFCE without compositing
```

---

## 10. Distribution Channels

### 10.1 Primary

| Channel | URL |
|---------|-----|
| GitHub Releases | `https://github.com/kelmankenberg/MyAppImages/releases` |
| GitHub Repository | `https://github.com/kelmankenberg/MyAppImages` |

### 10.2 Future

| Channel | Status |
|---------|--------|
| Flathub | Planned (v2) |
| AUR | Community-maintained |
| Snap Store | Under consideration |
| Official website | Planned |

---

## 11. Minimum System Requirements

| Requirement | Value |
|-------------|-------|
| Architecture | x86_64 |
| RAM | 512 MB (app uses ~150 MB) |
| Disk space | 200 MB (app + cache) |
| Display | 1024×768 minimum |
| Desktop | GNOME, KDE, XFCE, Cinnamon, MATE |
| FUSE | Recommended (for AppImage metadata extraction) |
| Compositor | Recommended (for transparency effects) |

---

## 12. Installation Instructions

### 12.1 AppImage

```bash
# Download
wget https://github.com/kelmankenberg/MyAppImages/releases/download/v1.0.0/MyAppImages-1.0.0-x86_64.AppImage

# Make executable
chmod +x MyAppImages-1.0.0-x86_64.AppImage

# Run
./MyAppImages-1.0.0-x86_64.AppImage

# (Optional) Add to PATH or create desktop entry
```

### 12.2 Debian Package

```bash
# Download
wget https://github.com/kelmankenberg/MyAppImages/releases/download/v1.0.0/myappimages_1.0.0_amd64.deb

# Install
sudo apt install ./myappimages_1.0.0_amd64.deb

# Run from application menu or:
myappimages
```

---

*Document End*
