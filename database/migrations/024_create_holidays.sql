-- 024_create_holidays.sql

CREATE TABLE holidays (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT CHECK(type IN ('NATIONAL', 'REGIONAL', 'COMPANY')) NOT NULL DEFAULT 'NATIONAL',
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE, -- NULL means it applies globally
    department_id TEXT REFERENCES departments(id) ON DELETE CASCADE, -- NULL means it applies to all departments
    description TEXT,
    companyId TEXT DEFAULT 'org-stackly',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_location ON holidays(location_id);
