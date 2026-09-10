-- 025_create_work_configs.sql

CREATE TABLE work_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Standard 5-Day Week", "6-Day Support Shift"
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,
    
    -- Store days of the week that are considered working days (0=Sun, 1=Mon, etc.)
    -- e.g., JSON array '[1, 2, 3, 4, 5]' for Mon-Fri
    working_days TEXT NOT NULL DEFAULT '[1, 2, 3, 4, 5]',
    
    -- Default hours expected per day
    standard_hours_per_day REAL NOT NULL DEFAULT 8.0,
    
    -- Can have multiple configs, but maybe one is default
    is_default INTEGER NOT NULL DEFAULT 0,

    companyId TEXT DEFAULT 'org-stackly',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_configs_location ON work_configs(location_id);
CREATE INDEX idx_work_configs_department ON work_configs(department_id);
