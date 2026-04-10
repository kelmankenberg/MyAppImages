import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ExtractedIcon {
  iconPath: string;
  format: 'png' | 'svg';
}

/**
 * Service to extract icons from AppImage files.
 * AppImages contain a .DirIcon file at the root of their squashfs, which is typically
 * a symlink to the actual icon file in usr/share/icons/hicolor/ or similar paths.
 */
export class IconExtractionService {
  private iconCacheDir: string;

  constructor() {
    // Store extracted icons in the app's user data directory
    this.iconCacheDir = path.join(os.homedir(), '.cache', 'MyAppImages', 'icons');
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.iconCacheDir)) {
      fs.mkdirSync(this.iconCacheDir, { recursive: true });
    }
  }

  /**
   * Generate a cache key for an AppImage based on its path and modification time.
   */
  private getIconCacheKey(appImagePath: string, mtimeMs: number): string {
    const baseName = path.basename(appImagePath, '.appimage').replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${baseName}_${Math.floor(mtimeMs)}`;
  }

  /**
   * Check if we have a cached icon for this AppImage.
   */
  private getCachedIconPath(appImagePath: string, mtimeMs: number): string | null {
    const cacheKey = this.getIconCacheKey(appImagePath, mtimeMs);
    const pngPath = path.join(this.iconCacheDir, `${cacheKey}.png`);
    const svgPath = path.join(this.iconCacheDir, `${cacheKey}.svg`);

    if (fs.existsSync(pngPath)) {
      return pngPath;
    }
    if (fs.existsSync(svgPath)) {
      return svgPath;
    }

    return null;
  }

  /**
   * Clear old cached icons that are no longer referenced.
   */
  clearUnusedIcons(validCacheKeys: Set<string>): void {
    try {
      const files = fs.readdirSync(this.iconCacheDir);
      for (const file of files) {
        const cacheKey = path.basename(file, path.extname(file));
        if (!validCacheKeys.has(cacheKey)) {
          fs.unlinkSync(path.join(this.iconCacheDir, file));
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Extract icon from an AppImage file.
   * Returns the path to the extracted icon, or null if extraction fails.
   */
  async extractIcon(appImagePath: string, mtimeMs: number): Promise<string | null> {
    try {
      // Check cache first
      const cachedPath = this.getCachedIconPath(appImagePath, mtimeMs);
      if (cachedPath) {
        return cachedPath;
      }

      // Extract .DirIcon from AppImage using --appimage-extract
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'appimage-icon-'));

      try {
        // Use --appimage-extract to extract the AppImage contents
        await this.extractAppImage(appImagePath, tempDir);

        // Look for .DirIcon in the extracted contents
        const extractedIconPath = await this.findAndResolveDirIcon(tempDir);

        if (!extractedIconPath) {
          return null;
        }

        // Determine the format and copy to cache
        const ext = path.extname(extractedIconPath).toLowerCase();
        const cacheKey = this.getIconCacheKey(appImagePath, mtimeMs);
        const targetFormat: 'png' | 'svg' = ext === '.svg' ? 'svg' : 'png';
        const targetPath = path.join(this.iconCacheDir, `${cacheKey}.${targetFormat}`);

        fs.copyFileSync(extractedIconPath, targetPath);

        // If it's an SVG, also try to convert to PNG for better rendering
        if (targetFormat === 'svg') {
          try {
            const pngPath = path.join(this.iconCacheDir, `${cacheKey}.png`);
            await this.convertSvgToPng(targetPath, pngPath);
            return pngPath; // Prefer PNG for display
          } catch {
            // If SVG conversion fails, return the SVG
            return targetPath;
          }
        }

        return targetPath;
      } finally {
        // Clean up temp directory
        this.removeTempDir(tempDir);
      }
    } catch {
      // If extraction fails, return null to use fallback
      return null;
    }
  }

  /**
   * Extract AppImage contents to a directory.
   */
  private extractAppImage(appImagePath: string, outputDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('AppImage extraction timed out'));
      }, 30000); // 30 second timeout

      try {
        const child = spawn(appImagePath, ['--appimage-extract'], {
          cwd: outputDir,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, APPIMAGE_EXTRACT_ONLY: '1' },
        });

        let stderr = '';
        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`AppImage extraction failed with code ${code}: ${stderr}`));
          }
        });

        child.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }

  /**
   * Find .DirIcon in extracted contents and resolve symlinks.
   */
  private async findAndResolveDirIcon(extractDir: string): Promise<string | null> {
    try {
      const squashfsRoot = path.join(extractDir, 'squashfs-root');
      const dirIconPath = path.join(squashfsRoot, '.DirIcon');

      // If .DirIcon exists, try to resolve it
      if (fs.existsSync(dirIconPath) || fs.lstatSync(dirIconPath)?.isSymbolicLink()) {
        try {
          // Check if it's a symlink
          if (fs.lstatSync(dirIconPath).isSymbolicLink()) {
            const linkTarget = fs.readlinkSync(dirIconPath);
            let actualPath: string;
            
            // If relative, resolve relative to the squashfs-root directory
            if (!path.isAbsolute(linkTarget)) {
              actualPath = path.join(squashfsRoot, linkTarget);
            } else {
              // For absolute paths, try to find the file in squashfs-root
              const basename = path.basename(linkTarget);
              actualPath = path.join(squashfsRoot, basename);
            }

            // If the resolved path exists, use it
            if (fs.existsSync(actualPath)) {
              const ext = path.extname(actualPath).toLowerCase();
              if (ext === '.png' || ext === '.svg' || ext === '.xpm') {
                return actualPath;
              }
            }

            // If the symlink target doesn't exist, fall through to search mode
            console.log(`Warning: .DirIcon symlink is broken, searching for icon files...`);
          } else if (fs.existsSync(dirIconPath)) {
            // It's a regular file
            const ext = path.extname(dirIconPath).toLowerCase();
            if (ext === '.png' || ext === '.svg' || ext === '.xpm') {
              return dirIconPath;
            }
          }
        } catch {
          // If there's any error reading the symlink, fall through to search
        }
      }

      // Fallback: search for icon files in standard locations
      return this.searchForIcon(squashfsRoot);
    } catch {
      return null;
    }
  }

  /**
   * Search for icon files in standard AppImage icon locations.
   */
  private searchForIcon(squashfsRoot: string): string | null {
    try {
      // Common icon patterns
      const searchPatterns = [
        // Try to find in hicolor icon theme directories
        'usr/share/icons/hicolor/*/apps/*.png',
        'usr/share/icons/hicolor/*/apps/*.svg',
        // Try root directory
        '*.png',
        // Try common icon names in root
        '.DirIcon',
        'icon.png',
        'icon.svg',
      ];

      // Search in hicolor theme first (prefer larger icons)
      const hicolorDir = path.join(squashfsRoot, 'usr/share/icons/hicolor');
      if (fs.existsSync(hicolorDir)) {
        const iconFiles = this.findIconFiles(hicolorDir);
        if (iconFiles.length > 0) {
          // Return the largest icon available
          return iconFiles[0];
        }
      }

      // Check root directory for PNG files
      const rootFiles = fs.readdirSync(squashfsRoot);
      for (const file of rootFiles) {
        const ext = path.extname(file).toLowerCase();
        const lowerName = file.toLowerCase();
        if ((ext === '.png' || ext === '.svg') && 
            (lowerName.includes('icon') || lowerName.includes('logo') || lowerName === 'handy.png')) {
          return path.join(squashfsRoot, file);
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Find icon files in hicolor theme directory, sorted by size (largest first).
   */
  private findIconFiles(hicolorDir: string): string[] {
    try {
      const iconFiles: { path: string; size: number }[] = [];

      // Search through size directories like 16x16, 32x32, 64x64, 128x128, 256x256, etc.
      const sizeDirs = fs.readdirSync(hicolorDir);
      for (const sizeDir of sizeDirs) {
        const appsDir = path.join(hicolorDir, sizeDir, 'apps');
        if (fs.existsSync(appsDir)) {
          const files = fs.readdirSync(appsDir);
          for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (ext === '.png' || ext === '.svg') {
              // Extract size from directory name (e.g., "256x256@2" -> 512)
              const sizeMatch = sizeDir.match(/(\d+)x(\d+)/);
              const size = sizeMatch ? parseInt(sizeMatch[1]) : 0;
              iconFiles.push({
                path: path.join(appsDir, file),
                size,
              });
            }
          }
        }
      }

      // Sort by size (largest first)
      iconFiles.sort((a, b) => b.size - a.size);
      return iconFiles.map(f => f.path);
    } catch {
      return [];
    }
  }

  /**
   * Convert SVG to PNG using ImageMagick (if available).
   */
  private convertSvgToPng(svgPath: string, pngPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('SVG to PNG conversion timed out'));
      }, 10000);

      const child = spawn('convert', [
        '-background', 'none',
        '-density', '300',
        svgPath,
        '-resize', '256x256',
        pngPath,
      ]);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`SVG conversion failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Remove a temporary directory recursively.
   */
  private removeTempDir(tempDir: string): void {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}
