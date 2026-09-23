import React, { useState } from 'react';
import { TrendingUp, Search, Briefcase, DollarSign } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const PromotionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <TrendingUp className="text-emerald-500" />
            Promotions & Designations
          </h1>
          <p className="text-slate-400 mt-1">Manage employee promotions, job level changes, and trigger salary revisions.</p>
        </div>
      </div>

      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-lg p-2 px-4 focus-within:border-emerald-500 transition-colors">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search employee by name or ID to initiate promotion..."
            className="bg-transparent border-none outline-none text-sm text-slate-200 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm && (
          <div className="animate-fadeIn space-y-6 border-t border-slate-800 pt-6">
            <h3 className="text-lg font-semibold text-slate-200">Promotion Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  Current Profile
                </h4>
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-500 block">Designation</label>
                    <div className="text-sm text-slate-300 font-medium">Software Engineer I</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Job Level</label>
                    <div className="text-sm text-slate-300 font-medium">L2</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Current Salary (CTC)</label>
                    <div className="text-sm text-slate-300 font-medium">$85,000</div>
                  </div>
                </div>
              </div>

              {/* Proposed Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                  New Profile
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Briefcase size={12}/> New Designation</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" placeholder="e.g. Software Engineer II" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">New Job Level</label>
                      <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none">
                        <option>L3</option>
                        <option>L4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5"><DollarSign size={12}/> Proposed CTC</label>
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" placeholder="100000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Effective Date</label>
                    <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setSearchTerm('')}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent">
                Submit Promotion
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
