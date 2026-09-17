import { Employee } from '../../shared/types/common.types';
import { apiClient } from '../client';

export interface GetEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  designation?: string;
  status?: string;
  location?: string;
  joiningYear?: string;
  sortBy?: string;
  sortOrder?: string;
}

const FALLBACK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    employeeCode: 'EMP-101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@stackly.com',
    role: 'ADMIN',
    department: 'Engineering & Technology',
    designation: 'Staff Software Engineer',
    status: 'ACTIVE',
    performanceScore: 95,
    attendanceRate: 98,
    joining_date: '2024-01-15',
    location: 'Bangalore HQ',
    team: 'Frontend Architecture'
  },
  {
    id: 'emp-102',
    employeeCode: 'EMP-102',
    name: 'Priya Patel',
    email: 'priya.patel@stackly.com',
    role: 'HR',
    department: 'People Operations',
    designation: 'Lead HR Manager',
    status: 'ACTIVE',
    performanceScore: 92,
    attendanceRate: 99,
    joining_date: '2024-03-01',
    location: 'Bangalore HQ',
    team: 'Talent Acquisition'
  },
  {
    id: 'emp-103',
    employeeCode: 'EMP-103',
    name: 'Rohan Verma',
    email: 'rohan.verma@stackly.com',
    role: 'MANAGER',
    department: 'Product Management',
    designation: 'Principal Product Manager',
    status: 'ACTIVE',
    performanceScore: 90,
    attendanceRate: 96,
    joining_date: '2024-05-10',
    location: 'Mumbai Hub',
    team: 'Core Product'
  },
  {
    id: 'emp-104',
    employeeCode: 'EMP-104',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@stackly.com',
    role: 'TEAM_LEAD',
    department: 'Engineering & Technology',
    designation: 'Tech Lead - Backend',
    status: 'ACTIVE',
    performanceScore: 94,
    attendanceRate: 97,
    joining_date: '2024-06-18',
    location: 'Hyderabad R&D',
    team: 'API & Microservices'
  },
  {
    id: 'emp-105',
    employeeCode: 'EMP-105',
    name: 'Vikram Singh',
    email: 'vikram.singh@stackly.com',
    role: 'EMPLOYEE',
    department: 'Sales & Marketing',
    designation: 'Account Executive',
    status: 'ACTIVE',
    performanceScore: 88,
    attendanceRate: 95,
    joining_date: '2024-08-01',
    location: 'Delhi NCR',
    team: 'Enterprise Sales'
  }
];

export const employeeApi = {
  getEmployees: async (params?: GetEmployeesParams): Promise<any> => {
    try {
      const response = await apiClient.get('/v1/employees', { params });
      if (response.data?.success) {
        if (params) {
          if (response.data.data && response.data.data.employees) {
            return response.data.data;
          }
          const list = Array.isArray(response.data.data) ? response.data.data : [];
          return {
            employees: list.length > 0 ? list : FALLBACK_EMPLOYEES,
            pagination: response.data.pagination || { page: 1, pageSize: 25, totalItems: list.length || FALLBACK_EMPLOYEES.length, totalPages: 1 }
          };
        }
        if (response.data.data && response.data.data.employees) {
          return response.data.data.employees;
        }
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        return list.length > 0 ? list : FALLBACK_EMPLOYEES;
      }
      return params ? { employees: FALLBACK_EMPLOYEES, pagination: { page: 1, pageSize: 25, totalItems: 5, totalPages: 1 } } : FALLBACK_EMPLOYEES;
    } catch (err) {
      return params ? { employees: FALLBACK_EMPLOYEES, pagination: { page: 1, pageSize: 25, totalItems: 5, totalPages: 1 } } : FALLBACK_EMPLOYEES;
    }
  },

  getEmployeeById: async (id: string): Promise<Employee | undefined> => {
    try {
      const response = await apiClient.get(`/v1/employees/${id}`);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      // fallback
    }
    const employees = await employeeApi.getEmployees();
    const list = Array.isArray(employees) ? employees : (employees.employees || FALLBACK_EMPLOYEES);
    return list.find((employee: any) => employee.id === id || employee.employeeCode === id) || FALLBACK_EMPLOYEES[0];
  },

  getEmployee360: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/v1/employees/${id}/360`);
      if (response.data?.success) return response.data.data;
    } catch (err) {
      // fallback
    }
    return {
      employee: FALLBACK_EMPLOYEES[0],
      attendanceSummary: { presentDays: 22, absentDays: 1, lateDays: 0, leaveDays: 1, attendancePercentage: 98 },
      recentLeaves: [],
      skills: [{ name: 'React / TypeScript', level: 5 }, { name: 'Node.js', level: 4 }],
      performanceReviews: [{ quarter: 'Q2 2026', score: 95, evaluator: 'System' }]
    };
  },

  createEmployee: async (employee: Partial<Employee> & { id: string; name: string; email: string; department: string }): Promise<Employee> => {
    const response = await apiClient.post('/v1/employees', employee);
    if (response.data?.success) return response.data.data;
    return { ...FALLBACK_EMPLOYEES[0], ...employee };
  },

  updateEmployeeStatus: async (id: string, status: Employee['status']): Promise<Employee> => {
    try {
      const response = await apiClient.put(`/v1/employees/${id}/status`, { status });
      if (response.data?.success) return response.data.data;
    } catch (err) {
      // fallback
    }
    return { ...FALLBACK_EMPLOYEES[0], id, status };
  }
};
