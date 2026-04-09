import fs from 'fs';
import path from 'path';

export class ScannerService {
  async scan(directories: string[]): Promise<{ count: number; paths: string[]; errors: { directory: string; message: string; code?: string }[] }> {
    const paths: string[] = [];
    const errors: { directory: string; message: string; code?: string }[] = [];

    for (const dir of directories) {
      try {
        const expanded = dir.replace(/^~/, process.env.HOME || '');
        if (!fs.existsSync(expanded)) {
          errors.push({ directory: dir, message: 'Directory not found', code: 'ENOENT' });
          continue;
        }
        this.findAppImages(expanded, paths);
      } catch (err: unknown) {
        const error = err as NodeJS.ErrnoException;
        errors.push({ directory: dir, message: error.message, code: error.code });
      }
    }

    return { count: paths.length, paths, errors };
  }

  private findAppImages(dir: string, results: string[]): void {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          this.findAppImages(fullPath, results);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.appimage')) {
          results.push(fullPath);
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }
}
