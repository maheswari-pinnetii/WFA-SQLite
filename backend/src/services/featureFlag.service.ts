import { query, execute } from '../database/sqlite-cloud.js';
import { emitToOrg } from '../sockets/socketEmitter.js';
import { SOCKET_EVENTS } from '../sockets/events.js';
import logger from '../config/logger.js';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  targetRoles: string[];
  organizationId: string;
  updatedAt: string;
  createdAt: string;
}

class FeatureFlagService {
  private cache: Map<string, FeatureFlag> = new Map();
  private initialized: boolean = false;

  async initDefaults(orgId: string = 'org-stackly') {
    const defaultFlags: Array<{ key: string; name: string; description: string; enabled: number; roles: string[] }> = [
      {
        key: 'REALTIME_SOCKETS',
        name: 'Real-Time Socket.IO Updates',
        description: 'Enables live websocket pushes for attendance, leave, and KPIs',
        enabled: 1,
        roles: ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE']
      },
      {
        key: 'AI_WORKFORCE_INSIGHTS',
        name: 'AI Workforce Insights & Predictions',
        description: 'Enables automated statistical anomaly detection and predictive analytics',
        enabled: 1,
        roles: ['ADMIN', 'HR', 'MANAGER']
      },
      {
        key: 'GEOFENCING_ENFORCEMENT',
        name: 'GPS Geofencing Validation',
        description: 'Validates device coordinates against office boundary during check-in',
        enabled: 1,
        roles: ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE']
      },
      {
        key: 'BIOMETRIC_PASSKEY_LOGIN',
        name: 'Biometric & Passkey Login',
        description: 'Enables FIDO2 WebAuthn and platform authenticator unlock',
        enabled: 1,
        roles: ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE']
      },
      {
        key: 'OFFLINE_ATTENDANCE_QUEUE',
        name: 'Offline Attendance Queueing',
        description: 'Permits client-side punch caching and background reconciliation',
        enabled: 1,
        roles: ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE']
      }
    ];

    const now = new Date().toISOString();
    for (const flag of defaultFlags) {
      try {
        await execute(
          `INSERT OR IGNORE INTO feature_flags (key, name, description, enabled, target_roles, organization_id, updated_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [flag.key, flag.name, flag.description, flag.enabled, JSON.stringify(flag.roles), orgId, now, now]
        );
      } catch (err: any) {
        logger.error('feature_flags.init_error', `Failed to seed flag ${flag.key}: ${err.message}`);
      }
    }
    await this.refreshCache(orgId);
  }

  async refreshCache(orgId: string = 'org-stackly'): Promise<void> {
    try {
      const rows = await query<any>('SELECT * FROM feature_flags WHERE organization_id = ?', [orgId]);
      this.cache.clear();
      for (const r of rows) {
        let targetRoles: string[] = ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE'];
        try {
          if (r.target_roles) targetRoles = JSON.parse(r.target_roles);
        } catch (_) {}

        this.cache.set(r.key, {
          key: r.key,
          name: r.name,
          description: r.description,
          enabled: Boolean(r.enabled),
          targetRoles,
          organizationId: r.organization_id,
          updatedAt: r.updated_at,
          createdAt: r.created_at
        });
      }
      this.initialized = true;
    } catch (err: any) {
      logger.error('feature_flags.refresh_error', `Cache refresh failed: ${err.message}`);
    }
  }

  async isEnabled(key: string, userRole?: string, orgId: string = 'org-stackly'): Promise<boolean> {
    if (!this.initialized) {
      await this.initDefaults(orgId);
    }
    const flag = this.cache.get(key);
    if (!flag) return true; // Default permissive if flag doesn't exist
    if (!flag.enabled) return false;
    if (userRole && flag.targetRoles.length > 0) {
      return flag.targetRoles.includes(userRole.toUpperCase());
    }
    return true;
  }

  async getAllFlags(orgId: string = 'org-stackly'): Promise<FeatureFlag[]> {
    if (!this.initialized) {
      await this.initDefaults(orgId);
    }
    return Array.from(this.cache.values());
  }

  async setFlag(key: string, enabled: boolean, orgId: string = 'org-stackly'): Promise<FeatureFlag | null> {
    const now = new Date().toISOString();
    await execute(
      'UPDATE feature_flags SET enabled = ?, updated_at = ? WHERE key = ? AND organization_id = ?',
      [enabled ? 1 : 0, now, key, orgId]
    );
    await this.refreshCache(orgId);
    const updated = this.cache.get(key) || null;

    if (updated) {
      // Emit real-time event to organization room
      emitToOrg(orgId, SOCKET_EVENTS.FEATURE_FLAG_UPDATED, updated);
      logger.info('feature_flags.updated', `Feature flag [${key}] set to ${enabled}`);
    }
    return updated;
  }
}

export const featureFlagService = new FeatureFlagService();
