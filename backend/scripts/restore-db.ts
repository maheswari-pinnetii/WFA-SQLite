import { backupService } from '../src/services/backup.service.js';

async function run() {
  const filename = process.argv[2];
  if (!filename) {
    console.log('📋 [SQLite Restore] Available database backups:');
    const backups = await backupService.listBackups();
    if (backups.length === 0) {
      console.log('No backups found in database/backups directory.');
      process.exit(0);
    }
    backups.forEach((b, idx) => {
      console.log(`[${idx + 1}] ${b.filename} - ${b.sizeFormatted} (Created: ${b.createdAt})`);
    });
    console.log('\nUsage: npm run db:restore <backup-filename>');
    process.exit(0);
  }

  console.log(`🔄 [SQLite Restore] Restoring database from backup: ${filename}...`);
  const startTime = Date.now();

  const res = await backupService.restoreBackup(filename, 'cli-admin');
  const duration = Date.now() - startTime;

  console.log(`✅ [SQLite Restore] ${res.message} (Completed in ${duration}ms)`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ [SQLite Restore] Error restoring database from backup:', err);
  process.exit(1);
});
