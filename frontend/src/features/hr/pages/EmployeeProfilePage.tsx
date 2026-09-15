import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../../../api/endpoints/payroll.api';
import { lifecycleApi } from '../../../api/endpoints/lifecycle.api';
import { assetsApi } from '../../../api/endpoints/assets.api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  id: string; name: string; email: string; department: string; designation?: string;
  designationTitle?: string; jobLevelName?: string; costCenterName?: string; locationName?: string;
  managerName?: string; teamLeadName?: string; team?: string; grade?: string; workMode?: string;
  taxRegime?: string; status?: string; joinDate?: string; confirmationDate?: string;
  probationEndDate?: string; dateOfBirth?: string; gender?: string; bloodGroup?: string;
  personalEmail?: string; alternatePhone?: string; currentAddress?: string; permanentAddress?: string;
  avatar?: string; noticePeriodDays?: number;
  bankDetails?: any; taxInfo?: any; emergencyContacts?: any[]; skills?: any[];
  education?: any[]; experience?: any[]; documents?: any[]; statusHistory?: any[];
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'personal',   label: 'Personal',          icon: '👤' },
  { id: 'employment', label: 'Employment',         icon: '💼' },
  { id: 'payroll',    label: 'Payroll',            icon: '💰' },
  { id: 'bank',       label: 'Bank & Tax',         icon: '🏦' },
  { id: 'emergency',  label: 'Emergency Contacts', icon: '🚨' },
  { id: 'skills',     label: 'Skills & Education', icon: '🎓' },
  { id: 'documents',  label: 'Documents',          icon: '📄' },
  { id: 'assets',     label: 'Assets',             icon: '💻' },
  { id: 'history',    label: 'History & Onboarding',icon: '📋' },
];

const WORK_MODES = ['office', 'remote', 'hybrid'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const PROFICIENCY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT'];
const TAX_REGIMES = ['new', 'old'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  INACTIVE: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  PROBATION: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  RESIGNED: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
};

const Field: React.FC<{ label: string; value?: string | number | null; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{label}</span>
    <span className={`text-sm text-[var(--text-primary)] ${mono ? 'font-mono' : ''}`}>
      {value || <span className="text-[var(--text-muted)] italic">—</span>}
    </span>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-semibold text-[var(--role-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
    <span className="flex-1 h-px bg-[var(--role-primary)] opacity-20 rounded-full" />
    {children}
    <span className="flex-1 h-px bg-[var(--role-primary)] opacity-20 rounded-full" />
  </h3>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [editPersonal, setEditPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState<any>({});
  const [newSkill, setNewSkill] = useState({ skillName: '', category: '', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: '' });
  const [newEdu, setNewEdu] = useState({ degree: '', fieldOfStudy: '', institutionName: '', endYear: '' });
  const [newExp, setNewExp] = useState({ companyName: '', designation: '', startDate: '', endDate: '', isCurrent: false });
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', isPrimary: false });
  const [bankForm, setBankForm] = useState<any>({});
  const [taxForm, setTaxForm] = useState<any>({});

  // Phase 11 & 12 States
  const [employeeAssets, setEmployeeAssets] = useState<any[]>([]);
  const [newDocument, setNewDocument] = useState({ documentType: '', documentUrl: '' });
  const [transitionStatus, setTransitionStatus] = useState({ status: 'ACTIVE', reason: '' });
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [isAssignAssetModalOpen, setIsAssignAssetModalOpen] = useState(false);

  // Payroll / Salary Structure
  const { data: salaryStructure, refetch: refetchSalary } = useQuery({
    queryKey: ['employee-salary', id],
    queryFn: () => payrollApi.getSalaryStructure(id!),
    enabled: !!id,
  });

  const saveSalaryMutation = useMutation({
    mutationFn: (baseSalary: number) => payrollApi.setSalaryStructure(id!, { baseSalary }),
    onSuccess: () => {
      showToast('Salary structure updated.');
      refetchSalary();
    },
    onError: () => showToast('Failed to update salary.', 'error')
  });

  const [editSalary, setEditSalary] = useState(false);
  const [baseSalaryInput, setBaseSalaryInput] = useState('');

  const handleSaveSalary = () => {
    saveSalaryMutation.mutate(Number(baseSalaryInput));
    setEditSalary(false);
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/employees/${id}/profile`);
      setEmployee(data.data);
      setPersonalForm(data.data);
      setBankForm(data.data.bankDetails || {});
      setTaxForm(data.data.taxInfo || {});
    } catch {
      showToast('Failed to load employee profile.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Phase 11 & 12 Handlers
  useEffect(() => {
    if (activeTab === 'assets' && id) {
      assetsApi.getAssets({ employeeId: id }).then(res => setEmployeeAssets(res.data || [])).catch(console.error);
    }
  }, [activeTab, id]);

  const fetchAvailableAssets = async () => {
    try {
      const res = await assetsApi.getAssets({ status: 'AVAILABLE' });
      setAllAssets(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleAssignAsset = async () => {
    if (!selectedAssetId || !id) return;
    try {
      await assetsApi.assignAsset(selectedAssetId, id);
      showToast('Asset assigned successfully.');
      setIsAssignAssetModalOpen(false);
      assetsApi.getAssets({ employeeId: id }).then(res => setEmployeeAssets(res.data || []));
    } catch (err) {
      showToast('Failed to assign asset.', 'error');
    }
  };

  const handleReturnAsset = async (assetId: string) => {
    try {
      await assetsApi.returnAsset(assetId, 'GOOD');
      showToast('Asset returned.');
      assetsApi.getAssets({ employeeId: id }).then(res => setEmployeeAssets(res.data || []));
    } catch (err) { showToast('Failed to return asset.', 'error'); }
  };

  const handleAddDocument = async () => {
    if (!id || !newDocument.documentType || !newDocument.documentUrl) return;
    try {
      setSaving(true);
      await lifecycleApi.addDocument(id, newDocument);
      showToast('Document uploaded.');
      setNewDocument({ documentType: '', documentUrl: '' });
      fetchProfile();
    } catch { showToast('Failed to upload document.', 'error'); }
    finally { setSaving(false); }
  };

  const handleTransitionStatus = async () => {
    if (!id || !transitionStatus.status) return;
    try {
      setSaving(true);
      await lifecycleApi.transitionStatus(id, transitionStatus.status, transitionStatus.reason);
      showToast('Status transitioned successfully.');
      setTransitionStatus({ status: 'ACTIVE', reason: '' });
      fetchProfile();
    } catch { showToast('Failed to transition status.', 'error'); }
    finally { setSaving(false); }
  };

  // ─── Save handlers ─────────────────────────────────────────────────────────
  const savePersonal = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/employees/${id}`, personalForm);
      setEditPersonal(false);
      showToast('Personal details updated.');
      fetchProfile();
    } catch { showToast('Failed to save personal details.', 'error'); }
    finally { setSaving(false); }
  };

  const saveBankDetails = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/employees/${id}/bank-details`, bankForm);
      showToast('Bank details updated.');
      fetchProfile();
    } catch { showToast('Failed to save bank details.', 'error'); }
    finally { setSaving(false); }
  };

  const saveTaxInfo = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/employees/${id}/tax-info`, taxForm);
      showToast('Tax info updated.');
      fetchProfile();
    } catch { showToast('Failed to save tax info.', 'error'); }
    finally { setSaving(false); }
  };

  const addSkill = async () => {
    if (!newSkill.skillName) return;
    try {
      await axios.post(`/api/employees/${id}/skills`, { ...newSkill, yearsOfExperience: newSkill.yearsOfExperience ? Number(newSkill.yearsOfExperience) : null });
      setNewSkill({ skillName: '', category: '', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: '' });
      showToast('Skill added.');
      fetchProfile();
    } catch { showToast('Failed to add skill.', 'error'); }
  };

  const removeSkill = async (skillId: string) => {
    try {
      await axios.delete(`/api/employees/${id}/skills/${skillId}`);
      showToast('Skill removed.');
      fetchProfile();
    } catch { showToast('Failed to remove skill.', 'error'); }
  };

  const addEducation = async () => {
    if (!newEdu.degree || !newEdu.institutionName) return;
    try {
      await axios.post(`/api/employees/${id}/education`, { ...newEdu, endYear: newEdu.endYear ? Number(newEdu.endYear) : null });
      setNewEdu({ degree: '', fieldOfStudy: '', institutionName: '', endYear: '' });
      showToast('Education added.');
      fetchProfile();
    } catch { showToast('Failed to add education.', 'error'); }
  };

  const removeEducation = async (eduId: string) => {
    try {
      await axios.delete(`/api/employees/${id}/education/${eduId}`);
      fetchProfile();
    } catch { showToast('Failed to remove education.', 'error'); }
  };

  const addExperience = async () => {
    if (!newExp.companyName || !newExp.startDate) return;
    try {
      await axios.post(`/api/employees/${id}/experience`, newExp);
      setNewExp({ companyName: '', designation: '', startDate: '', endDate: '', isCurrent: false });
      showToast('Experience added.');
      fetchProfile();
    } catch { showToast('Failed to add experience.', 'error'); }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.relationship || !newContact.phone) return;
    try {
      await axios.post(`/api/employees/${id}/emergency-contacts`, newContact);
      setNewContact({ name: '', relationship: '', phone: '', isPrimary: false });
      showToast('Contact added.');
      fetchProfile();
    } catch { showToast('Failed to add contact.', 'error'); }
  };

  const removeContact = async (contactId: string) => {
    try {
      await axios.delete(`/api/employees/${id}/emergency-contacts/${contactId}`);
      fetchProfile();
    } catch { showToast('Failed to remove contact.', 'error'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--role-primary)] border-t-transparent animate-spin" />
    </div>
  );

  if (!employee) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <span className="text-5xl">🔍</span>
      <p className="text-[var(--text-muted)]">Employee not found.</p>
      <button onClick={() => navigate(-1)} className="btn btn-primary text-sm">Go Back</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-full">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>{toast.msg}</div>
      )}

      {/* ── Hero Header ── */}
      <div className="card p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden">
        <div className="absolute inset-0 dashboard-hero opacity-80 pointer-events-none rounded-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
               style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
            {employee.avatar ? <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover rounded-2xl" /> : employee.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{employee.name}</h1>
            <p className="text-sm text-white/70">{employee.designationTitle || employee.designation} • {employee.department}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[employee.status || 'ACTIVE'] || statusColor['ACTIVE']}`}>
                {employee.status || 'ACTIVE'}
              </span>
              {employee.jobLevelName && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80">{employee.jobLevelName}</span>
              )}
              {employee.workMode && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 capitalize">{employee.workMode}</span>
              )}
            </div>
          </div>
        </div>
        <div className="relative ml-auto flex gap-2">
          <button onClick={() => navigate(-1)} className="btn btn-sm text-white/80 border border-white/20 hover:bg-white/10 text-xs">
            ← Back
          </button>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Employee ID', value: employee.id, icon: '🆔' },
          { label: 'Joined', value: employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—', icon: '📅' },
          { label: 'Location', value: employee.locationName || employee.id?.split('-')[0] || '—', icon: '📍' },
          { label: 'Team', value: employee.team || employee.department, icon: '👥' },
        ].map(s => (
          <div key={s.label} className="card p-3 flex gap-3 items-center">
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[120px]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div className="card p-1 flex gap-1 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--role-primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* ─────────── TAB: Personal ─────────── */}
      {activeTab === 'personal' && (
        <div className="card p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <SectionTitle>Personal Information</SectionTitle>
            <button onClick={() => editPersonal ? savePersonal() : setEditPersonal(true)}
              disabled={saving}
              className="btn btn-sm btn-primary text-xs">
              {saving ? 'Saving…' : editPersonal ? '💾 Save' : '✏️ Edit'}
            </button>
          </div>

          {!editPersonal ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <Field label="Full Name" value={employee.name} />
              <Field label="Work Email" value={employee.email} />
              <Field label="Personal Email" value={employee.personalEmail} />
              <Field label="Alternate Phone" value={employee.alternatePhone} />
              <Field label="Date of Birth" value={employee.dateOfBirth} />
              <Field label="Gender" value={employee.gender} />
              <Field label="Blood Group" value={employee.bloodGroup} />
              <Field label="Current Address" value={employee.currentAddress} />
              <Field label="Permanent Address" value={employee.permanentAddress} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text' },
                { key: 'personalEmail', label: 'Personal Email', type: 'email' },
                { key: 'alternatePhone', label: 'Alternate Phone', type: 'text' },
                { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
              ].map(f => (
                <label key={f.key} className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{f.label}</span>
                  <input type={f.type} value={personalForm[f.key] || ''} onChange={e => setPersonalForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" />
                </label>
              ))}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Gender</span>
                <select value={personalForm.gender || ''} onChange={e => setPersonalForm((p: any) => ({ ...p, gender: e.target.value }))}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]">
                  <option value="">Select</option>
                  {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Blood Group</span>
                <select value={personalForm.bloodGroup || ''} onChange={e => setPersonalForm((p: any) => ({ ...p, bloodGroup: e.target.value }))}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]">
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 col-span-full">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Current Address</span>
                <textarea value={personalForm.currentAddress || ''} onChange={e => setPersonalForm((p: any) => ({ ...p, currentAddress: e.target.value }))} rows={2}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] resize-none" />
              </label>
              <label className="flex flex-col gap-1 col-span-full">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Permanent Address</span>
                <textarea value={personalForm.permanentAddress || ''} onChange={e => setPersonalForm((p: any) => ({ ...p, permanentAddress: e.target.value }))} rows={2}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] resize-none" />
              </label>
              <button onClick={() => setEditPersonal(false)} className="btn btn-sm text-xs self-start">Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* ─────────── TAB: Employment ─────────── */}
      {activeTab === 'employment' && (
        <div className="card p-6 flex flex-col gap-6">
          <SectionTitle>Employment Details</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <Field label="Employee ID" value={employee.id} mono />
            <Field label="Department" value={employee.department} />
            <Field label="Designation" value={employee.designationTitle || employee.designation} />
            <Field label="Job Level" value={employee.jobLevelName} />
            <Field label="Grade" value={employee.grade} />
            <Field label="Cost Center" value={employee.costCenterName} />
            <Field label="Location" value={employee.locationName} />
            <Field label="Work Mode" value={employee.workMode} />
            <Field label="Team" value={employee.team} />
            <Field label="Manager" value={employee.managerName} />
            <Field label="Team Lead" value={employee.teamLeadName} />
            <Field label="Join Date" value={employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN') : undefined} />
            <Field label="Probation End" value={employee.probationEndDate ? new Date(employee.probationEndDate).toLocaleDateString('en-IN') : undefined} />
            <Field label="Confirmation Date" value={employee.confirmationDate ? new Date(employee.confirmationDate).toLocaleDateString('en-IN') : undefined} />
            <Field label="Notice Period" value={employee.noticePeriodDays ? `${employee.noticePeriodDays} days` : undefined} />
          </div>
        </div>
      )}

      {/* ─────────── TAB: Payroll ─────────── */}
      {activeTab === 'payroll' && (
        <div className="card p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <SectionTitle>Salary Structure</SectionTitle>
            {!editSalary ? (
              <button onClick={() => {
                setBaseSalaryInput(salaryStructure?.baseSalary?.toString() || '0');
                setEditSalary(true);
              }} className="btn btn-sm btn-primary text-xs">
                Edit Structure
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditSalary(false)} className="btn btn-sm text-xs">Cancel</button>
                <button onClick={handleSaveSalary} disabled={saveSalaryMutation.isPending} className="btn btn-sm btn-primary text-xs">
                  {saveSalaryMutation.isPending ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            )}
          </div>

          {!editSalary ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <Field label="Annual Base Salary (CTC)" value={salaryStructure?.baseSalary ? `$${salaryStructure.baseSalary.toLocaleString()}` : 'Not set'} mono />
              <Field label="Monthly Base" value={salaryStructure?.baseSalary ? `$${(salaryStructure.baseSalary / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'} mono />
              <Field label="Currency" value={salaryStructure?.currency || 'USD'} />
              <Field label="Effective Date" value={salaryStructure?.effectiveDate ? new Date(salaryStructure.effectiveDate).toLocaleDateString() : '—'} />
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-sm">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Annual Base Salary (CTC)</span>
                <input
                  type="number"
                  value={baseSalaryInput}
                  onChange={(e) => setBaseSalaryInput(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="e.g. 75000"
                />
              </label>
            </div>
          )}

          {salaryStructure?.components && salaryStructure.components.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Components Breakdown</h4>
              <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                  <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                    <tr>
                      <th className="py-2 px-3">Component Name</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 text-right">Amount (Monthly)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {salaryStructure.components.map((c: any) => (
                      <tr key={c.id}>
                        <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{c.componentName}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.type === 'EARNING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">${c.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────── TAB: Bank & Tax ─────────── */}
      {activeTab === 'bank' && (
        <div className="flex flex-col gap-4">
          {/* Bank Details Card */}
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SectionTitle>Bank Details</SectionTitle>
              <button onClick={saveBankDetails} disabled={saving} className="btn btn-sm btn-primary text-xs">
                {saving ? 'Saving…' : '💾 Save'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'accountHolderName', label: 'Account Holder Name' },
                { key: 'accountNumber', label: 'Account Number' },
                { key: 'ifscCode', label: 'IFSC Code' },
                { key: 'bankName', label: 'Bank Name' },
                { key: 'branchName', label: 'Branch Name' },
              ].map(f => (
                <label key={f.key} className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{f.label}</span>
                  <input value={bankForm[f.key] || ''} onChange={e => setBankForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" />
                </label>
              ))}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Account Type</span>
                <select value={bankForm.accountType || 'SAVINGS'} onChange={e => setBankForm((p: any) => ({ ...p, accountType: e.target.value }))}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]">
                  {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>
          </div>

          {/* Tax Info Card */}
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SectionTitle>Tax & Statutory Information</SectionTitle>
              <button onClick={saveTaxInfo} disabled={saving} className="btn btn-sm btn-primary text-xs">
                {saving ? 'Saving…' : '💾 Save'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'panNumber', label: 'PAN Number' },
                { key: 'aadhaarReference', label: 'Aadhaar Reference' },
                { key: 'pfAccountNumber', label: 'PF Account Number' },
                { key: 'esiNumber', label: 'ESI Number' },
              ].map(f => (
                <label key={f.key} className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{f.label}</span>
                  <input value={taxForm[f.key] || ''} onChange={e => setTaxForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] font-mono focus:outline-none" />
                </label>
              ))}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Tax Regime</span>
                <select value={taxForm.taxRegime || 'new'} onChange={e => setTaxForm((p: any) => ({ ...p, taxRegime: e.target.value }))}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]">
                  {TAX_REGIMES.map(r => <option key={r} value={r}>{r === 'new' ? 'New Regime (Default)' : 'Old Regime'}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!taxForm.ptExempt} onChange={e => setTaxForm((p: any) => ({ ...p, ptExempt: e.target.checked }))}
                  className="w-4 h-4 accent-[var(--role-primary)]" />
                <span className="text-sm text-[var(--text-secondary)]">PT Exempt</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ─────────── TAB: Emergency Contacts ─────────── */}
      {activeTab === 'emergency' && (
        <div className="card p-6 flex flex-col gap-5">
          <SectionTitle>Emergency Contacts</SectionTitle>
          {/* Existing contacts */}
          {(employee.emergencyContacts || []).length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">No emergency contacts added yet.</p>
          )}
          <div className="flex flex-col gap-3">
            {(employee.emergencyContacts || []).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--role-light)', color: 'var(--role-primary)' }}>
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{c.name}
                      {c.isPrimary ? <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-[var(--role-primary)] text-white">Primary</span> : null}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{c.relationship} • {c.phone}</p>
                  </div>
                </div>
                <button onClick={() => removeContact(c.id)} className="text-[var(--text-muted)] hover:text-rose-400 transition-colors text-lg">✕</button>
              </div>
            ))}
          </div>

          {/* Add new contact */}
          <div className="border-t border-[var(--border-color)] pt-4">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-3">Add Contact</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'name', placeholder: 'Full Name' },
                { key: 'relationship', placeholder: 'Relationship' },
                { key: 'phone', placeholder: 'Phone' },
              ].map(f => (
                <input key={f.key} placeholder={f.placeholder} value={(newContact as any)[f.key]}
                  onChange={e => setNewContact((p: any) => ({ ...p, [f.key]: e.target.value }))}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              ))}
              <button onClick={addContact} className="btn btn-sm btn-primary text-xs">+ Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────── TAB: Skills & Education ─────────── */}
      {activeTab === 'skills' && (
        <div className="flex flex-col gap-4">
          {/* Skills */}
          <div className="card p-6 flex flex-col gap-4">
            <SectionTitle>Skills</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {(employee.skills || []).map((s: any) => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
                     style={{ background: 'var(--role-light)', color: 'var(--role-text)', borderColor: 'var(--role-border)' }}>
                  <span>{s.skillName}</span>
                  {s.proficiencyLevel && <span className="opacity-60">• {s.proficiencyLevel.toLowerCase()}</span>}
                  <button onClick={() => removeSkill(s.id)} className="opacity-50 hover:opacity-100">✕</button>
                </div>
              ))}
              {(employee.skills || []).length === 0 && <p className="text-sm text-[var(--text-muted)]">No skills added yet.</p>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-color)]">
              <input placeholder="Skill name" value={newSkill.skillName} onChange={e => setNewSkill(p => ({ ...p, skillName: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <input placeholder="Category (e.g. Frontend)" value={newSkill.category} onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <select value={newSkill.proficiencyLevel} onChange={e => setNewSkill(p => ({ ...p, proficiencyLevel: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]">
                {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={addSkill} className="btn btn-sm btn-primary text-xs">+ Add Skill</button>
            </div>
          </div>

          {/* Education */}
          <div className="card p-6 flex flex-col gap-4">
            <SectionTitle>Education</SectionTitle>
            {(employee.education || []).map((e: any) => (
              <div key={e.id} className="flex items-start justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{e.degree} {e.fieldOfStudy ? `in ${e.fieldOfStudy}` : ''}</p>
                  <p className="text-xs text-[var(--text-muted)]">{e.institutionName} {e.endYear ? `• ${e.endYear}` : ''}</p>
                </div>
                <button onClick={() => removeEducation(e.id)} className="text-[var(--text-muted)] hover:text-rose-400 text-sm">✕</button>
              </div>
            ))}
            {(employee.education || []).length === 0 && <p className="text-sm text-[var(--text-muted)]">No education records.</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-color)]">
              <input placeholder="Degree (e.g. B.Tech)" value={newEdu.degree} onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <input placeholder="Field of Study" value={newEdu.fieldOfStudy} onChange={e => setNewEdu(p => ({ ...p, fieldOfStudy: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <input placeholder="Institution Name" value={newEdu.institutionName} onChange={e => setNewEdu(p => ({ ...p, institutionName: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <input placeholder="End Year" value={newEdu.endYear} onChange={e => setNewEdu(p => ({ ...p, endYear: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <button onClick={addEducation} className="btn btn-sm btn-primary text-xs col-span-full md:col-span-1">+ Add Education</button>
            </div>
          </div>

          {/* Experience */}
          <div className="card p-6 flex flex-col gap-4">
            <SectionTitle>Work Experience</SectionTitle>
            {(employee.experience || []).map((e: any) => (
              <div key={e.id} className="flex items-start justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{e.designation || 'N/A'} @ {e.companyName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{e.startDate} → {e.isCurrent ? 'Present' : (e.endDate || 'N/A')}</p>
                </div>
              </div>
            ))}
            {(employee.experience || []).length === 0 && <p className="text-sm text-[var(--text-muted)]">No experience records.</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-color)]">
              <input placeholder="Company Name" value={newExp.companyName} onChange={e => setNewExp(p => ({ ...p, companyName: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <input placeholder="Designation" value={newExp.designation} onChange={e => setNewExp(p => ({ ...p, designation: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <input type="date" placeholder="Start Date" value={newExp.startDate} onChange={e => setNewExp(p => ({ ...p, startDate: e.target.value }))}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
              <button onClick={addExperience} className="btn btn-sm btn-primary text-xs">+ Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────── TAB: Documents ─────────── */}
      {activeTab === 'documents' && (
        <div className="card p-6 flex flex-col gap-4">
          <SectionTitle>Documents</SectionTitle>
          <div className="flex gap-2">
            <input 
              placeholder="Document Type (e.g., ID Proof)" 
              value={newDocument.documentType} 
              onChange={e => setNewDocument(p => ({ ...p, documentType: e.target.value }))}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" 
            />
            <input 
              placeholder="Document URL" 
              value={newDocument.documentUrl} 
              onChange={e => setNewDocument(p => ({ ...p, documentUrl: e.target.value }))}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" 
            />
            <button onClick={handleAddDocument} disabled={saving} className="btn btn-sm btn-primary text-xs">Upload</button>
          </div>

          {(employee.documents || []).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📄</p>
              <p className="text-sm text-[var(--text-muted)]">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              {(employee.documents || []).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📎</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{d.documentType}</p>
                      <p className="text-xs text-[var(--text-muted)]">{new Date(d.uploadedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <a href={d.documentUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--role-primary)] text-xs hover:underline">View</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────── TAB: Assets ─────────── */}
      {activeTab === 'assets' && (
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <SectionTitle>Assigned Assets</SectionTitle>
            <button onClick={() => { fetchAvailableAssets(); setIsAssignAssetModalOpen(true); }} className="btn btn-sm btn-primary text-xs">Assign Asset</button>
          </div>
          
          {employeeAssets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">💻</p>
              <p className="text-sm text-[var(--text-muted)]">No assets currently assigned to this employee.</p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm">
                <thead className="text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
                  <tr>
                    <th className="py-2 px-3 font-medium">Tag</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium">Status</th>
                    <th className="py-2 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {employeeAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-[var(--bg-tertiary)]">
                      <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{asset.assetTag}</td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">{asset.assetType}</td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">{asset.status}</td>
                      <td className="py-2 px-3 text-right">
                        {asset.status === 'ASSIGNED' && (
                          <button onClick={() => handleReturnAsset(asset.id)} className="text-rose-500 text-xs hover:underline">Return</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Assign Asset Modal */}
          {isAssignAssetModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-xl w-full max-w-sm">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Assign Asset</h3>
                <div className="space-y-4">
                  <select 
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md p-2 text-[var(--text-primary)]"
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                  >
                    <option value="">Select an available asset...</option>
                    {allAssets.map(a => <option key={a.id} value={a.id}>{a.assetTag} - {a.assetType}</option>)}
                  </select>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setIsAssignAssetModalOpen(false)} className="btn btn-sm text-xs">Cancel</button>
                    <button onClick={handleAssignAsset} disabled={!selectedAssetId} className="btn btn-sm btn-primary text-xs">Assign</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────── TAB: History & Onboarding ─────────── */}
      {activeTab === 'history' && (
        <div className="card p-6 flex flex-col gap-6">
          
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-xl border border-[var(--border-color)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Transition Status / Onboarding</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)]"
                value={transitionStatus.status}
                onChange={e => setTransitionStatus(p => ({ ...p, status: e.target.value }))}
              >
                <option value="ONBOARDING">ONBOARDING</option>
                <option value="PROBATION">PROBATION</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="RESIGNED">RESIGNED</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
              <input 
                placeholder="Reason (Optional)" 
                value={transitionStatus.reason} 
                onChange={e => setTransitionStatus(p => ({ ...p, reason: e.target.value }))}
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-2 text-sm text-[var(--text-primary)]" 
              />
              <button onClick={handleTransitionStatus} disabled={saving} className="btn btn-sm btn-primary text-xs">Update Status</button>
            </div>
          </div>

          <div>
            <SectionTitle>Employment History</SectionTitle>
            {(employee.statusHistory || []).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">No status history available.</p>
            ) : (
              <div className="relative pl-6 flex flex-col gap-4 mt-4">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[var(--border-color)]" />
                {(employee.statusHistory || []).map((h: any, i: number) => (
                  <div key={h.id || i} className="relative">
                    <div className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-[var(--role-primary)] bg-[var(--bg-card)]" />
                    <p className="text-xs text-[var(--text-muted)]">{new Date(h.effectiveDate).toLocaleDateString('en-IN')}</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{h.status}</p>
                    {h.reason && <p className="text-xs text-[var(--text-muted)]">{h.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfilePage;
