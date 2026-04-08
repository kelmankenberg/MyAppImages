# UI/UX Design Document

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Introduction

This document defines the user interface and user experience design for the AppImage Launcher application.

---

## 2. Design Principles

1. **Minimalism** — Clean, uncluttered interface focused on content
2. **Consistency** — Uniform styling across all components
3. **Accessibility** — Keyboard navigation, readable contrast ratios
4. **Responsiveness** — Smooth animations, instant feedback
5. **Linux Native Feel** — Respect Linux desktop conventions and patterns

---

## 3. Layout Specifications

### 3.1 Main Window Layout

```
┌─────────────────────────────────────────────┐
│  [☰]  AppImage Launcher         [─][□][✕]  │  ← Title Bar
├─────────────────────────────────────────────┤
│  [🔍 Search AppImages...]      [⚙ Settings] │  ← Toolbar
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │         │ │         │ │         │       │
│  │  Icon   │ │  Icon   │ │  Icon   │  ...  │  ← AppImage Grid
│  │         │ │         │ │         │       │
│  │  Name   │ │  Name   │ │  Name   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │         │ │         │ │         │       │
│  │  Icon   │ │  Icon   │ │  Icon   │  ...  │
│  │         │ │         │ │         │       │
│  │  Name   │ │  Name   │ │  Name   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
├─────────────────────────────────────────────┤
│  24 AppImages  |  Last scanned: 2 min ago   │  ← Status Bar
└─────────────────────────────────────────────┘
```

### 3.2 Docked Mode Layouts

#### Left Dock
```
┌──────────┬──────────────────────────────────┐
│ [☰]      │                                  │
│          │                                  │
│ [🔍]     │       MAIN DESKTOP               │
│          │                                  │
│ ┌──────┐ │                                  │
│ │ Icon │ │                                  │
│ │ Name │ │                                  │
│ └──────┘ │                                  │
│ ┌──────┐ │                                  │
│ │ Icon │ │                                  │
│ │ Name │ │                                  │
│ └──────┘ │                                  │
│   ...    │                                  │
│          │                                  │
│ [⚙]      │                                  │
└──────────┴──────────────────────────────────┘
```

#### Right Dock
```
┌──────────────────────────────────┬──────────┐
│                                  │ [☰]      │
│                                  │          │
│       MAIN DESKTOP               │ [🔍]     │
│                                  │          │
│                                  │ ┌──────┐ │
│                                  │ │ Icon │ │
│                                  │ │ Name │ │
│                                  │ └──────┘ │
│                                  │ ┌──────┐ │
│                                  │ │ Icon │ │
│                                  │ │ Name │ │
│                                  │ └──────┘ │
│                                  │   ...    │
│                                  │ [⚙]      │
└──────────────────────────────────┴──────────┘
```

#### Top Dock
```
┌─────────────────────────────────────────────┐
│ [☰]  AppImage Launcher    [🔍 Search]  [⚙]  │  ← Docked Header
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ Icon │ │ Icon │ │ Icon │ │ Icon │  ...   │  ← Horizontal Scroll
│ └──────┘ └──────┘ └──────┘ └──────┘        │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│              MAIN DESKTOP                   │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

#### Bottom Dock
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              MAIN DESKTOP                   │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ [☰]  AppImage Launcher    [🔍 Search]  [⚙]  │  ← Docked Footer
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ Icon │ │ Icon │ │ Icon │ │ Icon │  ...   │  ← Horizontal Scroll
│ └──────┘ └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────────────┘
```

### 3.3 Pin/Unpin Behavior

```
Pinned (Always Visible)     Unpinned (Focus Visible)     Unpinned (Hidden)
┌──────────┐                ┌──────────┐                 ┌──────────┐
│          │                │          │                 │          │
│  APP     │                │  APP     │                 │          │
│  GRID    │     blur →     │  GRID    │  mouse to  →   │    >     │ ← Peek tab
│          │                │          │     edge        │          │
│  [📌]    │                │  [📌/ ]   │                │  [📌/ ]  │
└──────────┘                └──────────┘                 └──────────┘

• Pin icon (📌) in toolbar toggles between pinned/unpinned
• When unpinned, dock hides on blur and reappears on mouse hover at docked edge
• When pinned, dock remains visible regardless of focus
```

---

## 4. Component Specifications

### 4.1 Title Bar

| Property | Value |
|----------|-------|
| Height | 32px |
| Background | Theme primary color |
| Text | App name, left-aligned |
| Controls | Standard min/max/close buttons |
| Custom | Frameless window with custom drag region |

### 4.2 Toolbar

| Property | Value |
|----------|-------|
| Height | 48px |
| Background | Theme secondary color |
| Search Input | Full-width with icon, placeholder text |
| Pin Button | Pin/unpin toggle icon |
| Settings Button | Right-aligned, gear icon |

### 4.3 AppImage Card

| Property | Value |
|----------|-------|
| Width/Height | Configurable (48px, 64px, 96px, 128px) |
| Border Radius | 8px |
| Hover Effect | Scale 1.05, shadow elevation |
| Click Effect | Ripple animation |
| Icon Area | 70% of card height |
| Text Area | 30% of card height, centered, truncated |

**States:**
- **Default:** Normal opacity
- **Hover:** +10% brightness, drop shadow
- **Active/Pressed:** -5% brightness, scale 0.98
- **Disabled:** 50% opacity

### 4.4 Search Input

| Property | Value |
|----------|-------|
| Height | 32px |
| Border Radius | 16px (pill shape) |
| Placeholder | "Search AppImages..." |
| Clear Button | Appears when text entered |
| Focus State | Highlight border, subtle glow |

### 4.5 Settings Panel

| Property | Value |
|----------|-------|
| Width | 400px (fixed) |
| Height | 80% of window |
| Position | Slide-in from right |
| Overlay | Dim background (50% opacity) |
| Close | X button, click outside, ESC key |

**Settings Sections:**
```
┌──────────────────────────────┐
│ Settings               [✕]   │
├──────────────────────────────┤
│ ▼ General                    │
│   ├─ Scan Directories        │
│   │   [Add Directory]        │
│   │   • /home/user/AppImages │
│   │     [Remove]             │
│   └─ Refresh Interval        │
│       [Auto] [Manual]        │
├──────────────────────────────┤
│ ▼ Appearance                 │
│   ├─ Theme                   │
│   │   (•) Light              │
│   │   ( ) Dark               │
│   │   ( ) System             │
│   ├─ Icon Size               │
│   │   [---●---] 64px         │
│   └─ Window Opacity          │
│       [---●------] 85%       │
├──────────────────────────────┤
│ ▼ Dock                       │
│   ├─ Position                │
│   │   ( ) Top  (•) Left     │
│   │   ( ) Right ( ) Bottom  │
│   │   ( ) None (Floating)   │
│   ├─ Pinned                 │
│   │   [Toggle]               │
│   └─ Always on Top          │
│       [Toggle]               │
├──────────────────────────────┤
│ ▼ Advanced                   │
│   ├─ Custom Launch Args      │
│   │   [Manage]               │
│   ├─ Minimize to Tray        │
│   │   [Toggle]               │
│   └─ Reset to Defaults       │
│       [Reset]                │
├──────────────────────────────┤
│ [Save] [Cancel]              │
└──────────────────────────────┘
```

### 4.6 Context Menu

| Property | Value |
|----------|-------|
| Width | 200px (min) |
| Border Radius | 6px |
| Shadow | Elevation level 3 |
| Animation | Fade in (150ms) |

**Menu Items:**
```
┌──────────────────────┐
│ ▶ Launch             │
├──────────────────────┤
│ 📁 Open File Location│
│ ✏️ Edit Properties    │
├──────────────────────┤
│ 🗑️ Remove from Index │
└──────────────────────┘
```

### 4.7 Status Bar

| Property | Value |
|----------|-------|
| Height | 24px |
| Background | Theme subtle color |
| Text Size | 11px |
| Content | Left: AppImage count | Right: Last scan time |

---

## 5. Color Palette

### 5.1 Light Theme

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#FFFFFF` | Main background |
| `--bg-secondary` | `#F5F5F5` | Toolbar, panels |
| `--bg-tertiary` | `#EEEEEE` | Cards, inputs |
| `--text-primary` | `#212121` | Primary text |
| `--text-secondary` | `#757575` | Secondary text |
| `--accent` | `#1976D2` | Links, buttons, highlights |
| `--accent-hover` | `#1565C0` | Hover state |
| `--border` | `#E0E0E0` | Borders, dividers |
| `--success` | `#4CAF50` | Success states |
| `--warning` | `#FF9800` | Warning states |
| `--error` | `#F44336` | Error states |

### 5.2 Dark Theme

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#1E1E1E` | Main background |
| `--bg-secondary` | `#2D2D2D` | Toolbar, panels |
| `--bg-tertiary` | `#383838` | Cards, inputs |
| `--text-primary` | `#E0E0E0` | Primary text |
| `--text-secondary` | `#9E9E9E` | Secondary text |
| `--accent` | `#64B5F6` | Links, buttons, highlights |
| `--accent-hover` | `#42A5F5` | Hover state |
| `--border` | `#424242` | Borders, dividers |
| `--success` | `#81C784` | Success states |
| `--warning` | `#FFB74D` | Warning states |
| `--error` | `#E57373` | Error states |

---

## 6. Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Title Bar | System UI | 14px | 500 | 32px |
| App Name | System UI | 12px | 400 | 16px |
| Search Input | System UI | 14px | 400 | 32px |
| Settings Header | System UI | 16px | 600 | 24px |
| Settings Label | System UI | 13px | 500 | 20px |
| Status Bar | System UI | 11px | 400 | 24px |
| Button Text | System UI | 13px | 500 | 20px |

**System UI Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
  Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

---

## 7. Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight spacing |
| `--space-sm` | 8px | Small gaps |
| `--space-md` | 16px | Standard gaps |
| `--space-lg` | 24px | Section gaps |
| `--space-xl` | 32px | Major sections |

---

## 8. Animations & Transitions

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Card Hover | Scale | 150ms | ease-out |
| Card Press | Scale | 100ms | ease-in |
| Settings Panel | Slide In | 300ms | ease-out |
| Context Menu | Fade In | 150ms | ease-out |
| Auto-Hide Reveal | Slide | 200ms | ease-out |
| Auto-Hide Hide | Slide | 250ms | ease-in |
| Search Filter | Fade | 100ms | linear |
| Window Resize | N/A | 200ms | ease-out |

---

## 9. Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Focus search input |
| `Ctrl+,` | Open settings |
| `ESC` | Close settings, clear search |
| `Enter` | Launch selected AppImage |
| `↑/↓/←/→` | Navigate grid |
| `Tab` | Navigate focusable elements |
| `Shift+Tab` | Reverse focus navigation |
| `Delete` | Remove selected from index (with confirmation) |
| `Alt+F4` | Close application |

---

## 10. Responsive Behavior

### 10.1 Window Size Constraints

| Property | Value |
|----------|-------|
| Minimum Width | 320px |
| Minimum Height | 240px |
| Default Width | 800px |
| Default Height | 600px |

### 10.2 Grid Column Calculation

```
columns = floor((containerWidth - padding * 2) / (cardSize + gap))
```

| Container Width | Card Size | Columns |
|-----------------|-----------|---------|
| 320px | 64px | 4 |
| 480px | 64px | 6 |
| 640px | 64px | 8 |
| 800px | 64px | 10 |
| 800px | 96px | 7 |
| 800px | 128px | 5 |

---

## 11. Empty States

### 11.1 No AppImages Indexed

```
┌────────────────────────────────┐
│                                │
│          📦                    │
│                                │
│     No AppImages Found         │
│                                │
│  Add directories in Settings   │
│  or click "Add AppImage"       │
│                                │
│     [Open Settings]            │
│                                │
└────────────────────────────────┘
```

### 11.2 No Search Results

```
┌────────────────────────────────┐
│                                │
│          🔍                    │
│                                │
│   No results for "xyz"         │
│                                │
│     [Clear Search]             │
│                                │
└────────────────────────────────┘
```

---

## 12. Loading States

### 12.1 Initial Scan

```
┌────────────────────────────────┐
│                                │
│        ⏳ Scanning...          │
│                                │
│   ████████████░░░░░░  65%      │
│                                │
│   Found 24 AppImages...        │
│                                │
└────────────────────────────────┘
```

### 12.2 Skeleton Loading

```
┌──────┐ ┌──────┐ ┌──────┐
│ ░░░░ │ │ ░░░░ │ │ ░░░░ │
│ ░░░░ │ │ ░░░░ │ │ ░░░░ │
│ ░░░░ │ │ ░░░░ │ │ ░░░░ │
└──────┘ └──────┘ └──────┘
```

---

## 13. Iconography

| Icon | Source | Usage |
|------|--------|-------|
| AppImage Default | Custom SVG | Placeholder for apps without icons |
| Search | Material Icons | Search input |
| Settings/Gear | Material Icons | Settings button |
| Launch/Play | Material Icons | Launch action |
| Folder | Material Icons | Open location |
| Delete | Material Icons | Remove action |
| Close (X) | Material Icons | Close dialogs |
| Add (+) | Material Icons | Add directory |
| Refresh | Material Icons | Rescan |

---

## 14. Accessibility Requirements

- All interactive elements must be keyboard accessible
- Color contrast ratio minimum 4.5:1 (WCAG AA)
- Focus indicators visible on all interactive elements
- ARIA labels on icon-only buttons
- Screen reader friendly structure
- Skip navigation option

---

## 15. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| UI/UX Designer | TBD | | |
| Product Owner | TBD | | |

---

*Document End*
