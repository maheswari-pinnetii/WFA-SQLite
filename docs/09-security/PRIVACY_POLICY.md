# Internal Privacy Policy

**Last Updated: [Current Date]**

This Privacy Policy explains how WFA-SQLite ("the System") collects, uses, and protects the personal data of our employees and authorized contractors.

## 1. Data We Collect

As an internal employee management and attendance system, we collect the following Restricted (Level 3) and Confidential (Level 2) data:
* **Identity Data**: First name, last name, corporate email address, and Employee ID.
* **Authentication Data**: Cryptographic hashes of passwords (Argon2id) or WebAuthn/Passkey public credentials.
* **Location Data**: GPS coordinates (Latitude and Longitude) collected strictly at the exact moment you click "Check In" or "Check Out", used solely to verify you are within the authorized geofence radius.
* **Device \u0026 Usage Data**: IP addresses, browser user-agents, and timestamps of system interactions, used for security auditing and rate-limiting.

## 2. How We Use Your Data

Your data is used exclusively for internal business operations:
1. **Payroll \u0026 Attendance**: Calculating total hours worked, breaks, and overtime based on your punch records.
2. **Security**: Verifying your identity and preventing unauthorized access to corporate systems.
3. **Troubleshooting**: Request IDs and system logs help our engineering team debug errors.

## 3. Data Protection Mechanisms

We implement strict enterprise-grade security controls to protect your data:
* **Encryption in Transit**: All communication between your browser and the WFA-SQLite backend is encrypted via TLS.
* **Authentication**: Your session is protected by a secure, short-lived, `HttpOnly` JSON Web Token (JWT) cookie that cannot be read by malicious JavaScript.
* **Access Control**: Your detailed attendance and profile data can only be viewed by you, your direct Manager, and authorized HR personnel. 
* **Log Redaction**: Our backend systems automatically strip all passwords, tokens, and precise GPS coordinates before writing to application logs.

## 4. Location Tracking Specifics
**We do not continuously track your location.** The system only requests a single GPS snapshot when you actively engage with the attendance module. We do not track your location while the application is closed or running in the background.

## 5. Your Rights (GDPR & CCPA Compliance)
Under applicable data protection laws (including the EU GDPR and California CCPA) and internal corporate policy, you have the right to:
* **Right of Access**: View the data stored about you in the system (accessible via your Employee Profile).
* **Right to Rectification**: Request corrections to inaccurate attendance logs (via the Attendance Correction workflow).
* **Right to Erasure ("Right to be Forgotten")**: Request deletion of your data upon termination of your employment. Note that financial/payroll attendance records may be subject to overriding legal retention requirements.
* **Data Portability**: Request a machine-readable export of your attendance data.

## 6. HIPAA Compliance (Health \u0026 Leave Data)
If you submit medical documentation for sick leave or reasonable accommodations, this data is treated as Electronic Protected Health Information (ePHI).
* It is stored in an encrypted, isolated silo separate from your standard employee record.
* Access is strictly limited to authorized HR Administrators.
* The organization will not use ePHI for any purpose other than administrating your specific leave or accommodation request.

If you have concerns about your privacy or wish to exercise your data rights within this system, please contact the HR or IT Security department.
