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
  lifecycleStage?: string;
}

const FALLBACK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101', employeeCode: 'EMP-101', name: 'Aarav Sharma', email: 'aarav.sharma@stackly.com',
    role: 'ADMIN', department: 'Engineering & Technology', designation: 'Staff Software Engineer',
    status: 'ACTIVE', performanceScore: 95, attendanceRate: 98, joining_date: '2022-01-15', location: 'Bangalore HQ', team: 'Frontend Architecture'
  },
  {
    id: 'emp-102', employeeCode: 'EMP-102', name: 'Priya Patel', email: 'priya.patel@stackly.com',
    role: 'HR', department: 'People Operations', designation: 'Lead HR Manager',
    status: 'ACTIVE', performanceScore: 92, attendanceRate: 99, joining_date: '2022-03-01', location: 'Bangalore HQ', team: 'Talent Acquisition'
  },
  {
    id: 'emp-103', employeeCode: 'EMP-103', name: 'Rohan Verma', email: 'rohan.verma@stackly.com',
    role: 'MANAGER', department: 'Product Management', designation: 'Principal Product Manager',
    status: 'ACTIVE', performanceScore: 90, attendanceRate: 96, joining_date: '2022-05-10', location: 'Mumbai Hub', team: 'Core Product'
  },
  {
    id: 'emp-104', employeeCode: 'EMP-104', name: 'Sneha Reddy', email: 'sneha.reddy@stackly.com',
    role: 'TEAM_LEAD', department: 'Engineering & Technology', designation: 'Tech Lead - Backend',
    status: 'ACTIVE', performanceScore: 94, attendanceRate: 97, joining_date: '2022-06-18', location: 'Hyderabad R&D', team: 'API & Microservices'
  },
  {
    id: 'emp-105', employeeCode: 'EMP-105', name: 'Vikram Singh', email: 'vikram.singh@stackly.com',
    role: 'EMPLOYEE', department: 'Sales & Marketing', designation: 'Account Executive',
    status: 'ACTIVE', performanceScore: 88, attendanceRate: 95, joining_date: '2022-08-01', location: 'Delhi NCR', team: 'Enterprise Sales'
  },
  {
    id: 'emp-106', employeeCode: 'EMP-106', name: 'Kavya Nair', email: 'kavya.nair@stackly.com',
    role: 'EMPLOYEE', department: 'Engineering & Technology', designation: 'Senior Frontend Developer',
    status: 'ACTIVE', performanceScore: 91, attendanceRate: 97, joining_date: '2023-01-10', location: 'Bangalore HQ', team: 'Frontend Architecture'
  },
  {
    id: 'emp-107', employeeCode: 'EMP-107', name: 'Arjun Mehta', email: 'arjun.mehta@stackly.com',
    role: 'EMPLOYEE', department: 'Finance & Operations', designation: 'Finance Analyst',
    status: 'ACTIVE', performanceScore: 87, attendanceRate: 98, joining_date: '2023-02-14', location: 'Mumbai Hub', team: 'FP&A'
  },
  {
    id: 'emp-108', employeeCode: 'EMP-108', name: 'Divya Krishnamurthy', email: 'divya.k@stackly.com',
    role: 'EMPLOYEE', department: 'Customer Success', designation: 'Customer Success Manager',
    status: 'ACTIVE', performanceScore: 93, attendanceRate: 96, joining_date: '2023-04-20', location: 'Chennai Office', team: 'Enterprise CS'
  },
  {
    id: 'emp-109', employeeCode: 'EMP-109', name: 'Rahul Joshi', email: 'rahul.joshi@stackly.com',
    role: 'EMPLOYEE', department: 'Engineering & Technology', designation: 'DevOps Engineer',
    status: 'ACTIVE', performanceScore: 89, attendanceRate: 94, joining_date: '2023-06-05', location: 'Hyderabad R&D', team: 'Platform & Infra'
  },
  {
    id: 'emp-110', employeeCode: 'EMP-110', name: 'Meera Iyer', email: 'meera.iyer@stackly.com',
    role: 'EMPLOYEE', department: 'People Operations', designation: 'HR Business Partner',
    status: 'ON_LEAVE', performanceScore: 90, attendanceRate: 93, joining_date: '2023-07-15', location: 'Bangalore HQ', team: 'HR Business Partners'
  },
  {
    id: 'emp-111', employeeCode: 'EMP-111', name: 'Kiran Rao', email: 'kiran.rao@stackly.com',
    role: 'EMPLOYEE', department: 'Sales & Marketing', designation: 'Growth Marketing Lead',
    status: 'ACTIVE', performanceScore: 86, attendanceRate: 92, joining_date: '2023-09-01', location: 'Bangalore HQ', team: 'Digital Marketing'
  },
  {
    id: 'emp-112', employeeCode: 'EMP-112', name: 'Aisha Khan', email: 'aisha.khan@stackly.com',
    role: 'EMPLOYEE', department: 'Engineering & Technology', designation: 'Data Scientist',
    status: 'ACTIVE', performanceScore: 96, attendanceRate: 99, joining_date: '2023-10-12', location: 'Hyderabad R&D', team: 'AI & Data Science'
  },
  {
    id: 'emp-113', employeeCode: 'EMP-113', name: 'Sanjay Kumar', email: 'sanjay.kumar@stackly.com',
    role: 'EMPLOYEE', department: 'Finance & Operations', designation: 'Payroll Specialist',
    status: 'ACTIVE', performanceScore: 85, attendanceRate: 97, joining_date: '2024-01-08', location: 'Mumbai Hub', team: 'Payroll & Compliance'
  },
  {
    id: 'emp-114', employeeCode: 'EMP-114', name: 'Ananya Gupta', email: 'ananya.gupta@stackly.com',
    role: 'EMPLOYEE', department: 'Product Management', designation: 'UX Researcher',
    status: 'ACTIVE', performanceScore: 92, attendanceRate: 96, joining_date: '2024-02-20', location: 'Bangalore HQ', team: 'Design & Research'
  },
  {
    id: 'emp-115', employeeCode: 'EMP-115', name: 'Suresh Pillai', email: 'suresh.pillai@stackly.com',
    role: 'EMPLOYEE', department: 'Customer Success', designation: 'Support Engineer',
    status: 'ACTIVE', performanceScore: 84, attendanceRate: 91, joining_date: '2024-04-01', location: 'Chennai Office', team: 'Technical Support'
  },
  {
    id: 'emp-116', employeeCode: 'EMP-116', name: 'Riya Desai', email: 'riya.desai@stackly.com',
    role: 'EMPLOYEE', department: 'Engineering & Technology', designation: 'QA Engineer',
    status: 'ACTIVE', performanceScore: 88, attendanceRate: 95, joining_date: '2024-05-15', location: 'Bangalore HQ', team: 'Quality Assurance'
  },
  {
    id: 'emp-117', employeeCode: 'EMP-117', name: 'Nikhil Bhat', email: 'nikhil.bhat@stackly.com',
    role: 'EMPLOYEE', department: 'Engineering & Technology', designation: 'Mobile Developer',
    status: 'ACTIVE', performanceScore: 90, attendanceRate: 94, joining_date: '2024-07-10', location: 'Hyderabad R&D', team: 'Mobile Engineering'
  },
  {
    id: 'emp-118', employeeCode: 'EMP-118', name: 'Pooja Agarwal', email: 'pooja.agarwal@stackly.com',
    role: 'EMPLOYEE', department: 'Sales & Marketing', designation: 'Sales Representative',
    status: 'ACTIVE', performanceScore: 83, attendanceRate: 90, joining_date: '2024-08-20', location: 'Delhi NCR', team: 'SMB Sales'
  },
  {
    id: 'emp-119', employeeCode: 'EMP-119', name: 'Deepak Sinha', email: 'deepak.sinha@stackly.com',
    role: 'EMPLOYEE', department: 'Finance & Operations', designation: 'Business Analyst',
    status: 'ACTIVE', performanceScore: 86, attendanceRate: 93, joining_date: '2025-01-05', location: 'Mumbai Hub', team: 'Strategic Operations'
  },
  {
    id: 'emp-120', employeeCode: 'EMP-120', name: 'Tanvi Jain', email: 'tanvi.jain@stackly.com',
    role: 'EMPLOYEE', department: 'Engineering & Technology', designation: 'Cloud Infrastructure Engineer',
    status: 'ACTIVE', performanceScore: 93, attendanceRate: 98, joining_date: '2025-03-15', location: 'Bangalore HQ', team: 'Cloud & Security'
  },
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
