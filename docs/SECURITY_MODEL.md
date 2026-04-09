# Security & Permissions Model

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Overview

The AppImage Launcher executes arbitrary binary files on the user's system. This document defines the security model, threat analysis, risk mitigations, and permission requirements.

---

## 2. Threat Model

### 2.1 Threat Actors

| Actor | Capability | Likelihood |
|-------|-----------|------------|
| Malicious AppImage author | Distributes AppImage with hidden payloads | Medium |
| Compromised AppImage | Legitimate AppImage replaced with trojaned version | Low |
| Local attacker | Modifies indexed AppImage files | Low |
| Phishing | Social engineering to launch untrusted AppImage | Medium |

### 2.2 Attack Vectors

| Vector | Description |
|--------|-------------|
| Arbitrary code execution | AppImages are self-contained executables with no sandbox |
| Privilege escalation | User may grant elevated permissions via properties |
| Path traversal | Malformed paths could access unintended files |
| Environment injection | Custom env vars could alter AppImage behavior |
| Denial of service | Resource-heavy AppImages could freeze the system |

---

## 3. Core Security Principles

1. **Never execute without user intent** — Launch only on explicit user action
2. **Warn on first launch** — User must acknowledge before running an unknown AppImage
3. **Least privilege** — Never elevate unless explicitly configured
4. **Transparency** — Log all launch attempts, paths, and arguments
5. **Defense in depth** — Multiple layers of validation, not just one

---

## 4. First-Launch Warning

### 4.1 Behavior

When launching an AppImage for the first time (launchCount === 0):

```
┌──────────────────────────────────────────┐
│ ⚠️ First Launch Warning                  │
├──────────────────────────────────────────┤
│                                          │
│ You are about to launch:                 │
│                                          │
│   [Icon]  AppName                        │
│           /path/to/App.AppImage          │
│                                          │
│ This AppImage has not been launched      │
│ before from MyAppImages. Ensure you      │
│ trust the source before proceeding.      │
│                                          │
├──────────────────────────────────────────┤
│  [Cancel]          [Launch Anyway]       │
└──────────────────────────────────────────┘
```

### 4.2 Bypass Option

User can check "Don't show this again" to suppress future first-launch warnings. Stored in settings:

```typescript
interface Settings {
  // ...
  suppressFirstLaunchWarning: boolean; // default: false
}
```

---

## 5. File Permission Handling

### 5.1 Executable Bit

AppImages require the executable bit (`+x`) to run. The launcher handles this automatically:

```typescript
async function ensureExecutable(path: string): Promise<void> {
  const stats = fs.statSync(path);
  const isExecutable = stats.mode & fs.constants.S_IXUSR;
  
  if (!isExecutable) {
    logger.info(`Setting executable bit: ${path}`);
    await fs.chmod(path, stats.mode | 0o755);
  }
}
```

**Security note:** Only set `+x` on files the launcher has verified are AppImages (via magic bytes or extension). Never set `+x` on arbitrary files.

### 5.2 Ownership Check

Warn if the AppImage is owned by a different user (potential tampering):

```typescript
function checkOwnership(path: string): boolean {
  const stats = fs.statSync(path);
  return stats.uid === process.getuid();
}
```

If ownership differs, show a warning before launch.

### 5.3 Write Permission Check

If the AppImage is writable by other users, warn about potential tampering:

```typescript
function isWorldWritable(path: string): boolean {
  const stats = fs.statSync(path);
  return !!(stats.mode & fs.constants.S_IWOTH);
}
```

---

## 6. Elevated Privileges (sudo)

### 6.1 Behavior

When a user enables "Run with Elevated Privileges" for an AppImage:

1. The launcher prepends `pkexec` (PolicyKit) or `sudo` to the launch command
2. The system prompts for the user's password
3. The AppImage runs as root

### 6.2 Warning Dialog

```
┌──────────────────────────────────────────┐
│ 🔒 Elevated Privileges                   │
├──────────────────────────────────────────┤
│                                          │
│ This AppImage will run with root         │
│ privileges. A malicious AppImage could   │
│ damage your system.                      │
│                                          │
│ Only enable this if you fully trust      │
│ the AppImage source.                     │
│                                          │
├──────────────────────────────────────────┤
│  [Cancel]          [Enable Anyway]       │
└──────────────────────────────────────────┘
```

### 6.3 Implementation

```typescript
function buildLaunchCommand(entry: AppImageEntry): string[] {
  const cmd = [entry.path];
  
  if (entry.customArgs) {
    cmd.push(...shlex.split(entry.customArgs));
  }
  
  if (entry.elevated) {
    // Prefer pkexec (graphical) over sudo (terminal)
    return ['pkexec', ...cmd];
  }
  
  return cmd;
}
```

**Note:** `pkexec` is preferred on graphical desktops because it shows a GUI password prompt. `sudo` requires a terminal.

---

## 7. Sandboxed Execution

### 7.1 Overview

Sandbox mode uses `firejail` to restrict the AppImage's access to the filesystem and network.

### 7.2 Requirements

- `firejail` must be installed on the system
- If not found, show an error and prompt to install

### 7.3 Implementation

```typescript
function buildSandboxCommand(entry: AppImageEntry): string[] {
  const baseCmd = entry.elevated 
    ? ['pkexec', 'firejail'] 
    : ['firejail'];
  
  const sandboxArgs = [
    '--quiet',
    '--net=none',           // No network access
    '--private',            // Private home directory
    '--private-bin=true',   // Private /bin
    `--private-dev`,        // Private /dev
  ];
  
  if (entry.workingDirectory) {
    sandboxArgs.push(`--private=${entry.workingDirectory}`);
  }
  
  return [...baseCmd, ...sandboxArgs, entry.path];
}
```

### 7.4 Limitations

| Limitation | Description |
|------------|-------------|
| Some AppImages may not work | GUI apps with specific requirements (e.g., GPU access) |
| firejail not installed | Sandboxing unavailable; show error |
| Performance overhead | Slight startup delay for sandbox setup |

---

## 8. Path Validation

### 8.1 Absolute Path Enforcement

All paths stored in the index must be absolute:

```typescript
function validatePath(p: string): boolean {
  return path.isAbsolute(p) && fs.existsSync(p);
}
```

### 8.2 Symlink Resolution

Resolve symlinks to their real path to prevent confusion:

```typescript
function resolveAppImagePath(p: string): string {
  return fs.realpathSync(p);
}
```

### 8.3 Path Traversal Prevention

When accepting user input for paths (e.g., working directory):

```typescript
function sanitizeWorkingDirectory(input: string): string | null {
  const resolved = path.resolve(input);
  
  // Ensure it doesn't escape expected boundaries
  if (resolved.includes('..')) {
    return null; // Reject
  }
  
  return resolved;
}
```

---

## 9. Launch Argument Sanitization

### 9.1 Shell Injection Prevention

Never pass arguments through a shell. Use `spawn` with array arguments:

```typescript
// ❌ INSECURE - shell injection possible
spawn(`bash -c "${entry.path} ${entry.customArgs}"`);

// ✅ SECURE - arguments are not interpreted
spawn(entry.path, shlex.split(entry.customArgs || ''));
```

### 9.2 Argument Validation

Custom arguments are displayed in the Properties panel and logged before execution. No filtering is applied (user may need shell metacharacters), but the user is shown a preview:

```
Launch Preview:
  Command: /path/to/App.AppImage
  Args: --config ~/.myapp/config.json
  Working Dir: /home/user
  Elevated: No
  Sandbox: No
```

---

## 10. Environment Variable Security

### 10.1 Inheritance

By default, AppImages inherit the launcher's environment. Custom env vars are merged on top:

```typescript
function buildEnvironment(entry: AppImageEntry): NodeJS.ProcessEnv {
  const env = { ...process.env };
  
  if (entry.envVars) {
    Object.assign(env, entry.envVars);
  }
  
  return env;
}
```

### 10.2 Dangerous Variables

Block setting variables that could compromise security:

```typescript
const BLOCKED_ENV_VARS = [
  // Dynamic linker (LD_*) — injection vectors
  'LD_PRELOAD',
  'LD_LIBRARY_PATH',
  'LD_AUDIT',
  'LD_DEBUG',
  'LD_ORIGIN_PATH',
  'LD_BIND_NOW',
  'LD_BIND_NOW',
  // Privilege escalation
  'PATH',
  'HOME',
  'USER',
  'SUDO_UID',
  'SUDO_GID',
  'SUDO_COMMAND',
  'SUDO_USER',
  // IPC / session (could be used for lateral attacks)
  'XDG_RUNTIME_DIR',
  'DBUS_SESSION_BUS_ADDRESS',
  'SSH_AUTH_SOCK',
  'SSH_AGENT_PID',
  // Secrets that may leak to child processes
  'GITHUB_TOKEN',
  'GH_TOKEN',
  'AWS_SECRET_ACCESS_KEY',
];

function validateEnvVars(vars: Record<string, string>): string[] {
  return Object.keys(vars).filter(key => 
    BLOCKED_ENV_VARS.includes(key.toUpperCase())
  );
}
```

If blocked variables are detected, warn the user and refuse to save.

### 10.3 Environment Whitelist Approach

Rather than passing the entire parent environment, a **whitelist approach** is safer for v1.0:

```typescript
const ALLOWED_ENV_VARS = [
  'DISPLAY',
  'WAYLAND_DISPLAY',
  'XDG_CURRENT_DESKTOP',
  'XDG_SESSION_TYPE',
  'LANG',
  'LANGUAGE',
  'LC_ALL',
  'TERM',
  'HOME',         // Needed by many AppImages
  'USER',         // Needed by many AppImages
  'PATH',         // Needed for finding system tools
  'XDG_DATA_DIRS',
  'XDG_CONFIG_DIRS',
  'GTK_THEME',
  'QT_STYLE_OVERRIDE',
  'PULSE_SERVER', // Audio
  'PIPEWIRE_LATENCY', // Audio
];

function buildSecureEnvironment(entry: AppImageEntry): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  
  for (const key of ALLOWED_ENV_VARS) {
    if (process.env[key]) {
      env[key] = process.env[key];
    }
  }
  
  // Merge user-defined env vars (already validated against BLOCKED list)
  if (entry.envVars) {
    Object.assign(env, entry.envVars);
  }
  
  return env;
}
```

**Trade-off:** Some AppImages may need environment variables not on the whitelist. Users can add them via the custom env vars UI. This is safer than passing everything.

### 10.4 GUI Display Variables

`DISPLAY` and `WAYLAND_DISPLAY` are **required** for GUI AppImages to work. They are always passed (on the whitelist). Sandboxed execution via firejail also forwards these by default.

---

## 11. Electron Security

### 11.1 Process Hardening

| Setting | Value | Rationale |
|---------|-------|-----------|
| `nodeIntegration` | `false` | Prevent renderer from accessing Node APIs directly |
| `contextIsolation` | `true` | Isolate preload script from renderer |
| `sandbox` | `true` (if possible) | Restrict renderer process capabilities |
| `webSecurity` | `true` | Enforce same-origin policy |
| `allowRunningInsecureContent` | `false` | Block mixed content |

### 11.2 Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: file:; 
               connect-src 'none'; 
               font-src 'self';">
```

### 11.3 Preload Script

Only expose the minimum necessary IPC bridge (see [IPC Protocol §7](./IPC_PROTOCOL.md#7-preload-script-contract)).

### 11.4 Protocol Handlers

Disable all protocol handlers except `file:`:

```typescript
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
  contents.on('will-navigate', (event) => {
    event.preventDefault();
  });
});
```

---

## 12. Logging & Audit

### 12.1 Launch Log

Every launch attempt is logged:

```json
{
  "timestamp": "2026-04-08T16:30:00Z",
  "action": "launch",
  "appId": "uuid-here",
  "appName": "MyApp",
  "appPath": "/home/user/Apps/MyApp.AppImage",
  "args": "--config /home/user/.myapp/config.json",
  "elevated": false,
  "sandbox": false,
  "workingDirectory": "/home/user",
  "pid": 12345,
  "result": "success" | "failed" | "denied",
  "error": null
}
```

### 12.2 Log Location

```
~/.local/state/appimage-launcher/logs/launch.log
```

### 12.3 Log Rotation

- Max file size: 5 MB
- Max files: 5
- Older logs are automatically deleted

---

## 13. Settings File Security

### 13.1 Permissions

Settings file should be readable/writable only by the owner:

```typescript
fs.chmodSync(settingsPath, 0o600);
```

### 13.2 Corruption/Recovery

If settings file is corrupt or unreadable:

1. Back it up to `settings.json.bak`
2. Reset to defaults
3. Notify user: "Settings were reset due to corruption"

---

## 14. User Education

### 14.1 In-App Security Tips

Show occasional, non-intrusive tips:

- "Only run AppImages from sources you trust"
- "Sandbox mode restricts AppImage access to your files"
- "Check the AppImage hash before launching if you're unsure"

### 14.2 Documentation

Link to external resources:
- [AppImage Security documentation](https://docs.appimage.org/introduction/security.html)
- [Running untrusted software on Linux](https://www.linuxsecurity.com/)

---

## 15. Known Security Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| AppImages are inherently trusted | User must trust the source | Warning dialogs, first-launch notice |
| No AppImage signature verification | Cannot verify authorship | Future: integrate with AppImage signing |
| firejail sandbox is not perfect | Some escapes are possible | Use as defense-in-depth, not absolute protection |
| Electron renderer could have vulnerabilities | Potential privilege escalation | Keep Electron updated, use CSP |
| No AppImage reputation system | No centralized trust signals | Future: community ratings |

---

*Document End*
