import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { DataTable, Column } from '../../../shared/components/DataTable';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { Employee } from '../../../shared/types/common.types';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOnboarding = async () => {
    setIsLoading(true);
    try {
      // Pending tab will fetch employees in onboarding phase. Completed will fetch active ones who joined recently (mock implementation).
      const res = await employeeApi.getEmployees({ 
        lifecycleStage: activeTab === 'pending' ? 'ONBOARDING' : 'ALL',
        page,
        pageSize
      });
      // Mock filtering for active tab if lifecycleStage mapping isn't fully robust
      let filtered = res.employees || res;
      if (activeTab === 'completed') {
        filtered = filtered.filter((e: Employee) => e.status === 'ACTIVE');
      } else {
        // If the backend didn't filter, we filter locally as a fallback
        filtered = filtered.filter((e: Employee) => e.status !== 'ACTIVE' && e.status !== 'TERMINATED');
        if (filtered.length === 0) {
           // mock data if empty for demo
           filtered = [
             { id: 'emp-1001', name: 'John Doe', role: 'EMPLOYEE', designation: 'Software Engineer', joining_date: '2026-10-01', status: 'ONBOARDING', employeeCode: 'EMP-1001', department: 'Engineering' } as any
           ];
        }
      }
      setEmployees(filtered);
      setTotalItems(res.pagination?.totalItems || filtered.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboarding();
  }, [activeTab, page, pageSize]);

  const columns: Column<Employee>[] = [
    {
      header: 'Employee',
      accessorKey: 'name',
      render: (emp) => (
        <div>
          <div className="font-medium text-[var(--text-primary)]">{emp.name}</div>
          <div className="text-xs text-slate-400">{emp.employeeCode || emp.id}</div>
        </div>
      )
    },
    {
      header: 'Role / Designation',
      accessorKey: 'designation',
      render: (emp) => <span className="text-sm text-slate-300">{emp.designation || emp.role}</span>
    },
    {
      header: 'Join Date',
      accessorKey: 'joining_date',
      render: (emp) => <span className="text-sm text-slate-300">{emp.joining_date}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (emp) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-max">
          <Clock size={12} /> {emp.status || 'Documents Pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      render: (emp) => (
        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => navigate(`/employee-details/${emp.id}`)}>
          View Checklist
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <Users className="text-emerald-500" />
            Employee Onboarding
          </h1>
          <p className="text-slate-400 mt-1">Manage new hires, document collection, and orientation schedules.</p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText size={16} /> Generate Onboarding Report
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Onboarding
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      <DataTable
        data={employees}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalCount={totalItems}
        onPageChange={setPage}
        searchPlaceholder="Search employees..."
        emptyMessage={activeTab === 'completed' ? 'No completed onboardings found.' : 'No pending onboardings found.'}
      />
    </div>
  );
};


