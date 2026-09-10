ALTER TABLE attendancerecords ADD COLUMN late_by INTEGER DEFAULT 0;
ALTER TABLE attendancerecords ADD COLUMN early_by INTEGER DEFAULT 0;
ALTER TABLE attendancerecords ADD COLUMN overtime INTEGER DEFAULT 0;
ALTER TABLE attendancerecords ADD COLUMN work_hours REAL DEFAULT 0;
ALTER TABLE attendancerecords ADD COLUMN break_hours REAL DEFAULT 0;
