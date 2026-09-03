import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const ORGANIZATION_ID = 'org-stackly';
const JWT_SECRET = env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized access token missing' });

  try {
    // 1. Verify Supabase JWT (signed with JWT_SECRET / SUPABASE_JWT_SECRET)
    // Note: Ensure env.JWT_SECRET matches your Supabase Project JWT Secret
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Supabase sets the user ID in the 'sub' claim and email in 'email' claim
    const supabaseId = decoded.sub;
    const email = decoded.email;

    // 2. Lookup the corresponding application user in SQLite
    let appUser = await User.findOne({ supabase_auth_id: supabaseId });
    
    if (!appUser && email) {
      // Fallback: If they haven't been mapped yet, find by email and link them
      appUser = await User.findOne({ email });
      if (appUser) {
        appUser.supabase_auth_id = supabaseId;
        await appUser.save();
      }
    }

    if (!appUser) {
      return res.status(401).json({ success: false, message: 'User profile not found in system' });
    }

    const orgId = appUser.organizationId || appUser.companyId || ORGANIZATION_ID;
    req.user = { ...appUser, organizationId: orgId, companyId: orgId };
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
      if (targetEmployeeId && targetEmployeeId !== userId) {
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
        return res.status(403).json({ success: false, message: 'Access Denied: Target is outside your organization.' });
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
