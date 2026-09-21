import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { query } from '../database/sqlite-cloud.js';

const ORGANIZATION_ID = 'org-stackly';
const JWT_SECRET = env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized access token missing' });

  try {
    // 1. Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    }) as any;
    
    // 2. Real-time session revocation check
    if (decoded.sessionId) {
      const sess = await query('SELECT revokedAt, expiresAt FROM sessions WHERE id = ?', [decoded.sessionId]);
      if (sess && sess.length > 0) {
        if (sess[0].revokedAt) {
          return res.status(401).json({ success: false, message: 'Session has been revoked. Please sign in again.' });
        }
        if (new Date(sess[0].expiresAt) < new Date()) {
          return res.status(401).json({ success: false, message: 'Session has expired.' });
        }
      }
    }

    const userId = decoded.id || decoded.sub;
    const email = decoded.email;

    let appUser = null;
    if (userId && typeof userId === 'string') {
      const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
      if (rows && rows.length > 0) appUser = rows[0];
    }
    if (!appUser && email && typeof email === 'string') {
      const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      if (rows && rows.length > 0) appUser = rows[0];
    }
    // CRITICAL SECURITY FIX: Never fallback to client/JWT-decoded object merely because it contains a role
    if (!appUser) {
      return res.status(401).json({ success: false, message: 'User profile not found in database. Authentication failed.' });
    }

    // 3. User status validation (inactive/suspended)
    if (appUser.status && appUser.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is inactive or suspended.' });
    }

    // 4. Check account lockout state
    if (appUser.email) {
      const lockCheck = await query('SELECT lockedUntil FROM failed_logins WHERE email = ?', [appUser.email]);
      if (lockCheck && lockCheck.length > 0 && lockCheck[0].lockedUntil) {
        if (new Date(lockCheck[0].lockedUntil) > new Date()) {
          return res.status(403).json({ success: false, message: 'Account is temporarily locked. Contact administrator or try again later.' });
        }
      }
    }

    const orgId = appUser.organizationId || appUser.companyId || ORGANIZATION_ID;
    let dept = appUser.department || decoded.department;
    let team = appUser.team || decoded.team;
    if ((!dept || !team) && userId) {
      const empProfile = await Employee.findOne({ id: userId });
      if (empProfile) {
        dept = dept || empProfile.department;
        team = team || empProfile.team;
      }
    }

    req.user = { ...appUser, department: dept, team, organizationId: orgId, companyId: orgId };
    req.companyId = orgId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Insufficient Permissions' });
    }
    next();
  };
};

export const authorizePermissions = (allowedPermissions) => {
  return (req, res, next) => {
    const permissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
    if (req.user?.role === 'ADMIN' || allowedPermissions.some((permission) => permissions.includes(permission))) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Access Denied: Required permission is missing.' });
  };
};

// Check if request complies with organization, department, and employee scopes
export const enforceScope = async (req, res, next) => {
  try {
    const { role, department, team, id: userId, organizationId = ORGANIZATION_ID } = req.user;
    
    const targetOrganization = (req.query && (req.query.organizationId || req.query.orgId || req.query.companyId))
      || (req.body && (req.body.organizationId || req.body.orgId || req.body.companyId));

    if (targetOrganization && targetOrganization !== organizationId) {
      return res.status(403).json({ success: false, message: 'Access Denied: Cross-organization access is forbidden.' });
    }

    if (role === 'ADMIN' || role === 'HR') {
      return next();
    }

    const targetEmployeeId = (req.query && req.query.employeeId) || (req.body && req.body.employeeId) || (req.params && (req.params.employeeId || req.params.id));
    const targetDept = (req.query && req.query.department) || (req.body && req.body.department) || (req.params && req.params.department);
    const targetTeam = (req.query && req.query.team) || (req.body && req.body.team) || (req.params && req.params.team);

    if (role === 'EMPLOYEE') {
      const userEmployeeId = req.user?.employeeId || userId;
      if (targetEmployeeId && targetEmployeeId !== userId && targetEmployeeId !== userEmployeeId) {
        return res.status(403).json({ success: false, message: 'Access Denied: You can only access your own records.' });
      }
      return next();
    }

    if (role === 'MANAGER' || role === 'TEAM_LEAD') {
      if (targetDept && targetDept !== department) {
        return res.status(403).json({ success: false, message: 'Access Denied: Scoped to your department only.' });
      }
      if (targetTeam && role === 'TEAM_LEAD' && targetTeam !== team) {
        return res.status(403).json({ success: false, message: 'Access Denied: Scoped to your team only.' });
      }

      if (!targetEmployeeId) return next();

      let target = await Employee.findOne({ id: targetEmployeeId, organizationId });
      if (!target) {
        target = await User.findOne({ id: targetEmployeeId, organizationId });
      }

      if (!target) {
        return res.status(404).json({ success: false, message: 'Resource not found or access forbidden.' });
      }
      if (target.department !== department) {
        return res.status(403).json({ success: false, message: 'Access Denied: Scoped to your department only.' });
      }
      if (role === 'TEAM_LEAD' && target.team !== team) {
        return res.status(403).json({ success: false, message: 'Access Denied: Scoped to your team only.' });
      }
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access Denied: Invalid scopes.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to validate access scope.' });
  }
};
