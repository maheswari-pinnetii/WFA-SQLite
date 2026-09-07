# Database Indexing Guide

This document explains how indexing works within the WFA-SQLite application. Proper indexing is the difference between a query returning in 1 millisecond versus 5 seconds, especially as tables like `attendancerecords` grow to millions of rows.

---

## 1. The Full Table Scan
When you run a query without an index, SQLite must perform a **Full Table Scan**. 
```sql
SELECT * FROM attendancerecords WHERE check_in_time > '2026-09-01';
```
Without an index on `check_in_time`, SQLite starts at the very first row of the table and reads every single row until the end, checking the condition on each one. 
* **Pros:** Fast for very small tables or when you need to read 90%+ of the rows anyway.
* **Cons:** Extremely slow and CPU-intensive as the table grows. It destroys performance.

---

## 2. What an Index Actually Is
An index is a separate, hidden data structure managed by SQLite that acts like the index at the back of a textbook. Instead of reading the entire book (table) to find a specific keyword, you look up the keyword in the index to find the exact page number (row ID).

When you create an index:
```sql
CREATE INDEX idx_attendance_checkin ON attendancerecords(check_in_time);
```
SQLite creates a separate table containing only the `check_in_time` and a pointer (`rowid`) back to the original row. Importantly, this new structure is kept **sorted**.

---

## 3. The B-Tree Structure
SQLite uses a **B-Tree** (Balanced Tree) structure for its indexes. 
Because the index data is perfectly sorted in a tree structure, SQLite can use an O(log N) binary search to find data instantly, rather than an O(N) linear scan.
* **Root Node:** The starting point of the search.
* **Branch Nodes:** Guide the search left (smaller values) or right (larger values).
* **Leaf Nodes:** Contain the actual value and the `rowid` pointing to the main table.

---

## 4. The Write Cost
Indexes are not free. They trade **write performance** and **disk space** for **read speed**.
Every time you `INSERT`, `UPDATE`, or `DELETE` a row in the main table, SQLite must also update every single index attached to that table to maintain the sorted B-Tree.
* **Rule of Thumb:** Index heavily read columns (like `employee_id` or `date`). Avoid indexing columns that are frequently updated but rarely searched on.

---

## 5. Composite Index Order (Left-to-Right Rule)
A composite index spans multiple columns:
```sql
CREATE INDEX idx_emp_date ON attendancerecords(employee_id, date);
```
**Order is critical.** SQLite evaluates composite indexes strictly from left to right.
* `WHERE employee_id = 5 AND date = '2026-09-01'` ➔ **Index Used (Fast)**
* `WHERE employee_id = 5` ➔ **Index Used (Fast)**
* `WHERE date = '2026-09-01'` ➔ **Index Ignored (Full Scan)**

If you don't filter by the left-most column (`employee_id`), SQLite cannot use the index.

---

## 6. When an Index Gets Ignored
SQLite's query optimizer might completely ignore an index you built. Common reasons include:
1. **Functions on Columns:** `WHERE UPPER(email) = 'TEST@TEST.COM'` ignores the index on `email`. You must index the expression itself: `CREATE INDEX idx_upper_email ON users(UPPER(email))`.
2. **LIKE with Leading Wildcards:** `WHERE name LIKE '%Smith'` cannot use an index. `WHERE name LIKE 'Smith%'` *can* use an index.
3. **OR Conditions:** Sometimes using `OR` between two different columns forces a table scan unless both columns have separate indexes.
4. **Data Type Mismatches:** Comparing an integer column to a string value might bypass the index.

---

## 7. The Covering Index
A query typically takes two steps:
1. Find the `rowid` in the index.
2. Jump to the main table using the `rowid` to fetch the rest of the columns.

If your query *only* asks for columns that are already inside the index, SQLite skips step 2 entirely. This is a **Covering Index** and it is blazing fast.
```sql
-- Assuming: CREATE INDEX idx_emp_status ON employees(id, status);
SELECT status FROM employees WHERE id = 10;
```
SQLite reads the `status` directly from the index B-Tree without ever touching the main `employees` table.

---

## 8. Reading an `EXPLAIN QUERY PLAN`
To verify if your queries are actually using your indexes, prefix them with `EXPLAIN QUERY PLAN`:
```sql
EXPLAIN QUERY PLAN SELECT * FROM attendancerecords WHERE employee_id = 5;
```

### Good Outputs:
* `SEARCH TABLE attendancerecords USING INDEX idx_emp_id (employee_id=?)`
  * **SEARCH** means a fast O(log N) B-Tree lookup.
* `SEARCH TABLE attendancerecords USING COVERING INDEX...`
  * Even better, the main table was never touched.

### Bad Outputs:
* `SCAN TABLE attendancerecords`
  * **SCAN** means a Full Table Scan. This is a massive red flag for large tables.
* `USE TEMP B-TREE FOR ORDER BY`
  * Means your `ORDER BY` clause couldn't use an index, so SQLite had to load everything into memory and sort it on the fly.
