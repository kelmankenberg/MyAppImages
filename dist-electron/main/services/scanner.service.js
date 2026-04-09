"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScannerService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ScannerService {
    async scan(directories) {
        const paths = [];
        const errors = [];
        for (const dir of directories) {
            try {
                const expanded = dir.replace(/^~/, process.env.HOME || '');
                if (!fs_1.default.existsSync(expanded)) {
                    errors.push({ directory: dir, message: 'Directory not found', code: 'ENOENT' });
                    continue;
                }
                this.findAppImages(expanded, paths);
            }
            catch (err) {
                const error = err;
                errors.push({ directory: dir, message: error.message, code: error.code });
            }
        }
        return { count: paths.length, paths, errors };
    }
    findAppImages(dir, results) {
        try {
            const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(dir, entry.name);
                if (entry.isDirectory()) {
                    this.findAppImages(fullPath, results);
                }
                else if (entry.isFile() && entry.name.toLowerCase().endsWith('.appimage')) {
                    results.push(fullPath);
                }
            }
        }
        catch {
            // Skip unreadable directories
        }
    }
}
exports.ScannerService = ScannerService;
//# sourceMappingURL=scanner.service.js.map