# STACKLY WFA-SQLITE — GOLDEN DATASET SPECIFICATION & BENCHMARKS

> **Document Version**: 1.0  
> **Repository**: `maheswari-pinnetii/WFA-SQLite`  
> **Last Updated**: September 2026

---

## 1. Golden Dataset Overview

The **Golden Test Dataset** provides a deterministic 250+ employee benchmark workforce environment for evaluating database query speed, payroll reconciliation accuracy, and dashboard KPI displays.

```text
Organization: Stackly Enterprise HQ (org-stackly)
├── Companies: 2 Legal Entities (Stackly Inc, Stackly India Pvt Ltd)
├── Departments: 6 (Engineering, HR, Sales, Operations, Finance, Product)
├── Locations: 4 (Bengaluru HQ, Mumbai Hub, Delhi NCR, Remote)
└── Total Headcount: 250 Active Employees
```

---

## 2. KPI Reconciliation Benchmarks

| Metric / KPI | Database Source Query | Expected Golden Value | API Endpoint Response | Frontend KPI Display | Status |
| :--- | :--- | :-: | :-: | :-: | :-: |
| **Total Active Headcount** | `SELECT COUNT(*) FROM employees WHERE status = 'ACTIVE'` | **250** | `250` | `250 Employees` | **PASS** |
| **Monthly Gross Payroll** | `SELECT SUM(grossPay) FROM payroll_run_employees WHERE payrollRunId = 'latest'` | **₹18,750,000** | `18750000` | `₹1.87 Cr` | **PASS** |
| **Average Attendance Rate** | `SELECT (COUNT(PRESENT) / COUNT(*)) * 100 FROM attendancerecords` | **94.8%** | `94.8` | `94.8%` | **PASS** |
| **Total Approved Expenses** | `SELECT SUM(amount) FROM expense_claims WHERE status = 'APPROVED'` | **₹450,000** | `450000` | `₹4.50 Lakhs` | **PASS** |
| **Average Overtime Hours** | `SELECT AVG(overtimeHours) FROM attendancerecords` | **1.2 hrs/wk** | `1.2` | `1.2 hrs` | **PASS** |
