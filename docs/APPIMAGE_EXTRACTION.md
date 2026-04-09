# AppImage Metadata Extraction Deep Dive

## AppImage Launcher

**Version:** 1.0  
**Date:** April 8, 2026  
**Status:** Draft  

---

## 1. Overview

AppImage files are self-contained, executable application bundles. Extracting metadata (name, icon, version) is non-trivial because the format has evolved and uses multiple packaging methods. This document covers every extraction approach.

---

## 2. AppImage Format Versions

### 2.1 Type 1 (Legacy)

- **Structure:** ELF binary with embedded ISO 9660 filesystem
- **Magic bytes:** `7f 45 4c 46` (ELF header)
- **Mount mechanism:** FUSE mount via `--appimage-mount` flag
- **Metadata location:** Inside mounted filesystem at `.DirIcon` and `*.desktop`
- **Prevalence:** Rare, mostly pre-2018 files

### 2.2 Type 2 (Current)

- **Structure:** ELF binary with embedded squashfs filesystem
- **Magic bytes:** `7f 45 4c 46` (ELF header) + AppImage-specific markers
- **Mount mechanism:** FUSE mount via `--appimage-mount` flag or runtime extraction
- **Metadata location:** Inside mounted filesystem at `.DirIcon` and `.DirEntry.desktop`
- **Prevalence:** Dominant, most AppImages on the market

### 2.3 Identification

```bash
# Type 1: ISO 9660 offset in ELF
readelf -p .rodata MyApp.AppImage | grep -i "iso"

# Type 2: Squashfs marker
strings MyApp.AppImage | grep -i "hsqs"

# Universal check
file MyApp.AppImage
# Output: AppImage type 2 executable, ...
```

---

## 3. Extraction Strategy (Priority Order)

### Method 1: libappimage (Preferred)

[`libappimage`](https://github.com/AppImage/libappimage) is the official C library for AppImage operations. It handles both types.

**What it provides:**
- `.desktop` file parsing
- Icon extraction
- Metadata extraction (name, version, comment, categories)
- Type detection

**Node.js binding options:**
- No well-maintained N-API binding exists as of April 2026
- **Strategy:** Shell out to `libappimage` CLI tools or parse manually

**Available CLI tools (if `libappimage` installed):**
```bash
appimagetool --list MyApp.AppImage     # List contents
appimaged --version                     # Check daemon version
```

### Method 2: FUSE Mount (Reliable Fallback)

Mount the AppImage, read its `.desktop` file and icon directly.

```bash
# Mount
./MyApp.AppImage --appimage-mount

# This prints the mount point to stdout:
# /tmp/.mount_MyApp12345

# Read .desktop file
cat /tmp/.mount_MyApp12345/*.desktop

# Read icon
cp /tmp/.mount_MyApp12345/.DirIcon /path/to/cache/
```

**Implementation:**

```typescript
import { spawn } from 'child_process';

async function mountAppImage(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(path, ['--appimage-mount'], {
      env: { ...process.env, APPIMAGE_EXTRACT_AND_RUN: '1' }
    });

    let mountPoint = '';
    
    proc.stdout.on('data', (data: Buffer) => {
      mountPoint = data.toString().trim();
      resolve(mountPoint);
    });

    proc.stderr.on('data', (data: Buffer) => {
      reject(new Error(data.toString()));
    });

    proc.on('error', reject);
  });
}

async function unmountAppImage(mountPoint: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('fusermount', ['-u', mountPoint]);
    proc.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`Unmount failed with code ${code}`));
    });
  });
}
```

**Drawbacks:**
- Slow (FUSE mount/unmount per file)
- Requires FUSE kernel module
- May fail on systems with restrictive FUSE policies

### Method 3: Extract Without Mount (Fast)

Use the `--appimage-extract` flag to dump contents to a temp directory.

```bash
./MyApp.AppImage --appimage-extract '*.desktop'
./MyApp.AppImage --appimage-extract '.DirIcon'
```

**Implementation:**

```typescript
async function extractMetadataFast(path: string): Promise<AppImageMetadata> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'appimage-meta-'));
  
  try {
    // Extract .desktop file
    await exec(`${path} --appimage-extract '*.desktop'`, { cwd: tempDir });
    
    // Find .desktop file
    const desktopFiles = glob.sync('**/*.desktop', { cwd: tempDir });
    if (desktopFiles.length === 0) return fallbackExtract(path);
    
    const desktopContent = fs.readFileSync(
      path.join(tempDir, desktopFiles[0]), 'utf-8'
    );
    
    // Parse .desktop file
    const meta = parseDesktopFile(desktopContent);
    
    // Try to extract icon
    try {
      await exec(`${path} --appimage-extract .DirIcon`, { cwd: tempDir });
      const iconPath = path.join(tempDir, '.DirIcon');
      if (fs.existsSync(iconPath)) {
        meta.icon = fs.readFileSync(iconPath);
      }
    } catch {
      // No icon, use fallback
    }
    
    return meta;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
```

### Method 4: Binary Parsing (Last Resort)

Read the ELF header and search for embedded metadata without executing the file. This is complex but requires no FUSE.

**Approach:**
1. Read ELF header to confirm it's an executable
2. Search for `.DirIcon` marker in binary
3. Search for `Name=` in `.desktop` content
4. Use `strings` command or regex on raw bytes

```typescript
async function extractMetadataFromBinary(path: string): Promise<Partial<AppImageMetadata>> {
  const buffer = fs.readFileSync(path);
  
  // Check ELF magic
  if (buffer[0] !== 0x7f || buffer[1] !== 0x45 || 
      buffer[2] !== 0x4c || buffer[3] !== 0x46) {
    throw new Error('Not an ELF file');
  }
  
  // Search for Name= in desktop entry
  const nameMatch = buffer.toString('utf-8').match(/Name=(.+)\n/);
  const versionMatch = buffer.toString('utf-8').match(/X-AppImage-Version=(.+)\n/);
  
  return {
    name: nameMatch?.[1]?.trim(),
    version: versionMatch?.[1]?.trim(),
  };
}
```

---

## 4. .desktop File Parsing

All extraction methods ultimately need to parse a `.desktop` file. The format follows the [Desktop Entry Specification](https://specifications.freedesktop.org/desktop-entry-spec/latest/).

### 4.1 Relevant Fields

| Key | Type | Required | Usage |
|-----|------|----------|-------|
| `Name` | string | Yes | Display name |
| `Exec` | string | Yes | Launch command (ignore; we use the AppImage directly) |
| `Icon` | string | No | Icon name or path |
| `Comment` | string | No | Description/subtitle |
| `Type` | string | Yes | Always `Application` |
| `Categories` | string | No | Semicolon-separated categories |
| `X-AppImage-Version` | string | No | Version string |
| `X-AppImage-Build-ID` | string | No | Build identifier |

### 4.2 Parser Implementation

```typescript
interface DesktopEntry {
  name: string;
  exec?: string;
  icon?: string;
  comment?: string;
  categories?: string[];
  version?: string;
  buildId?: string;
  raw: Record<string, string>;
}

function parseDesktopFile(content: string): DesktopEntry {
  const result: Record<string, string> = {};
  let inDesktopEntry = false;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    
    if (trimmed === '[Desktop Entry]') {
      inDesktopEntry = true;
      continue;
    }
    
    if (trimmed.startsWith('[') && inDesktopEntry) {
      break; // End of Desktop Entry section
    }
    
    if (!inDesktopEntry || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split('=');
    result[key.trim()] = valueParts.join('=').trim();
  }

  return {
    name: result['Name'] || '',
    exec: result['Exec'],
    icon: result['Icon'],
    comment: result['Comment'],
    categories: result['Categories']?.split(';').filter(Boolean),
    version: result['X-AppImage-Version'],
    buildId: result['X-AppImage-Build-ID'],
    raw: result,
  };
}
```

---

## 5. Icon Extraction

### 5.1 Sources (in priority order)

1. **`.DirIcon`** — Standard location, PNG format, usually 256x256
2. **`usr/share/icons/`** — Inside mounted AppImage, multiple sizes
3. **`Icon=` key in .desktop** — May reference a relative path or name
4. **Default icon** — Custom SVG bundled with the launcher

### 5.2 Icon Processing Pipeline

```
AppImage File
    │
    ▼
┌─────────────────────┐
│ Extract .DirIcon    │  ← Primary source
│ (PNG, usually)      │
└────────┬────────────┘
         │
         ▼ Exists?
    ┌────┴────┐
    │  Yes    │  No
    ▼         ▼
┌─────────┐ ┌──────────────────────┐
│ Resize   │ │ Search .desktop      │
│ to ≤64px │ │ Icon= key            │
│ for cache│ │                      │
└─────────┘ └──────────┬───────────┘
         │              │
         ▼              ▼
    ┌────────────────────────┐
    │ Convert to PNG/JPEG    │
    │ Store in icon cache    │
    └──────────┬─────────────┘
               │
               ▼
         ┌─────┴──────┐
         │  Success?  │
         └─────┬──────┘
          Yes  │  No
               ▼
         ┌─────────────┐
         │ Use default │
         │ launcher    │
         │ icon        │
         └─────────────┘
```

### 5.3 Icon Cache Strategy

```typescript
interface IconCache {
  // Key: SHA-256 hash of AppImage file
  // Value: path to cached PNG in ~/.cache/appimage-launcher/icons/
  [fileHash: string]: string;
}
```

- Icons are extracted once and cached
- Cache key is the SHA-256 hash of the AppImage file
- If the hash changes (AppImage updated), re-extract
- Max cache size: 100 icons, LRU eviction

---

## 6. Recommended Extraction Strategy

For v1.0, use a **tiered approach**:

```
1. Try --appimage-extract (no FUSE dependency)
   ├── Success → parse .desktop + .DirIcon
   └── Fail → 
2.    Try --appimage-mount (FUSE)
       ├── Success → parse .desktop + .DirIcon
       └── Fail →
3.        Try binary parsing (strings search)
           ├── Success → name + version only, default icon
           └── Fail →
4.              Default: filename as name, default icon
```

**Why this order:**
- `--appimage-extract` is fast and doesn't leave a FUSE mount
- `--appimage-mount` is reliable but slower and requires cleanup
- Binary parsing works on corrupt or restricted AppImages
- Fallback always shows *something*

---

## 7. Performance Considerations

| Method | Time per AppImage | Memory | Dependencies |
|--------|-------------------|--------|-------------|
| `--appimage-extract` | ~200-500ms | ~50MB | None |
| `--appimage-mount` | ~100-300ms | ~30MB | FUSE kernel module |
| Binary parsing | ~10-50ms | ~10MB | None |
| Fallback | <1ms | <1MB | None |

**Scanning 50 AppImages:**
- Extract method: ~10-25s
- Mount method: ~5-15s
- Mixed (most cached): ~2-5s

**Optimization:** Only extract metadata for new/changed AppImages (detected by file hash or mtime).

---

## 8. Error Scenarios

| Scenario | Behavior |
|----------|----------|
| AppImage is corrupt | Fall back to filename, log error, show warning icon |
| No execute permission | Set +x, then extract |
| FUSE not available | Skip mount method, use extract or binary |
| .desktop file missing | Use binary parsing or fallback |
| .DirIcon missing but Icon= set | Search extracted filesystem for icon |
| Timeout during extraction | 10s per file, then fall back to next method |

---

## 9. Scanner Service Architecture

```typescript
class ScannerService {
  private iconCache: IconCache;
  private index: AppImageEntry[];

  async scan(directories: string[]): Promise<ScanResult> {
    const files = this.findAppImages(directories);
    const newFiles = this.filterNew(files);
    
    for (const file of newFiles) {
      const hash = await this.hashFile(file);
      const meta = await this.extractMetadata(file);
      this.index.push({
        id: uuidv4(),
        path: file,
        name: meta.name || path.basename(file),
        icon: meta.icon,
        size: fs.statSync(file).size,
        version: meta.version,
        dateAdded: new Date(),
        launchCount: 0,
        fileHash: hash,
      });
    }

    return { success: true, count: this.index.length, entries: this.index };
  }

  private async extractMetadata(filePath: string): Promise<AppImageMetadata> {
    try {
      return await this.extractViaSquashfs(filePath);
    } catch {
      try {
        return await this.extractViaMount(filePath);
      } catch {
        try {
          return await this.extractViaBinary(filePath);
        } catch {
          return this.fallbackMetadata(filePath);
        }
      }
    }
  }
}
```

---

## 10. FUSE Requirements

### 10.1 Kernel Module

FUSE (Filesystem in Userspace) must be available:

```bash
# Check if FUSE module is loaded
lsmod | grep fuse

# Check if fusermount is available
which fusermount
```

### 10.2 AppImage Runtime

Modern AppImages include their own FUSE runtime. If `--appimage-extract` fails, the AppImage runtime itself may handle extraction via `APPIMAGE_EXTRACT_AND_RUN=1`.

```bash
# Force extract-and-run mode
APPIMAGE_EXTRACT_AND_RUN=1 ./MyApp.AppImage --appimage-extract
```

---

## 11. FUSE Mount Leak Prevention & Cleanup

### 11.1 The Problem

When using `--appimage-mount`, FUSE mount points are created under `/tmp/.mount_*`. If the extraction process crashes or is killed (SIGKILL), these mounts are left behind. Over time this fills `/tmp` and degrades system performance.

### 11.2 Prevention: try/finally Guards

Every mount operation is wrapped in a try/finally that guarantees cleanup:

```typescript
async function extractViaMount(path: string): Promise<AppImageMetadata> {
  let mountPoint: string | null = null;
  try {
    mountPoint = await mountAppImage(path);
    return await readMetadataFromMount(mountPoint);
  } finally {
    if (mountPoint) {
      await safeUnmount(mountPoint);
    }
  }
}
```

### 11.3 Unmount Strategy

Try `fusermount` first, fall back to `umount`:

```typescript
async function safeUnmount(mountPoint: string): Promise<void> {
  try {
    await exec(`fusermount -u "${mountPoint}"`);
  } catch {
    try {
      await exec(`umount "${mountPoint}"`);
    } catch {
      logger.warn(`Failed to unmount: ${mountPoint}`);
      // Schedule for later cleanup
      staleMounts.add(mountPoint);
    }
  }
}
```

### 11.4 Periodic Stale Mount Detection

On startup and every 5 minutes, scan for stale mounts owned by this app:

```typescript
async function cleanStaleMounts(): Promise<void> {
  const output = await exec('mount | grep "/tmp/.mount_"');
  const mounts = output.stdout.split('\n').filter(Boolean);
  
  for (const line of mounts) {
    const match = line.match(/on (\/tmp\/\.mount_[^\s]+)/);
    if (match) {
      const mountPath = match[1];
      // Check if any process is using this mount
      try {
        await exec(`lsof +D "${mountPath}"`);
        // In use, skip
      } catch {
        // Not in use, unmount
        await exec(`fusermount -u "${mountPath}"`);
        logger.info(`Cleaned stale mount: ${mountPath}`);
      }
    }
  }
}
```

### 11.5 Concurrent Mount Limit

Maximum **3 concurrent mounts** at any time. Additional requests are queued:

```typescript
const mountSemaphore = new Semaphore(3);

async function limitedMount(path: string): Promise<string> {
  await mountSemaphore.acquire();
  try {
    return await mountAppImage(path);
  } finally {
    mountSemaphore.release();
  }
}
```

---

## 12. Hash Computation Timing

### 12.1 The Cost Problem

SHA-256 hashing a 200 MB AppImage takes ~500ms. On a directory with 100 AppImages, that's 50 seconds just for hashing — unacceptable.

### 12.2 mtime Pre-Check Strategy

Use file modification time as a fast pre-check before hashing:

```typescript
async function needsRehash(entry: AppImageEntry, filePath: string): Promise<boolean> {
  const stats = await fs.stat(filePath);
  const mtimeMs = stats.mtimeMs;
  
  // If mtime hasn't changed, hash hasn't changed
  if (entry.lastMtimeCheck === mtimeMs) {
    return false;
  }
  
  // mtime changed — compute hash
  const hash = await hashFile(filePath);
  entry.lastMtimeCheck = mtimeMs;
  
  return hash !== entry.fileHash;
}
```

### 12.3 When Hash is Computed

| Scenario | Hash Computed? |
|----------|---------------|
| First-time index of a file | ✅ Yes |
| mtime unchanged since last scan | ❌ Skip |
| mtime changed | ✅ Yes |
| File deleted and re-added | ✅ Yes |
| User requests "Force Rescan" | ✅ Yes |

### 12.4 Hash on Demand

The hash is computed lazily (only when needed for cache validation or duplicate detection), not during every scan pass.

---

## 13. AppImage Type 1 Support

### 13.1 Differences from Type 2

| Property | Type 1 | Type 2 |
|----------|--------|--------|
| Filesystem | ISO 9660 | squashfs |
| Magic | `7f 45 4c 46` + ISO marker | `7f 45 4c 46` + `hsqs` marker |
| `--appimage-extract` | ❌ Not supported | ✅ Supported |
| `--appimage-mount` | ✅ Supported | ✅ Supported |
| Extraction method | Mount only | Extract or mount |

### 13.2 Type 1 Extraction Path

Since `--appimage-extract` doesn't work on Type 1, the only reliable method is `--appimage-mount`:

```typescript
async function extractType1(path: string): Promise<AppImageMetadata> {
  // Type 1: must use mount
  const mountPoint = await mountAppImage(path);
  try {
    return await readMetadataFromMount(mountPoint);
  } finally {
    await safeUnmount(mountPoint);
  }
}
```

### 13.3 Type 1 Fallback Chain

```
Type 1 AppImage
    │
    ├──► --appimage-mount
    │       └──► Parse .desktop + .DirIcon
    │
    └──► Fail → Binary parsing (strings search)
            └──► Name + version only, default icon
```

### 13.4 Type 1 Testing

Type 1 AppImages are tested in the compatibility matrix with:
- [ ] Successful mount and metadata extraction
- [ ] No stale mount after failed extraction
- [ ] Correct type identification

### 13.5 Prevalence

Type 1 AppImages represent < 5% of the current ecosystem. Most are from 2016 or earlier. Support is required by the PRD but the primary optimization targets Type 2.

---

*Document End*
