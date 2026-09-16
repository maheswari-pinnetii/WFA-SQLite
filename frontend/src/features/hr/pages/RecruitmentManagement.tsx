import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Briefcase, Plus, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { recruitmentApi } from '../../../api/endpoints/recruitment.api';

export const RecruitmentManagement: React.FC = () => {
  const [funnel, setFunnel] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddReqOpen, setIsAddReqOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);

  // Forms
  const [newReq, setNewReq] = useState({ title: '', department: '', openings: 1 });
  const [newCandidate, setNewCandidate] = useState({ candidateName: '', candidateEmail: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedReqId) {
      fetchApplications();
    } else {
      setApplications([]);
    }
  }, [selectedReqId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [funnelRes, reqRes] = await Promise.all([
        recruitmentApi.getFunnel(),
        recruitmentApi.getRequisitions()
      ]);
      
      if (funnelRes.success) setFunnel(funnelRes.data);
      if (reqRes.success) {
        setRequisitions(reqRes.data);
        if (reqRes.data.length > 0 && !selectedReqId) {
          setSelectedReqId(reqRes.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await recruitmentApi.getApplications(selectedReqId);
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFunnelCount = (status: string) => {
    const f = funnel.find((x: any) => x.status === status);
    return f ? f.count : 0;
  };

  const handleAddReq = async () => {
    try {
      await recruitmentApi.createRequisition(newReq);
      setIsAddReqOpen(false);
      setNewReq({ title: '', department: '', openings: 1 });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCandidate = async () => {
    if (!selectedReqId) return;
    try {
      await recruitmentApi.createApplication(selectedReqId, newCandidate);
      setIsAddCandidateOpen(false);
      setNewCandidate({ candidateName: '', candidateEmail: '' });
      fetchApplications();
      fetchData(); // Refresh funnel
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Briefcase className="text-amber-400" size={24} />
              Talent Acquisition Pipeline
            </h2>
            <p className="text-sm text-slate-400">
              Manage open requisitions and candidate applications.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsAddReqOpen(true)}>
            <Plus size={16} /> Open Job Requisition
          </Button>
        </div>

        {/* Pipeline Stage Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 border-t-4 border-slate-500">
            <div className="text-xs font-bold text-slate-400">New / Screening</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{getFunnelCount('NEW')}</div>
          </div>
          <div className="glass-panel p-4 border-t-4 border-amber-500">
            <div className="text-xs font-bold text-slate-400">Interviewing</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{getFunnelCount('INTERVIEWING')}</div>
          </div>
          <div className="glass-panel p-4 border-t-4 border-indigo-500">
            <div className="text-xs font-bold text-slate-400">Offers Extended</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{getFunnelCount('OFFERED')}</div>
          </div>
          <div className="glass-panel p-4 border-t-4 border-emerald-500">
            <div className="text-xs font-bold text-slate-400">Hired</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{getFunnelCount('HIRED')}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Requisitions */}
          <div className="w-full lg:w-1/3 space-y-4">
            <h3 className="text-base font-bold text-slate-200">Open Requisitions</h3>
            {loading ? (
              <div className="text-slate-400 text-sm">Loading...</div>
            ) : requisitions.length === 0 ? (
              <div className="text-slate-400 text-sm">No open requisitions.</div>
            ) : (
              requisitions.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`glass-panel p-4 cursor-pointer transition-colors ${
                    selectedReqId === req.id ? 'border-rose-500/50 bg-slate-800/80' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-200">{req.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{req.status}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>{req.department || 'General'}</span>
                    <span>{req.openings} Openings</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Main - Candidates */}
          <div className="w-full lg:w-2/3">
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-200">Active Applicants</h3>
                <Button variant="secondary" size="sm" className="flex items-center gap-1" onClick={() => setIsAddCandidateOpen(true)} disabled={!selectedReqId}>
                  <UserPlus size={14} /> Add Candidate
                </Button>
              </div>

              {!selectedReqId ? (
                <div className="text-center text-slate-400 py-8">Select a requisition to view candidates</div>
              ) : applications.length === 0 ? (
                <div className="text-center text-slate-400 py-8">No candidates applied yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Candidate Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Pipeline Stage</th>
                        <th className="py-3 px-4 text-right">Applied On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {applications.map((cand) => (
                        <tr key={cand.id} className="hover:bg-slate-800/20">
                          <td className="py-3 px-4 font-bold text-slate-100">{cand.candidateName}</td>
                          <td className="py-3 px-4 text-slate-300">{cand.candidateEmail}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
                              {cand.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400">
                            {new Date(cand.appliedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Requisition Modal */}
        {isAddReqOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Open Job Requisition</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newReq.title}
                    onChange={(e) => setNewReq({ ...newReq, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="e.g. Engineering"
                    value={newReq.department}
                    onChange={(e) => setNewReq({ ...newReq, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Number of Openings</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-rose-500 focus:border-rose-500"
                    value={newReq.openings}
                    onChange={(e) => setNewReq({ ...newReq, openings: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsAddReqOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleAddReq} disabled={!newReq.title}>Create Requisition</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Candidate Modal */}
        {isAddCandidateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Add Candidate</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="e.g. John Doe"
                    value={newCandidate.candidateName}
                    onChange={(e) => setNewCandidate({ ...newCandidate, candidateName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="e.g. john@example.com"
                    value={newCandidate.candidateEmail}
                    onChange={(e) => setNewCandidate({ ...newCandidate, candidateEmail: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsAddCandidateOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleAddCandidate} disabled={!newCandidate.candidateName || !newCandidate.candidateEmail}>Add Candidate</Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};
