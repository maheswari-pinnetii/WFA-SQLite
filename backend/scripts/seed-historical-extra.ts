import { getDb, ORGANIZATION_ID } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';

export const seedHistoricalExtra = async () => {
  await connectDatabase();
  const db = getDb();
  console.log('[SQLite Extra Seeder] Starting historical data seeding (Assets, historical Attendance)...');

  const transaction = db.transaction(() => {
    const nowStr = new Date().toISOString();

    // 1. Fetch Employees
    const employees = db.prepare("SELECT id, name, joinDate FROM employees").all() as any[];
    if (employees.length === 0) {
      console.log('No employees found. Run the primary seeder first.');
      return;
    }

    // 2. Generate Assets
    const insertAsset = db.prepare(`
      INSERT OR IGNORE INTO assets (id, organizationId, assetTag, assetType, description, serialNumber, purchaseDate, value, status, assignedToId, assignedAt, assignedBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let assetCount = 0;
    employees.forEach((emp, index) => {
      const joinYear = emp.joinDate ? parseInt(emp.joinDate.split('-')[0]) : 2020;
      
      const laptopId = `ast-lap-${emp.id}`;
      insertAsset.run(laptopId, ORGANIZATION_ID, `AST-LAP-${index}`, 'LAPTOP', `MacBook Pro 20${joinYear-2000}`, `SN-MAC-${Math.floor(Math.random()*1000000)}`, `${joinYear}-01-10`, 1500 + (index % 500), 'ASSIGNED', emp.id, emp.joinDate || `${joinYear}-01-15`, 'usr-admin-01', nowStr);
      assetCount++;

      if (index % 3 === 0) {
        const monitorId = `ast-mon-${emp.id}`;
        insertAsset.run(monitorId, ORGANIZATION_ID, `AST-MON-${index}`, 'MONITOR', 'Dell U2723QE', `SN-DEL-${Math.floor(Math.random()*1000000)}`, `${joinYear}-02-01`, 400, 'ASSIGNED', emp.id, emp.joinDate || `${joinYear}-02-15`, 'usr-admin-01', nowStr);
        assetCount++;
      }
    });
    console.log(`Seeded ${assetCount} assets.`);

    // 5. Generate Sample Historical Attendance
    const insertAttendance = db.prepare(`
        INSERT OR IGNORE INTO attendancerecords (
          id, employeeId, employeeName, department, date,
          checkInTime, checkOutTime, breaks, shiftType, workMode,
          status, latitude, longitude, accuracy, idempotencyKey,
          team, organizationId, companyId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let attCount = 0;
    const pastYears = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    
    const earlyEmployees = employees.filter(e => {
      const yr = e.joinDate ? parseInt(e.joinDate.split('-')[0]) : 2026;
      return yr <= 2018;
    }).slice(0, 50);

    earlyEmployees.forEach(emp => {
      pastYears.forEach(year => {
        for(let i=0; i<2; i++) {
          const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
          const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          if (emp.joinDate && new Date(dateStr) < new Date(emp.joinDate)) continue;

          const checkIn = new Date(`${dateStr}T09:00:00Z`);
          const checkOut = new Date(`${dateStr}T17:30:00Z`);
          
          insertAttendance.run(
            `att-hist-${emp.id}-${dateStr}`, emp.id, emp.name, 'Engineering', dateStr,
            checkIn.toISOString(), checkOut.toISOString(),
            '[]', 'Regular', 'Office', 'Checked Out',
            12.9716, 77.5946, 10, `idemp-hist-${emp.id}-${dateStr}`,
            'Frontend Team', ORGANIZATION_ID, ORGANIZATION_ID, checkIn.toISOString(), checkOut.toISOString()
          );
          attCount++;
        }
      });
    });

    console.log(`Seeded ${attCount} historical attendance records.`);
  });

  transaction();
  console.log('[SQLite Extra Seeder] Historical data seeding completed successfully!');
};

if (process.argv[1] && process.argv[1].endsWith('seed-historical-extra.ts')) {
  seedHistoricalExtra().then(() => process.exit(0)).catch(e => {
    console.error('Failed:', e);
    process.exit(1);
  });
}
