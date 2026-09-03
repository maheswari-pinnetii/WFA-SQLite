/**
 * Pattern 5: Database per Service
 * Microservice architecture pattern isolating databases by domain boundary (Attendance DB, Employee DB, Payroll DB).
 */

export interface ServiceDatabase {
  serviceName: string;
  databaseUri: string;
  schemaVersion: string;
  isolatedTables: string[];
}

export class DatabasePerServiceManager {
  private services: Record<string, ServiceDatabase> = {
    authService: {
      serviceName: 'Auth & Identity Service',
      databaseUri: 'sqlite://./database/sqlite/auth_service.sqlite',
      schemaVersion: 'v1.4',
      isolatedTables: ['users', 'refresh_tokens', 'mfa_settings', 'passkey_credentials']
    },
    employeeService: {
      serviceName: 'Employee Directory Service',
      databaseUri: 'sqlite://./database/sqlite/employee_service.sqlite',
      schemaVersion: 'v2.1',
      isolatedTables: ['employees', 'departments', 'teams', 'locations']
    },
    attendanceService: {
      serviceName: 'Attendance & Punch Service',
      databaseUri: 'sqlite://./database/sqlite/attendance_service.sqlite',
      schemaVersion: 'v3.0',
      isolatedTables: ['attendance', 'break_sessions', 'attendance_events', 'corrections']
    },
    payrollService: {
      serviceName: 'HR Payroll & Ledger Service',
      databaseUri: 'sqlite://./database/sqlite/payroll_service.sqlite',
      schemaVersion: 'v1.8',
      isolatedTables: ['payroll_runs', 'payroll_ledgers', 'leave_balances']
    }
  };

  public getServiceDatabases(): Record<string, ServiceDatabase> {
    return this.services;
  }

  public getDatabaseForService(serviceKey: string): ServiceDatabase | null {
    return this.services[serviceKey] || null;
  }
}

export const databasePerServiceManager = new DatabasePerServiceManager();
