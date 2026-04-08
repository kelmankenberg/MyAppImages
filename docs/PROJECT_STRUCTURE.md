# Project Structure Document

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Introduction

This document defines the complete project structure, directory layout, and file organization for the AppImage Launcher project.

---

## 2. Root Directory Structure

```
appimage-launcher/
├── docs/                      # Project documentation
├── src/                       # Source code
├── build/                     # Build assets (icons, etc.)
├── dist/                      # Build output (gitignored)
├── tests/                     # Test files
├── scripts/                   # Helper scripts
├── .github/                   # GitHub configurations
├── .vscode/                   # VS Code settings
├── package.json               # Project dependencies
├── package-lock.json          # Locked dependencies
├── tsconfig.json              # TypeScript configuration
├── tsconfig.main.json         # TypeScript config for main process
├── tsconfig.renderer.json     # TypeScript config for renderer
├── vite.config.ts             # Vite configuration
├── electron-builder.json      # Electron builder config
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                # Prettier configuration
├── .gitignore                 # Git ignore rules
├── README.md                  # Project readme
└── LICENSE                    # License file
```

---

## 3. Documentation Structure (`docs/`)

```
docs/
├── PRD.md                     # Product Requirements Document
├── FRD.md                     # Functional Requirements Document
├── UI_UX_DESIGN.md            # UI/UX Design Document
├── TECHNICAL_ARCHITECTURE.md  # Technical Architecture Document
├── PROJECT_STRUCTURE.md       # This file
├── API.md                     # IPC API documentation
├── DEVELOPMENT.md             # Development setup guide
├── TESTING.md                 # Testing guidelines
├── RELEASE.md                 # Release process
└── assets/                    # Documentation assets
    └── screenshots/           # UI screenshots
```

---

## 4. Source Code Structure (`src/`)

```
src/
├── main/                      # Electron main process
│   ├── index.ts               # Main entry point
│   ├── app/
│   │   ├── app.ts             # App lifecycle
│   │   └── window-manager.ts  # Window management
│   ├── services/
│   │   ├── scanner.service.ts     # AppImage scanning
│   │   ├── launcher.service.ts    # AppImage launching
│   │   ├── metadata.service.ts    # Metadata extraction
│   │   └── settings.service.ts    # Settings management
│   ├── ipc/
│   │   ├── handlers.ts        # IPC handlers
│   │   └── channels.ts        # Channel definitions
│   └── utils/
│       ├── file-utils.ts      # File utilities
│       └── logger.ts          # Logging
│
├── renderer/                  # Electron renderer process (React)
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Root component
│   ├── components/
│   │   ├── TitleBar.tsx
│   │   ├── Toolbar.tsx
│   │   ├── AppImageGrid.tsx
│   │   ├── AppImageCard.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── StatusBar.tsx
│   │   ├── ContextMenu.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── hooks/
│   │   ├── useAppImages.ts
│   │   ├── useSettings.ts
│   │   ├── useSearch.ts
│   │   └── useDock.ts
│   ├── store/
│   │   ├── appImageStore.ts
│   │   └── settingsStore.ts
│   ├── services/
│   │   └── ipc.service.ts
│   ├── styles/
│   │   ├── variables.css
│   │   ├── themes.css
│   │   └── global.css
│   ├── types/
│   │   ├── appImage.ts
│   │   ├── settings.ts
│   │   └── global.d.ts
│   └── utils/
│       └── formatters.ts
│
└── preload/                   # Preload script
    └── index.ts               # Context bridge
```

---

## 5. Build Assets Structure (`build/`)

```
build/
├── icons/
│   ├── icon.png               # Main app icon (PNG)
│   ├── icon.ico               # Windows icon
│   ├── icon.icns              # macOS icon
│   ├── 16x16.png
│   ├── 32x32.png
│   ├── 48x48.png
│   ├── 64x64.png
│   ├── 128x128.png
│   ├── 256x256.png
│   └── 512x512.png
├── installer/
│   └── background.tiff        # Installer background (macOS)
└── entitlements/
    ├── entitlements.mac.plist
    └── entitlements.mas.plist
```

---

## 6. Test Structure (`tests/`)

```
tests/
├── unit/                      # Unit tests
│   ├── main/
│   │   ├── scanner.test.ts
│   │   ├── launcher.test.ts
│   │   ├── metadata.test.ts
│   │   └── settings.test.ts
│   └── renderer/
│       ├── AppImageCard.test.tsx
│       ├── AppImageGrid.test.tsx
│       ├── SettingsPanel.test.tsx
│       └── Toolbar.test.tsx
├── integration/               # Integration tests
│   ├── ipc.test.ts
│   └── storage.test.ts
├── e2e/                       # End-to-end tests
│   ├── scanning.spec.ts
│   ├── launching.spec.ts
│   ├── settings.spec.ts
│   └── docking.spec.ts
├── fixtures/                  # Test fixtures
│   ├── mock-appimages/
│   │   ├── TestApp1.AppImage
│   │   └── TestApp2.AppImage
│   └── settings.json
└── helpers/                   # Test utilities
    ├── setup.ts
    └── mocks.ts
```

---

## 7. Scripts Structure (`scripts/`)

```
scripts/
├── build.sh                   # Build script
├── dev.sh                     # Development start script
├── test.sh                    # Test runner
├── lint.sh                    # Linting script
├── release.sh                 # Release preparation
└── extract-metadata.sh        # AppImage metadata extraction helper
```

---

## 8. GitHub Structure (`.github/`)

```
.github/
├── workflows/
│   ├── ci.yml                 # Continuous integration
│   ├── release.yml            # Release workflow
│   └── codeql.yml             # Security analysis
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
├── PULL_REQUEST_TEMPLATE.md
└── CODE_OF_CONDUCT.md
```

---

## 9. VS Code Structure (`.vscode/`)

```
.vscode/
├── settings.json              # Workspace settings
├── extensions.json            # Recommended extensions
├── launch.json                # Debug configurations
└── tasks.json                 # Build tasks
```

---

## 10. File Descriptions

### 10.1 Configuration Files

#### `package.json`

```json
{
  "name": "appimage-launcher",
  "version": "1.0.0",
  "description": "A dockable launcher for AppImage files",
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && electron-builder",
    "build:main": "tsc -p tsconfig.main.json",
    "build:renderer": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:e2e": "playwright test",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "fs-extra": "^11.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.41.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.2.0",
    "@types/fs-extra": "^11.0.4",
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "@vitejs/plugin-react": "^4.2.1",
    "electron": "^28.2.0",
    "electron-builder": "^24.9.1",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "prettier": "^3.2.5",
    "typescript": "^5.3.3",
    "vite": "^5.1.0",
    "vite-plugin-electron": "^0.28.0"
  }
}
```

#### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
      },
      {
        entry: 'src/preload/index.ts',
        onstart(options) {
          options.reload();
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/renderer',
  },
});
```

---

## 11. Naming Conventions

### 11.1 Files & Directories

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.tsx | `AppImageCard.tsx` |
| Hooks | camelCase.ts | `useAppImages.ts` |
| Services | camelCase.service.ts | `scanner.service.ts` |
| Utils | camelCase.utils.ts | `file-utils.ts` |
| Types | camelCase.ts | `appImage.ts` |
| Styles | camelCase.css | `themes.css` |
| Tests | camelCase.test.ts | `scanner.test.ts` |
| Config | kebab-case.json | `electron-builder.json` |

### 11.2 Code Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `appImagePath` |
| Constants | UPPER_SNAKE_CASE | `MAX_ICON_CACHE` |
| Functions | camelCase | `extractMetadata()` |
| Classes | PascalCase | `AppImageScanner` |
| Interfaces | PascalCase | `AppImageEntry` |
| Types | PascalCase | `DockPosition` |
| Enums | PascalCase | `Theme` |

---

## 12. Git Ignore Rules (`.gitignore`)

```
# Dependencies
node_modules/

# Build output
dist/
out/

# Environment
.env
.env.local

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea/

# OS
.DS_Store
Thumbs.db
*.log

# Electron
*.log

# Coverage
coverage/

# Test artifacts
test-results/
playwright-report/
```

---

## 13. Module Dependencies Graph

```
┌──────────────────────────────────────────────────────────────┐
│                        Dependencies                           │
├──────────────────┬───────────────────────────────────────────┤
│  main/index.ts   │  electron                                 │
├──────────────────┼───────────────────────────────────────────┤
│  scanner.service │  fs-extra, path, crypto                   │
├──────────────────┼───────────────────────────────────────────┤
│  launcher.service│  child_process, fs                        │
├──────────────────┼───────────────────────────────────────────┤
│  settings.service│  electron-store                            │
├──────────────────┼───────────────────────────────────────────┤
│  ipc/handlers.ts  │  All services                              │
├──────────────────┼───────────────────────────────────────────┤
│  React Components│  react, react-router-dom                   │
├──────────────────┼───────────────────────────────────────────┤
│  Store           │  zustand                                   │
├──────────────────┼───────────────────────────────────────────┤
│  IPC Service     │  electron (ipcRenderer)                    │
└──────────────────┴───────────────────────────────────────────┘
```

---

## 14. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Developer | TBD | | |
| Project Manager | TBD | | |

---

*Document End*
