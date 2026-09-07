# Terms of Use (Internal Software)

**Last Updated: [Current Date]**

By accessing or using the WFA-SQLite application ("the Software"), you agree to be bound by these Internal Terms of Use. This Software is provided exclusively for the employees and authorized contractors of the organization.

## 1. Authorized Use
The Software is intended solely for internal business operations, including but not limited to:
* Logging attendance and work hours.
* Managing departmental resources.
* Viewing organizational directories.

You agree not to:
* Attempt to bypass Role-Based Access Control (RBAC) restrictions.
* Share your authentication credentials, session tokens, or Passkeys with any other individual.
* Use the Software for any personal, non-business related activities.

## 2. System Monitoring and Telemetry
To ensure security, performance, and reliability, the organization actively monitors usage of the Software. 
* All API requests are logged with a unique `x-request-id`.
* IP addresses, device types, and access timestamps are recorded.
* The organization reserves the right to audit these logs at any time for security or compliance purposes.

## 3. Geofencing and Location Data
For employees required to check-in on-site, the Software will request your browser or device's location.
* You must grant location permissions to use the geofenced check-in feature.
* Circumventing location checks via GPS spoofing or VPN manipulation is a violation of company policy.

## 4. Intellectual Property
All code, UI designs, databases (including SQLite schemas), and architecture related to WFA-SQLite are the exclusive property of the organization. You may not copy, reverse-engineer, or distribute the source code outside of authorized corporate environments.

## 5. Termination of Access
Your access to the Software is tied to your active employment or contract status. Access will be immediately revoked upon termination of employment, and any local session cookies will be invalidated.

## 6. Disclaimer
The Software is provided "as is". While the organization strives for 100% uptime, system maintenance or unexpected downtime may occur. If the Software is offline, employees must follow the manual attendance logging fallback procedure provided by HR.
