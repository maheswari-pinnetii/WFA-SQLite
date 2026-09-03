/**
 * Pattern 14: Star Schema Data Warehouse Modeling
 * Analytical dimensional data model splitting data into Fact Tables (`fact_attendance`) and Dimension Tables (`dim_*`).
 */

export interface DimDate {
  dateKey: number; // YYYYMMDD
  fullDate: string;
  dayOfWeek: string;
  monthName: string;
  quarter: number;
  year: number;
  isWeekend: boolean;
}

export interface DimEmployee {
  employeeKey: string;
  employeeCode: string;
  departmentKey: string;
  locationKey: string;
  role: string;
}

export interface FactAttendanceDaily {
  factKey: string;
  dateKey: number;
  employeeKey: string;
  hoursWorked: number;
  overtimeHours: number;
  breakMinutes: number;
  isLate: boolean;
  status: string;
}

export class StarSchemaWarehouse {
  public generateFactRecord(
    date: Date,
    employeeId: string,
    hoursWorked: number,
    overtimeHours: number,
    breakMinutes: number,
    isLate: boolean
  ): { fact: FactAttendanceDaily; dimDate: DimDate } {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateKey = parseInt(`${y}${m}${d}`, 10);

    const dimDate: DimDate = {
      dateKey,
      fullDate: `${y}-${m}-${d}`,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      monthName: date.toLocaleDateString('en-US', { month: 'long' }),
      quarter: Math.floor(date.getMonth() / 3) + 1,
      year: y,
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    };

    const fact: FactAttendanceDaily = {
      factKey: `fact-${dateKey}-${employeeId}`,
      dateKey,
      employeeKey: employeeId,
      hoursWorked,
      overtimeHours,
      breakMinutes,
      isLate,
      status: 'PRESENT'
    };

    return { fact, dimDate };
  }
}

export const starSchemaWarehouse = new StarSchemaWarehouse();
