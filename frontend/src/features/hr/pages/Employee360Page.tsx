import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { lifecycleApi } from '../../../api/endpoints/lifecycle.api';
import {
  User as UserIcon,
  Briefcase,
  Clock,
  Calendar,
  CreditCard,
  Activity,
  FileText,
  MapPin,
  Mail,
  Building2,
  ChevronLeft,
  UploadCloud,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { Skeleton } from '../../../components/common/Skeleton';
import { ErrorState } from '../../../components/common/ErrorState';
import { formatDate } from '../../../shared/utils/helpers';
import { getRoleBadgeClass } from '../../../shared/utils/helpers';
import { DataTable } from '../../../shared/components/DataTable';

export const Employee360Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data360, setData360] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'employment' | 'attendance' | 'leave' | 'payroll' | 'documents' | 'activity' | 'lifecycle'>('overview');

  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [lifecycleDocs, setLifecycleDocs] = useState<any[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [statusReason, setStatusReason] = useState('');
  const [statusDate, setStatusDate] = useState(new Date().toISOString().split('T')[0]);
  const [docType, setDocType] = useState('OFFER_LETTER');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    const fetch360 = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("Employee ID is missing.");
        const data = await employeeApi.getEmployee360(id);
        setData360(data);
        const [history, docs] = await Promise.all([
          lifecycleApi.getStatusHistory(id),
          lifecycleApi.getDocuments(id)
        ]);
        setStatusHistory(history);
        setLifecycleDocs(docs);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch360();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="flex gap-6">
          <Skeleton className="h-96 w-64 rounded-2xl shrink-0" />
          <Skeleton className="h-96 flex-1 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data360?.profile) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Profile Not Found"
          message={error?.message || "Unable to load the Employee 360 profile. You might not have permission."}
          onRetry={() => navigate(-1)}
        />
      </div>
    );
  }

  const { profile, attendance, leaves, auditLogs, documents, salary } = data360;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <UserIcon size={16} /> },
    { id: 'employment', label: 'Employment', icon: <Briefcase size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <Clock size={16} /> },
    { id: 'leave', label: 'Leave', icon: <Calendar size={16} /> },
  ];

  if (salary || ['ADMIN', 'HR'].includes(user?.role || '')) {
    tabs.push({ id: 'payroll', label: 'Salary & Payroll', icon: <CreditCard size={16} /> });
  }

  tabs.push({ id: 'documents', label: 'Documents', icon: <FileText size={16} /> });
  
  if (['ADMIN', 'HR'].includes(user?.role || '')) {
    tabs.push({ id: 'lifecycle', label: 'Lifecycle', icon: <RefreshCcw size={16} /> });
  }
  
  tabs.push({ id: 'activity', label: 'Activity Log', icon: <Activity size={16} /> });

  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await lifecycleApi.transitionStatus(id, { status: newStatus, reason: statusReason, effectiveDate: statusDate });
      const history = await lifecycleApi.getStatusHistory(id);
      setStatusHistory(history);
      setShowStatusModal(false);
      setData360({ ...data360, profile: { ...data360.profile, status: newStatus, employment_status: newStatus } });
      if (newStatus === 'RESIGNATION' || newStatus === 'TERMINATED') {
        const confirmFnF = window.confirm('Would you like to initiate the Full & Final (F&F) settlement now?');
        if (confirmFnF) {
          navigate(`/hr/payroll/fnf?employeeId=${id}`);
        }
      }
    } catch (err) {
      console.error('Failed to transition status:', err);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await lifecycleApi.uploadDocument(id, { documentType: docType, documentUrl: docUrl });
      const docs = await lifecycleApi.getDocuments(id);
      setLifecycleDocs(docs);
      setShowUploadModal(false);
      setDocUrl('');
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold">Personal Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                  <p className="font-semibold text-sm">{profile.email}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                  <p className="font-semibold text-sm">{profile.location || 'Not Specified'}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Joining Date</p>
                  <p className="font-semibold text-sm">{formatDate(profile.joinDate || profile.joining_date)}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                  <p className="font-semibold text-sm">{profile.department}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'employment':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold">Employment Details</h3>
            <div className="glass-panel p-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-slate-400">Employee Code</span>
                <span className="font-mono font-bold">{profile.employeeCode || profile.id}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-slate-400">Designation</span>
                <span className="font-bold">{profile.designation || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-slate-400">Team</span>
                <span className="font-bold">{profile.team || '—'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-400">Reporting Manager</span>
                <span className="font-bold">{profile.manager_name || '—'}</span>
              </div>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold">Recent Attendance (Last 30 Days)</h3>
            <DataTable 
              data={attendance || []}
              columns={[
                { header: 'Date', cell: (row: any) => formatDate(row.date) },
                { header: 'Check In', accessorKey: 'checkInTime' },
                { header: 'Check Out', accessorKey: 'checkOutTime' },
                { header: 'Status', accessorKey: 'status' }
              ]}
            />
          </div>
        );
      case 'leave':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold">Leave History</h3>
            <DataTable 
              data={leaves || []}
              columns={[
                { header: 'Type', accessorKey: 'type' },
                { header: 'Start Date', cell: (row: any) => formatDate(row.startDate) },
                { header: 'End Date', cell: (row: any) => formatDate(row.endDate) },
                { header: 'Status', accessorKey: 'status' }
              ]}
            />
          </div>
        );
      case 'payroll':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-emerald-500">Salary & Compensation</h3>
            {salary ? (
              <div className="glass-panel p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Base Salary</p>
                  <p className="text-2xl font-black">${salary.baseSalary?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Effective Date</p>
                  <p className="text-lg font-bold">{formatDate(salary.effectiveDate)}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No salary information on file or access is restricted.</p>
            )}
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Employee Documents</h3>
              {['ADMIN', 'HR'].includes(user?.role || '') && (
                <button onClick={() => setShowUploadModal(true)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-2 text-xs font-medium">
                  <UploadCloud size={14} /> Upload
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Lifecycle & HR Documents</h4>
              {lifecycleDocs.length > 0 ? (
                <div className="space-y-2">
                  {lifecycleDocs.map((doc: any, i: number) => (
                    <div key={i} className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm flex items-center gap-2"><FileText size={16} className="text-emerald-500"/> {doc.documentType.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-400">Uploaded on {formatDate(doc.uploadedAt)}</span>
                      </div>
                      <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View</a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No lifecycle documents found.</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">System Documents</h4>
              {(documents && documents.length > 0) ? (
                <div className="space-y-2">
                  {documents.map((doc: any, i: number) => (
                    <div key={i} className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                      <span className="font-bold text-sm flex items-center gap-2"><FileText size={16} className="text-slate-500"/> {doc.title}</span>
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View</a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No system documents found.</p>
              )}
            </div>
          </div>
        );
      case 'lifecycle':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Lifecycle History</h3>
              <button onClick={() => setShowStatusModal(true)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-2 text-xs font-medium">
                <ArrowRight size={14} /> Transition Status
              </button>
            </div>
            <div className="relative border-l border-[var(--border-color)] ml-3 pl-6 space-y-6">
              {statusHistory.length > 0 ? (
                statusHistory.map((sh, i) => (
                  <div key={sh.id} className="relative">
                    <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[1.9rem] top-1 border-2 border-[var(--bg-primary)]"></div>
                    <p className="text-xs text-slate-400 mb-1">{formatDate(sh.effectiveDate)}</p>
                    <div className="bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-color)] inline-block min-w-[250px]">
                      <p className="font-bold text-sm text-[var(--text-primary)]">{sh.status}</p>
                      {sh.reason && <p className="text-xs text-slate-500 mt-1">{sh.reason}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No status history available.</p>
              )}
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold">Audit & Activity Log</h3>
            <DataTable 
              data={auditLogs || []}
              columns={[
                { header: 'Date', cell: (row: any) => new Date(row.timestamp).toLocaleString() },
                { header: 'Action', accessorKey: 'action' },
                { header: 'Details', accessorKey: 'details' }
              ]}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Employee 360</h2>
          <p className="text-xs text-slate-400">Complete workforce personnel record</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar (Profile Card & Navigation) */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          
          {/* Profile Card */}
          <div className="glass-panel p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />
            <img 
              src={profile.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
              alt={profile.name}
              className="w-24 h-24 rounded-full border-4 border-[var(--bg-secondary)] shadow-xl mx-auto relative z-10 object-cover"
            />
            <div className="relative z-10 space-y-1">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{profile.name}</h3>
              <p className="text-xs font-semibold text-emerald-500">{profile.designation || 'Employee'}</p>
              <div className="flex justify-center pt-2">
                <span className={`badge ${getRoleBadgeClass(profile.employment_status || profile.status || 'Active')}`}>
                  {profile.employment_status || profile.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Vertical Navigation Tabs */}
          <div className="glass-panel p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'text-slate-400 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="glass-panel p-6 min-h-[500px]">
            {renderTabContent()}
          </div>
        </div>

      </div>

      {/* Modals */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h2 className="text-base font-bold flex items-center gap-2"><RefreshCcw size={18} className="text-emerald-500" /> Transition Lifecycle Status</h2>
            <form onSubmit={handleStatusTransition} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="PROBATION">Probation</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROMOTION">Promoted</option>
                  <option value="TRANSFER">Transferred</option>
                  <option value="RESIGNATION">Resigned</option>
                  <option value="TERMINATED">Terminated</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Effective Date</label>
                <input type="date" required value={statusDate} onChange={e => setStatusDate(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Reason / Notes</label>
                <textarea rows={2} required value={statusReason} onChange={e => setStatusReason(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowStatusModal(false)} className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h2 className="text-base font-bold flex items-center gap-2"><UploadCloud size={18} className="text-emerald-500" /> Upload Document</h2>
            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Document Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="OFFER_LETTER">Offer Letter</option>
                  <option value="CONFIRMATION_LETTER">Confirmation Letter</option>
                  <option value="PROMOTION_LETTER">Promotion Letter</option>
                  <option value="RESIGNATION_LETTER">Resignation Letter</option>
                  <option value="EXPERIENCE_LETTER">Experience Letter</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Document URL</label>
                <input type="url" required placeholder="https://example.com/doc.pdf" value={docUrl} onChange={e => setDocUrl(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
