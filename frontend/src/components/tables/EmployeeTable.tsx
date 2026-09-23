import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../app/store';
import { fetchEmployeesThunk, updateEmployeeStatusThunk } from '../../features/hr/store/hrSlice';
import { Employee } from '../../shared/types/common.types';
import { getRoleBadgeClass, formatDate } from '../../shared/utils/helpers';
import { Search, ChevronLeft, ChevronRight, UserPlus, Filter, ChevronsLeft, ChevronsRight, Eye, Pencil, Clock, CalendarDays, Wallet, FileText, History, UserCheck, UserX, Trash2 } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { useDepartmentAccess } from '../../hooks/useDepartmentAccess';
import { StatusBadge } from '../common/StatusBadge';
import { ActionMenu, ActionMenuItem } from '../common/ActionMenu';
import { Permission } from '../../security/permissions/permissions';
import { DataTable, Column } from '../../shared/components/DataTable';

interface EmployeeTableProps {
  locationFilter?: string;
  deptFilter?: string;
  teamFilter?: string;
  statusFilter?: string;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  locationFilter = 'ALL',
  deptFilter = 'ALL',
  teamFilter = 'ALL',
  statusFilter = 'ALL'
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { employees, isLoading } = useSelector((state: RootState) => state.hr);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  const getEmployeeActions = (emp: Employee): ActionMenuItem<Employee>[] => [
    {
      id: 'view',
      label: 'View Profile',
      icon: Eye,
      permission: Permission.EMPLOYEE_VIEW,
      onClick: () => navigate(`/employee-details/${emp.id}`),
    },
    {
      id: 'edit',
      label: 'Edit Employee',
      icon: Pencil,
      permission: Permission.EMPLOYEE_UPDATE,
      onClick: () => navigate(`/employee-details/${emp.id}?edit=true`),
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: Clock,
      permission: Permission.ATTENDANCE_VIEW,
      onClick: () => navigate(`/attendance?employeeId=${emp.id}`),
    },
    {
      id: 'leave',
      label: 'Leave',
      icon: CalendarDays,
      permission: Permission.LEAVE_REQUEST,
      onClick: () => navigate(`/leave?employeeId=${emp.id}`),
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: Wallet,
      permission: Permission.EMPLOYEE_VIEW,
      onClick: () => navigate(`/payroll?employeeId=${emp.id}`),
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      permission: Permission.DOCUMENT_UPLOAD,
      onClick: () => navigate(`/documents?employeeId=${emp.id}`),
    },
    {
      id: 'audit',
      label: 'Audit History',
      icon: History,
      permission: Permission.AUDIT_LOG_VIEW,
      onClick: () => navigate(`/audit-logs?employeeId=${emp.id}`),
    },
    {
      id: 'toggle-status',
      label: emp.status === 'Active' ? 'Deactivate' : 'Activate',
      icon: emp.status === 'Active' ? UserX : UserCheck,
      permission: Permission.EMPLOYEE_UPDATE,
      danger: emp.status === 'Active',
      dividerBefore: true,
      requiresConfirmation: emp.status === 'Active',
      confirmationTitle: 'Deactivate Employee',
      confirmationMessage: `Are you sure you want to deactivate ${emp.name}? They will lose access to system features until reactivated.`,
      onClick: async () => {
        const nextStatus = emp.status === 'Active' ? 'TERMINATED' : 'Active';
        await dispatch(updateEmployeeStatusThunk({ id: emp.id, status: nextStatus }));
      },
    },
  ];

  const handleStatusChange = (id: string, status: Employee['status']) => {
    dispatch(updateEmployeeStatusThunk({ id, status }));
  };

  const { canAccessDepartment } = useDepartmentAccess();

  const safeEmployees = Array.isArray(employees) ? employees : (employees as any)?.employees || [];
  const filteredEmployees = safeEmployees.filter((emp: any) => {
    const deptId = (emp as any).departmentId || emp.department || '';
    const hasDbacAccess = canAccessDepartment(deptId) || canAccessDepartment(emp.department);

    if (!hasDbacAccess) return false;

    const code = emp.employeeCode || emp.code || '';
    const desig = emp.designation || '';
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      desig.toLowerCase().includes(search.toLowerCase());

    // Use parent dashboard filters if they are not the default 'ALL' or 'All'
    const finalDept = deptFilter !== 'ALL' && deptFilter !== 'All' ? deptFilter : departmentFilter;
    const matchesDept = finalDept === 'ALL' || finalDept === 'All' || emp.department === finalDept;
    
    const matchesLocation = locationFilter === 'ALL' || locationFilter === 'All' || emp.location === locationFilter;
    const matchesTeam = teamFilter === 'ALL' || teamFilter === 'All' || emp.team === teamFilter;
    const matchesStatus = statusFilter === 'ALL' || statusFilter === 'All' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesLocation && matchesTeam && matchesStatus;
  });

  const sortedFilteredEmployees = useMemo(() => {
    if (!filteredEmployees) return [];
    return [...filteredEmployees].sort((a, b) => {
      const codeA = (a && (a.employeeCode || a.code)) || '';
      const codeB = (b && (b.employeeCode || b.code)) || '';
      
      const numA = Number(codeA.match(/(\d+)$/)?.[1] ?? 0);
      const numB = Number(codeB.match(/(\d+)$/)?.[1] ?? 0);
      
      return numA - numB;
    });
  }, [filteredEmployees]);

  const totalPages = Math.ceil(sortedFilteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = sortedFilteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  const departments = [
    'ALL',
    'Engineering',
    'Product Management',
    'Sales & Marketing',
    'Human Resources',
    'Customer Success',
    'Finance & Operations'
  ];

  const handleExport = () => {
    // Generate CSV for currently filtered employees
    const csvRows = [];
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Location', 'Status', 'Join Date'];
    csvRows.push(headers.join(','));
    
    filteredEmployees.forEach((emp: any) => {
      const values = [
        emp.employeeCode || emp.code || emp.id,
        `"${emp.name}"`,
        `"${emp.email}"`,
        `"${emp.department}"`,
        `"${emp.location || ''}"`,
        emp.status,
        emp.joinDate || ''
      ];
      csvRows.push(values.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'employees_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns: Column<any>[] = [
    {
      key: 'code',
      header: 'Employee ID',
      accessorKey: 'employeeCode',
      render: (emp) => (
        <span className="font-mono font-bold text-[var(--text-secondary)]">
          {emp.employeeCode || emp.code || 'EMP-1000'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Employee Name',
      accessorKey: 'name',
      render: (emp) => (
        <div>
          <div className="font-bold text-[var(--text-primary)]">{emp.name}</div>
          <div className="text-[10px] text-[var(--text-muted)] font-semibold">{emp.designation || 'Specialist'}</div>
        </div>
      )
    },
    {
      key: 'joinDate',
      header: 'Joining Date',
      accessorKey: 'joinDate',
      render: (emp) => {
        if (!emp.joinDate) return <span className="text-[var(--text-secondary)] font-medium">N/A</span>;
        const dateObj = new Date(emp.joinDate);
        if (isNaN(dateObj.getTime())) return <span className="text-[var(--text-secondary)] font-medium">{emp.joinDate}</span>;
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        const year = dateObj.getFullYear();
        return <span className="text-[var(--text-secondary)] font-medium">{`${day} ${month} ${year}`}</span>;
      }
    },
    {
      key: 'status',
      header: 'Employment Status',
      accessorKey: 'status',
      render: (emp) => (
        <select
          value={emp.status}
          onChange={(e) => handleStatusChange(emp.id, e.target.value as Employee['status'])}
          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
        >
          <option value="Active">Active</option>
          <option value="ON_LEAVE">ON_LEAVE</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      )
    },
    {
      key: 'tenure',
      header: 'Tenure',
      render: (emp) => {
        if (!emp.joinDate) return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">N/A</span>;
        const joinDate = new Date(emp.joinDate);
        const now = new Date();
        if (isNaN(joinDate.getTime()) || joinDate > now) return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0 days</span>;
        let years = now.getFullYear() - joinDate.getFullYear();
        let months = now.getMonth() - joinDate.getMonth();
        let days = now.getDate() - joinDate.getDate();
        if (days < 0) {
          months -= 1;
          const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          days += prevMonth.getDate();
        }
        if (months < 0) {
          years -= 1;
          months += 12;
        }
        const parts = [];
        if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days > 0 || parts.length === 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
        return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{parts.slice(0, 2).join(' ')}</span>;
      }
    },
    {
      key: 'department',
      header: 'Department',
      accessorKey: 'department',
      render: (emp) => <span className="font-bold text-[var(--text-primary)]">{emp.department}</span>
    },
    {
      key: 'team',
      header: 'Team',
      accessorKey: 'team',
      render: (emp) => <span className="text-[var(--text-muted)]">{emp.team || 'N/A'}</span>
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (emp) => <span className="text-[var(--text-muted)]">{emp.manager || 'Priya Sharma'}</span>
    },
    {
      key: 'teamLead',
      header: 'Team Lead',
      render: (emp) => <span className="text-[var(--text-muted)]">{emp.teamLead || 'Arjun Reddy'}</span>
    },
    {
      key: 'location',
      header: 'Location',
      accessorKey: 'location',
      render: (emp) => <span className="text-[var(--text-secondary)] font-semibold">{emp.location || 'HQ'}</span>
    },
    {
      key: 'attendanceStatus',
      header: 'Attendance Status',
      render: (emp) => <StatusBadge status={emp.attendance_status || 'PRESENT'} />
    },
    {
      key: 'shiftTimings',
      header: 'Shift Timings',
      render: (emp) => <span className="font-mono text-[var(--text-secondary)] font-semibold">{emp.shiftTiming || emp.shift || '09:00 - 18:00 (GS)'}</span>
    },
    {
      key: 'checkIn',
      header: 'Check-In',
      render: (emp) => <span className="font-mono text-[var(--text-secondary)]">{emp.checkIn || '09:32 AM'}</span>
    },
    {
      key: 'checkOut',
      header: 'Check-Out',
      render: (emp) => <span className="font-mono text-[var(--text-secondary)]">{emp.checkOut || '06:35 PM'}</span>
    },
    {
      key: 'workingHours',
      header: 'Working Hours',
      render: (emp) => <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{emp.workingHours || '08h 12m'}</span>
    },
    {
      key: 'breakDuration',
      header: 'Break Duration',
      render: (emp) => <span className="font-mono text-[var(--text-secondary)]">{emp.breakDuration || '01h 03m'}</span>
    },
    {
      key: 'leaveBalance',
      header: 'Leave Balance',
      render: (emp) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{emp.leaveBalance || '12 days'}</span>
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (emp) => <span className="text-[var(--text-muted)]">{emp.lastActivity || 'Check-In'}</span>
    },
    {
      key: 'syncStatus',
      header: 'Sync Status',
      render: (emp) => <span className="text-teal-600 dark:text-teal-400 font-bold">{emp.syncStatus || 'Synced'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (emp) => (
        <ActionMenu
          actions={getEmployeeActions(emp as Employee)}
          row={emp}
          buttonLabel="Action ▾"
          ariaLabel={`Actions for ${emp.name}`}
        />
      )
    }
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-5 shadow-sm space-y-4 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Enterprise Workforce Directory</h3>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">{safeEmployees.length.toLocaleString()} Total Records</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Complete workforce directory with instant role controls & shift tracking</p>
        </div>
        <Button icon={<UserPlus size={16} />}>Onboard Employee</Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search 10,000 employees by name, code, email..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] w-full sm:w-auto cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments (10,000)' : d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 text-xs font-medium rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table via DataTable */}
      <div className="w-full max-w-full overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--text-muted)] font-semibold border border-[var(--border-color)] bg-[var(--bg-card)] rounded-md">
            Loading employee workforce directory...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={paginatedEmployees} 
            page={page}
            pageSize={pageSize}
            totalCount={filteredEmployees.length}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onExport={handleExport}
            emptyMessage="No matching employee records found."
          />
        )}
      </div>
    </div>
  );
};
