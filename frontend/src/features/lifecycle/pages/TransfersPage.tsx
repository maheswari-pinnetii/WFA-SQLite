import React, { useState } from 'react';
import { ArrowRightLeft, Search, Building2, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const TransfersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <ArrowRightLeft className="text-purple-500" />
            Internal Transfers
          </h1>
          <p className="text-slate-400 mt-1">Initiate and track employee department, team, or location transfers.</p>
        </div>
      </div>

      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-lg p-2 px-4 focus-within:border-purple-500 transition-colors">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search employee by name or ID to initiate transfer..."
            className="bg-transparent border-none outline-none text-sm text-slate-200 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm && (
          <div className="animate-fadeIn space-y-6 border-t border-slate-800 pt-6">
            <h3 className="text-lg font-semibold text-slate-200">Transfer Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  Current Assignment
                </h4>
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-500 block">Department</label>
                    <div className="text-sm text-slate-300 font-medium">Engineering</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Team</label>
                    <div className="text-sm text-slate-300 font-medium">Frontend Core</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Location</label>
                    <div className="text-sm text-slate-300 font-medium">New York Office</div>
                  </div>
                </div>
              </div>

              {/* Proposed Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
                  New Assignment
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Building2 size={12}/> New Department</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-purple-500 outline-none">
                      <option value="">Select Department...</option>
                      <option>Product</option>
                      <option>Engineering</option>
                      <option>Design</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5"><MapPin size={12}/> New Location</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-purple-500 outline-none">
                      <option value="">Select Location...</option>
                      <option>San Francisco HQ</option>
                      <option>London Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Effective Date</label>
                    <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-purple-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setSearchTerm('')}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white border-transparent">
                Submit Transfer Request
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
