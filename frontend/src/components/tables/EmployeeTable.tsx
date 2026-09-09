import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { fetchEmployeesThunk, updateEmployeeStatusThunk } from '../../features/hr/store/hrSlice';
import { Employee } from '../../shared/types/common.types';
import { getRoleBadgeClass, formatDate } from '../../shared/utils/helpers';
import { Search, ChevronLeft, ChevronRight, UserPlus, Filter, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { useDepartmentAccess } from '../../hooks/useDepartmentAccess';
import { StatusBadge } from '../common/StatusBadge';

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
  const { employees, isLoading } = useSelector((state: RootState) => state.hr);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  const handleStatusChange = (id: string, status: Employee['status']) => {
    dispatch(updateEmployeeStatusThunk({ id, status }));
  };

  const { canAccessDepartment } = useDepartmentAccess();

  const filteredEmployees = employees.filter((emp) => {
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm space-y-4 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Enterprise Workforce Directory</h3>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">{employees.length.toLocaleString()} Total Records</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Complete workforce directory with instant role controls & shift tracking</p>
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
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
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
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 w-full sm:w-auto cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments (10,000)' : d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-full max-w-full min-w-0">
        <table className="w-full text-left text-sm min-w-[1600px]">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4 w-[110px]">Employee ID</th>
              <th className="py-3 px-4 w-[180px]">Employee Name</th>
              <th className="py-3 px-4 w-[120px]">Joining Date</th>
              <th className="py-3 px-4 w-[150px]">Employment Status</th>
              <th className="py-3 px-4 w-[120px]">Tenure</th>
              <th className="py-3 px-4 w-[140px]">Department</th>
              <th className="py-3 px-4 w-[120px]">Team</th>
              <th className="py-3 px-4 w-[130px]">Manager</th>
              <th className="py-3 px-4 w-[130px]">Team Lead</th>
              <th className="py-3 px-4 w-[100px]">Location</th>
              <th className="py-3 px-4 w-[140px]">Attendance Status</th>
              <th className="py-3 px-4 w-[130px]">Shift Timings</th>
              <th className="py-3 px-4 w-[100px]">Check-In</th>
              <th className="py-3 px-4 w-[100px]">Check-Out</th>
              <th className="py-3 px-4 w-[110px]">Working Hours</th>
              <th className="py-3 px-4 w-[110px]">Break Duration</th>
              <th className="py-3 px-4 w-[110px]">Leave Balance</th>
              <th className="py-3 px-4 w-[120px]">Last Activity</th>
              <th className="py-3 px-4 w-[100px]">Sync Status</th>
              <th className="py-3 px-4 w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={20} className="px-5 py-8 text-center text-[var(--text-muted)] font-semibold">Loading employee workforce directory...</td>
              </tr>
            ) : paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={20} className="px-5 py-8 text-center text-[var(--text-muted)]">
                  No matching employee records found.
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => {
                const tenure = (() => {
                  if (!emp.joinDate) return 'N/A';
                  const joinDate = new Date(emp.joinDate);
                  const now = new Date();
                  if (isNaN(joinDate.getTime()) || joinDate > now) return '0 days';
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
                  return parts.slice(0, 2).join(' ');
                })();

                const formattedJoinDate = (() => {
                  if (!emp.joinDate) return 'N/A';
                  const dateObj = new Date(emp.joinDate);
                  if (isNaN(dateObj.getTime())) return emp.joinDate;
                  const day = String(dateObj.getDate()).padStart(2, '0');
                  const month = dateObj.toLocaleString('en-US', { month: 'short' });
                  const year = dateObj.getFullYear();
                  return `${day} ${month} ${year}`;
                })();

                return (
                  <tr key={emp.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--text-secondary)]">
                      {emp.employeeCode || emp.code || 'EMP-1000'}
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                      <div>
                        <div>{emp.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-semibold">{emp.designation || 'Specialist'}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] font-medium">
                      {formattedJoinDate}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={emp.status}
                        onChange={(e) => handleStatusChange(emp.id, e.target.value as Employee['status'])}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="ON_LEAVE">ON_LEAVE</option>
                        <option value="TERMINATED">Terminated</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {tenure}
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                      {emp.department}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {emp.team || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {(emp as any).manager || 'Priya Sharma'}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {(emp as any).teamLead || 'Arjun Reddy'}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] font-semibold">
                      {emp.location || 'HQ'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={(emp as any).attendance_status || 'PRESENT'} />
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-secondary)] font-semibold">
                      {(emp as any).shiftTiming || (emp as any).shift || '09:00 - 18:00 (GS)'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">
                      {(emp as any).checkIn || '09:32 AM'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">
                      {(emp as any).checkOut || '06:35 PM'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {(emp as any).workingHours || '08h 12m'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">
                      {(emp as any).breakDuration || '01h 03m'}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {(emp as any).leaveBalance || '12 days'}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {(emp as any).lastActivity || 'Check-In'}
                    </td>
                    <td className="py-3 px-4 text-teal-600 dark:text-teal-400 font-bold">
                      {(emp as any).syncStatus || 'Synced'}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-extrabold text-[11px]">View</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Advanced Pagination Controls for 10,000 Records */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-400 pt-2">
          <span>
            Showing <strong className="text-[var(--text-primary)]">{((page - 1) * pageSize) + 1}</strong> to{' '}
            <strong className="text-[var(--text-primary)]">{Math.min(page * pageSize, filteredEmployees.length).toLocaleString()}</strong> of{' '}
            <strong className="text-[var(--text-primary)]">{filteredEmployees.length.toLocaleString()}</strong> records
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-medium text-xs text-slate-700 dark:text-slate-300 px-3">
              Page {page.toLocaleString()} of {totalPages.toLocaleString()}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
