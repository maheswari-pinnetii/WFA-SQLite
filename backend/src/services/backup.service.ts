import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import BetterSqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { getDb } from '../config/db.js';
import { logAudit } from '../database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.resolve(__dirname, '../../../database/backups');
const DB_DIR = path.resolve(__dirname, '../../../database/sqlite');
const MAX_BACKUP_RETENTION = 20;

export interface BackupMetadata {
  filename: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  checksumSha256: string;
  recordCount: {
    users: number;
    employees: number;
    attendance: number;
  };
  compressed: boolean;
  tag?: string;
}

export class BackupService {
  private ensureBackupDir(): string {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    return BACKUP_DIR;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  private calculateChecksum(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Creates an online hot backup of the active SQLite database
   */
  async createBackup(options: { tag?: string; compress?: boolean; userId?: string } = {}): Promise<BackupMetadata> {
    const backupDir = this.ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tag = options.tag ? `-${options.tag.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
    const tempFileName = `wfa-backup-${timestamp}${tag}.sqlite`;
    const tempFilePath = path.join(backupDir, tempFileName);

    const db = getDb();
    if (!db) {
      throw new Error('Database connection is not active or available.');
    }

    // Use SQLite online backup API to ensure 0-downtime, non-blocking hot backup
    if (typeof db.backup === 'function') {
      await db.backup(tempFilePath);
    } else {
      // Fallback to VACUUM INTO for clean defragmented snapshot
      db.prepare('VACUUM INTO ?').run(tempFilePath);
    }

    // Verify backup integrity
    const verifyDb = new BetterSqlite3(tempFilePath, { readonly: true });
    const integrityCheck = verifyDb.pragma('integrity_check') as any[];
    if (!integrityCheck || integrityCheck[0]?.integrity_check !== 'ok') {
      verifyDb.close();
      fs.unlinkSync(tempFilePath);
      throw new Error('Backup integrity verification failed.');
    }

    // Gather record counts from the snapshot
    const userCount = (verifyDb.prepare('SELECT COUNT(*) as c FROM users').get() as any)?.c || 0;
    const employeeCount = (verifyDb.prepare('SELECT COUNT(*) as c FROM employees').get() as any)?.c || 0;
    const attendanceCount = (verifyDb.prepare('SELECT COUNT(*) as c FROM attendancerecords').get() as any)?.c || 0;
    verifyDb.close();

    let finalFilePath = tempFilePath;
    let finalFileName = tempFileName;
    let isCompressed = false;

    // Optional Gzip compression
    if (options.compress) {
      const gzFileName = `${tempFileName}.gz`;
      const gzFilePath = path.join(backupDir, gzFileName);
      const rawData = fs.readFileSync(tempFilePath);
      const compressedData = zlib.gzipSync(rawData);
      fs.writeFileSync(gzFilePath, compressedData);
      fs.unlinkSync(tempFilePath); // Remove uncompressed copy
      finalFilePath = gzFilePath;
      finalFileName = gzFileName;
      isCompressed = true;
    }

    const stats = fs.statSync(finalFilePath);
    const checksum = this.calculateChecksum(finalFilePath);

    const metadata: BackupMetadata = {
      filename: finalFileName,
      filePath: finalFilePath,
      sizeBytes: stats.size,
      sizeFormatted: this.formatBytes(stats.size),
      createdAt: new Date().toISOString(),
      checksumSha256: checksum,
      recordCount: {
        users: userCount,
        employees: employeeCount,
        attendance: attendanceCount
      },
      compressed: isCompressed,
      tag: options.tag
    };

    // Write sidecar metadata JSON
    const metaPath = `${finalFilePath}.meta.json`;
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

    // Auto-rotate old backups if threshold exceeded
    this.rotateBackups();

    if (options.userId) {
      logAudit(options.userId, 'DATABASE_BACKUP_CREATED', `Created backup ${finalFileName} (${metadata.sizeFormatted})`);
    }

    return metadata;
  }

  /**
   * Lists all available backups in the backup directory
   */
  async listBackups(): Promise<BackupMetadata[]> {
    const backupDir = this.ensureBackupDir();
    const files = fs.readdirSync(backupDir);
    const backups: BackupMetadata[] = [];

    for (const file of files) {
      if (file.endsWith('.meta.json')) {
        try {
          const raw = fs.readFileSync(path.join(backupDir, file), 'utf-8');
          const meta = JSON.parse(raw) as BackupMetadata;
          if (fs.existsSync(meta.filePath)) {
            backups.push(meta);
          }
        } catch {
          // Ignore corrupted metadata files
        }
      } else if ((file.endsWith('.sqlite') || file.endsWith('.sqlite.gz')) && !files.includes(`${file}.meta.json`)) {
        // Construct fallback metadata if sidecar missing
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        backups.push({
          filename: file,
          filePath,
          sizeBytes: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          createdAt: stats.mtime.toISOString(),
          checksumSha256: this.calculateChecksum(filePath),
          recordCount: { users: 0, employees: 0, attendance: 0 },
          compressed: file.endsWith('.gz')
        });
      }
    }

    // Sort descending by creation date
    return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Restores the database from a backup snapshot
   */
  async restoreBackup(filename: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const backupDir = this.ensureBackupDir();
    const sanitized = path.basename(filename);
    const backupFilePath = path.join(backupDir, sanitized);

    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${sanitized}`);
    }

    let uncompressedPath = backupFilePath;
    let tempExtracted = false;

    // Handle gzip decompressed restore
    if (sanitized.endsWith('.gz')) {
      const compressedBuffer = fs.readFileSync(backupFilePath);
      const decompressed = zlib.gunzipSync(compressedBuffer);
      uncompressedPath = path.join(backupDir, `temp-restore-${Date.now()}.sqlite`);
      fs.writeFileSync(uncompressedPath, decompressed);
      tempExtracted = true;
    }

    try {
      // Validate integrity of candidate backup
      const testDb = new BetterSqlite3(uncompressedPath, { readonly: true });
      const integrity = testDb.pragma('integrity_check') as any[];
      testDb.close();

      if (!integrity || integrity[0]?.integrity_check !== 'ok') {
        throw new Error('Integrity verification failed for backup file.');
      }

      // Create a safety backup of current live database prior to restoring
      await this.createBackup({ tag: 'pre-restore-safety', compress: true });

      const liveDbPath = path.join(DB_DIR, process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite');
      
      // Copy candidate backup over active database file
      fs.copyFileSync(uncompressedPath, liveDbPath);

      // Clean up WAL and SHM files to ensure fresh reload
      try { fs.unlinkSync(`${liveDbPath}-wal`); } catch {}
      try { fs.unlinkSync(`${liveDbPath}-shm`); } catch {}

      if (userId) {
        logAudit(userId, 'DATABASE_RESTORED', `Restored database from backup ${sanitized}`);
      }

      return {
        success: true,
        message: `Database successfully restored from ${sanitized}.`
      };
    } finally {
      if (tempExtracted && fs.existsSync(uncompressedPath)) {
        try { fs.unlinkSync(uncompressedPath); } catch {}
      }
    }
  }

  /**
   * Deletes a specific backup archive
   */
  async deleteBackup(filename: string, userId?: string): Promise<boolean> {
    const backupDir = this.ensureBackupDir();
    const sanitized = path.basename(filename);
    const filePath = path.join(backupDir, sanitized);
    const metaPath = `${filePath}.meta.json`;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      if (fs.existsSync(metaPath)) {
        try { fs.unlinkSync(metaPath); } catch {}
      }
      if (userId) {
        logAudit(userId, 'DATABASE_BACKUP_DELETED', `Deleted backup file ${sanitized}`);
      }
      return true;
    }
    return false;
  }

  /**
   * Retrieves absolute file path for download
   */
  getBackupDownloadPath(filename: string): string {
    const backupDir = this.ensureBackupDir();
    const sanitized = path.basename(filename);
    const filePath = path.join(backupDir, sanitized);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file not found: ${sanitized}`);
    }
    return filePath;
  }

  /**
   * Auto-rotates backups to prevent unbounded disk usage
   */
  private rotateBackups(): void {
    try {
      const backupDir = this.ensureBackupDir();
      const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.sqlite') || f.endsWith('.sqlite.gz'))
        .map(f => ({
          name: f,
          path: path.join(backupDir, f),
          time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length > MAX_BACKUP_RETENTION) {
        const toDelete = files.slice(MAX_BACKUP_RETENTION);
        for (const item of toDelete) {
          try { fs.unlinkSync(item.path); } catch {}
          try { fs.unlinkSync(`${item.path}.meta.json`); } catch {}
        }
      }
    } catch (err: any) {
      console.warn('[Backup Rotation] Warning during backup rotation:', err.message);
    }
  }
}

export const backupService = new BackupService();
