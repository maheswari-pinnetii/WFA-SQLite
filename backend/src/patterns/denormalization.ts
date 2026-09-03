/**
 * Pattern 11: Controlled Denormalization Engine
 * Duplicate specific relational fields (e.g. employeeName, department, organizationName) in log/read records to avoid heavy JOINs.
 */

export interface NormalizedAttendance {
  id: string;
  employeeId: string;
  date: string;
  status: string;
}

export interface DenormalizedAttendance extends NormalizedAttendance {
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  organizationName: string;
  denormalizedAt: string;
}

export class DenormalizationEngine {
  public denormalizeRecord(
    record: NormalizedAttendance,
    employeeMeta: { code: string; name: string; department: string; organization: string }
  ): DenormalizedAttendance {
    return {
      ...record,
      employeeCode: employeeMeta.code,
      employeeName: employeeMeta.name,
      departmentName: employeeMeta.department,
      organizationName: employeeMeta.organization,
      denormalizedAt: new Date().toISOString()
    };
  }
}

export const denormalizationEngine = new DenormalizationEngine();
