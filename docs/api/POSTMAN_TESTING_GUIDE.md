# 📮 Postman API Testing & Collection Guide

This guide provides end-to-end instructions for testing the **WFA Workforce Analytics & Geofenced Attendance System** using [Postman](https://www.postman.com/) or the headless [Newman](https://www.npmjs.com/package/newman) CLI runner.

---

## 📂 1. Postman Artifacts Directory

The repository includes pre-built Postman files ready for instant import:

| File | Description |
| :--- | :--- |
| [`postman/WFA_Workforce_Analytics.postman_collection.json`](file:///c:/Users/91970/Downloads/WFA-SQLite/postman/WFA_Workforce_Analytics.postman_collection.json) | Full collection of 28+ categorized API endpoints covering Auth, MFA, Attendance, Geofencing, Leaves, Tasks, Directory, Analytics, and Health checks. |
| [`postman/WFA_Local.postman_environment.json`](file:///c:/Users/91970/Downloads/WFA-SQLite/postman/WFA_Local.postman_environment.json) | Local environment variables (`baseUrl`, `bearerToken`, pre-configured credentials for Admin, HR, Manager, Employee, and office geofence coordinates). |

---

## 🚀 2. Step-by-Step Postman Setup

### Step 1: Import Files into Postman
1. Open the Postman Desktop App (or Postman Web).
2. Click **Import** (top left).
3. Drag and drop both files:
   - `postman/WFA_Workforce_Analytics.postman_collection.json`
   - `postman/WFA_Local.postman_environment.json`

### Step 2: Select the Environment
1. In the top-right environment dropdown, select **`WFA Local Environment`**.
2. Verify that `baseUrl` is set to `http://localhost:5001`.

---

## 🔑 3. Authentication & Automated Token Injection

The collection utilizes Postman **Test Scripts** to automatically capture the JWT token upon login and inject it into the `{{bearerToken}}` variable:

```javascript
// Test Script in "1. Login (Email + Password)"
const res = pm.response.json();
if (res.data && res.data.token) {
    pm.environment.set("bearerToken", res.data.token);
    console.log("Bearer token saved automatically!");
} else if (res.data && res.data.challengeId) {
    pm.environment.set("challengeId", res.data.challengeId);
}
```

All other requests in the collection automatically inherit `Authorization: Bearer {{bearerToken}}`.

---

## 🧪 4. Testing Core Workflows in Postman

### A. Authentication Flow
1. **Login**: Execute `01 Auth & MFA > 1. Login (Email + Password)`.
   - Default Body: `{"email": "admin@thestackly.com", "password": "StacklyWFA2026!"}` (or `employee@thestackly.com`)
2. **MFA Verification** *(if MFA enabled)*: Execute `2. Verify MFA Code`.
3. **Check Profile**: Execute `3. Get Current User Profile (Me)`.

### B. Geofenced Attendance Flow
1. **Check Status**: Execute `02 Attendance & Geofencing > 1. Get Today Attendance Status`.
2. **Live Check-In**: Execute `2. Live Check-In (Within Bengaluru Geofence)`.
   - Sends coordinates: `12.9716, 77.5946` (Bengaluru Campus Hub).
3. **Take Break**: Execute `3. Take Lunch / Coffee Break`.
4. **Resume Work**: Execute `4. Resume Work from Break`.
5. **Check-Out**: Execute `5. Check-Out`.
6. **View History**: Execute `6. Get Attendance History Records`.

### C. Leave & Absence Management
1. **Submit Leave**: Execute `04 Leave & Absence Management > 2. Submit Leave Application (PTO)`.
   - Automatically saves `{{leaveRequestId}}` to the environment.
2. **Manager Review**: Change user to Manager/HR and execute `3. Review Leave Request`.

### D. Attendance Punch Corrections
1. **Request Correction**: Execute `03 Attendance Corrections > 1. Submit Punch Correction Request`.
   - Automatically saves `{{correctionId}}`.
2. **Approve Correction**: Execute `3. Review Correction (Manager / HR Approve)`.

### E. Database Backup & Disaster Recovery (Admin Only)
1. **Trigger Hot Backup**: Execute `09 Backup & Disaster Recovery > 1. Trigger Database Hot Backup`.
   - Creates a non-blocking hot backup snapshot with SHA-256 integrity verification.
   - Automatically saves `{{backupFilename}}` to the environment.
2. **List Available Backups**: Execute `2. List Available Database Backups`.
3. **Download Backup**: Execute `4. Download Backup Archive` to export the `.sqlite.gz` archive.
4. **Restore Database**: Execute `3. Restore Database From Backup` to safely restore state.
5. **Delete Backup**: Execute `5. Delete Backup Archive`.

---

## ⚡ 5. Running with Newman CLI (Automated Terminal Testing)

You can run the entire Postman collection directly from your terminal using Newman:

```bash
# Run all collection tests against local server
npx newman run postman/WFA_Workforce_Analytics.postman_collection.json -e postman/WFA_Local.postman_environment.json
```

To generate an HTML test report:
```bash
npx newman run postman/WFA_Workforce_Analytics.postman_collection.json -e postman/WFA_Local.postman_environment.json -r cli,htmlextra
```

