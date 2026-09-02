import { initDb } from '../src/config/db.js';
import { backupService } from '../src/services/backup.service.js';

async function run() {
  console.log('📦 [SQLite Backup] Initializing database connection...');
  await initDb();

  const tag = process.argv[2] || 'manual-cli';
  const compress = !process.argv.includes('--no-compress');

  console.log(`📦 [SQLite Backup] Starting hot online backup (tag: ${tag}, compress: ${compress})...`);
  const startTime = Date.now();

  const metadata = await backupService.createBackup({ tag, compress });
  const duration = Date.now() - startTime;

  console.log(`✅ [SQLite Backup] Database backup completed successfully in ${duration}ms!`);
  console.log(`--------------------------------------------------`);
  console.log(`File Name:    ${metadata.filename}`);
  console.log(`File Size:    ${metadata.sizeFormatted} (${metadata.sizeBytes} bytes)`);
  console.log(`SHA-256:      ${metadata.checksumSha256}`);
  console.log(`Users:        ${metadata.recordCount.users}`);
  console.log(`Employees:    ${metadata.recordCount.employees}`);
  console.log(`Attendance:   ${metadata.recordCount.attendance}`);
  console.log(`Created At:   ${metadata.createdAt}`);
  console.log(`Path:         ${metadata.filePath}`);
  console.log(`--------------------------------------------------`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ [SQLite Backup] Error creating database backup:', err);
  process.exit(1);
});
