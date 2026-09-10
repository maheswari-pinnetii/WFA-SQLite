-- 026_create_shifts.sql

CREATE TABLE shifts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Morning Shift", "Night Shift"
    
    -- Format: HH:MM:SS
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    
    -- In minutes
    break_duration INTEGER NOT NULL DEFAULT 60,
    
    -- Is this a night shift crossing midnight?
    is_overnight INTEGER NOT NULL DEFAULT 0,
    
    color_code TEXT, -- for UI display, e.g. '#10b981'

    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,

    companyId TEXT DEFAULT 'org-stackly',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shifts_location ON shifts(location_id);
CREATE INDEX idx_shifts_department ON shifts(department_id);
