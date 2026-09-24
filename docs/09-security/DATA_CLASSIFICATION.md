# Data Classification Policy

This document outlines how data is classified, handled, and protected within the WFA-SQLite ecosystem to ensure security, privacy, and compliance.

---

## 1. Data Classification Levels

All data managed by the system is categorized into one of three classification levels:

### Level 1: Public
* **Definition**: Data that is freely accessible or has no security implications if exposed.
* **Examples**: 
  * Company logo
  * Public-facing landing page content
  * High-level office locations
* **Handling**: No encryption at rest required. Can be cached freely on edge CDNs.

### Level 2: Internal (Confidential)
* **Definition**: Proprietary business data meant only for employees. Unauthorized disclosure could cause moderate operational impact.
* **Examples**:
  * Internal employee directories
  * Department schemas
  * General application logs (with PII redacted)
  * Shift schedules
* **Handling**: Requires RBAC (Role-Based Access Control) to view. Encrypted in transit via TLS.

### Level 3: Restricted (Highly Sensitive / PII)
* **Definition**: Personally Identifiable Information (PII), biometric data, or authentication secrets. Unauthorized disclosure carries severe legal or financial penalties.
* **Examples**:
  * Passwords (Argon2id hashes)
  * Passkey credentials / WebAuthn public keys
  * Exact employee geolocation data (Latitude/Longitude check-ins)
  * Session Tokens / JWTs
* **Handling**: 
  * **Storage**: Must be encrypted at rest using AES-256 (if enabled) or securely hashed.
  * **Transmission**: strictly TLS 1.2+.
  * **Logging**: Must be strictly redacted by the `logger.ts` middleware. Never log raw passwords or tokens.
  * **Access**: Restricted by strict RBAC guards. Only the owning employee or an authorized `HR_ADMIN` can access.

---

## 2. PII Redaction Strategy

To prevent Level 3 data from leaking into external monitoring tools (like Datadog or ELK), our centralized Winston logger utilizes a sanitization wrapper.

Fields automatically redacted in logs:
* `password`
* `token`
* `authorization`
* `cookie`
* `latitude` / `longitude`

## 3. Regulatory Compliance Mappings

### GDPR (General Data Protection Regulation)
All Level 3 (PII) data is strictly subject to GDPR controls for European employees:
* **Right to be Forgotten**: Attendance logs and biometric indicators must be anonymized (or hard-deleted) upon employee termination.
* **Data Minimization**: The system only collects the minimum geolocation required to verify geofence boundaries, not continuous tracking.

### HIPAA (Health Insurance Portability and Accountability Act)
While WFA-SQLite is primarily an attendance system, any integration involving employee sick leave documents or medical accommodation data must be treated as ePHI (Electronic Protected Health Information):
* **Handling**: Medical data must NEVER be stored in standard `employee` records. It must be isolated, encrypted at rest, and strictly limited to `HR_ADMIN` roles.
* **Audit Trails**: Every read/write access to this data must be permanently logged in the audit tables.

## 4. Data Retention and Deletion
* **Attendance Logs**: Retained for 7 years for compliance.
* **Session Cookies**: Hard-expire after 24 hours.
* **Employee PII**: Must be hard-deleted or irrevocably anonymized within 30 days of an employee termination to comply with GDPR/CCPA "Right to be Forgotten" mandates.
