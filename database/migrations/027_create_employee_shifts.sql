-- 027_create_employee_shifts.sql

CREATE TABLE employee_shifts (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    
    -- Date range for when this shift is assigned to the employee
    start_date TEXT NOT NULL, -- YYYY-MM-DD
    end_date TEXT, -- YYYY-MM-DD (NULL if indefinite/ongoing)
    
    companyId TEXT DEFAULT 'org-stackly',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emp_shifts_employee ON employee_shifts(employee_id);
CREATE INDEX idx_emp_shifts_shift ON employee_shifts(shift_id);
CREATE INDEX idx_emp_shifts_dates ON employee_shifts(start_date, end_date);
