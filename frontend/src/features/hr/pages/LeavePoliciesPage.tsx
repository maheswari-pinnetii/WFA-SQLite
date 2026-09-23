import React, { useEffect, useState } from 'react';
import { Settings, Plus, Save, Activity } from 'lucide-react';
import { workforceApi } from '../../../api/endpoints/workforce.api';

export const LeavePoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    leaveTypeId: '',
    accrualRate: 1,
    maxCarryOver: 0,
    encashable: false,
    probationEligibility: false
  });
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/leave-policies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setPolicies(json || []);
      }
      
      // Load leave types for the dropdown (Mocking for now to avoid breaking UI if endpoint missing)
      setLeaveTypes([
        { id: 'lt-earned', name: 'Earned Leave' },
        { id: 'lt-sick', name: 'Sick Leave' }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/leave-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...form, leaveTypeId: form.leaveTypeId || 'lt-earned' })
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ leaveTypeId: '', accrualRate: 1, maxCarryOver: 0, encashable: false, probationEligibility: false });
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-rose mb-1">Leave Management Engine</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Settings size={24} className="text-rose-500" />
            Leave Policies & Accruals
          </h1>
          <p className="text-xs text-slate-400">
            Define automated accrual rules, carry-forward limits, and policy eligibilities.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-rose btn-sm flex items-center gap-2">
          <Plus size={14} /> {showForm ? 'Cancel' : 'Create Policy'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border-rose-500/30 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-xs font-bold text-[var(--text-muted)]">Target Leave Type
            <select value={form.leaveTypeId} onChange={e => setForm({...form, leaveTypeId: e.target.value})} className="input mt-1 w-full">
              <option value="">Select Leave Type...</option>
              {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[var(--text-muted)]">Accrual Rate (Days per Month)
            <input required type="number" step="0.5" value={form.accrualRate} onChange={e => setForm({...form, accrualRate: parseFloat(e.target.value)})} className="input mt-1 w-full" />
          </label>
          <label className="text-xs font-bold text-[var(--text-muted)]">Max Carry-Forward (Days)
            <input required type="number" value={form.maxCarryOver} onChange={e => setForm({...form, maxCarryOver: parseInt(e.target.value)})} className="input mt-1 w-full" />
          </label>
          <div className="flex flex-col gap-2 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.encashable} onChange={e => setForm({...form, encashable: e.target.checked})} className="accent-rose-500 w-4 h-4" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Allow Encashment</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.probationEligibility} onChange={e => setForm({...form, probationEligibility: e.target.checked})} className="accent-rose-500 w-4 h-4" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Eligible during probation</span>
            </label>
          </div>
          <button type="submit" className="btn btn-rose md:col-span-2 flex items-center justify-center gap-2 mt-4"><Save size={14} /> Save Policy</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading policies...</p>
        ) : policies.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <Activity size={32} className="mx-auto text-rose-500 mb-2 opacity-50" />
            <p className="text-sm font-bold text-[var(--text-primary)]">No automated leave policies defined.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Leaves will need to be credited manually.</p>
          </div>
        ) : (
          policies.map(policy => (
            <div key={policy.id} className="glass-panel p-6 rounded-2xl border-[var(--border-color)] flex flex-col md:flex-row gap-6 justify-between">
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">{policy.leaveTypeName}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {policy.encashable ? 'Encashable' : 'Not Encashable'} • {policy.probationEligibility ? 'Allowed in Probation' : 'Not allowed in Probation'}
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Accrual Rate</p>
                  <p className="text-lg font-bold text-rose-500">{policy.accrualRate} <span className="text-xs text-[var(--text-primary)]">days / month</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Max Carry-Forward</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{policy.maxCarryOver} <span className="text-xs text-[var(--text-muted)]">days</span></p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

