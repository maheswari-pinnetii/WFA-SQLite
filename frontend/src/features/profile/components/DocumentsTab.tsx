import React from 'react';
import { FileText, Download } from 'lucide-react';

export const DocumentsTab: React.FC = () => {
{/* Tab 4: Documents */}
        return (
          <div className="space-y-2 text-xs animate-fadeIn">
            {[
              { name: 'Employment Offer Letter & Contract.pdf', size: '2.4 MB' },
              { name: 'Q1 Performance Appraisal Review.pdf', size: '1.1 MB' },
              { name: 'Non-Disclosure Agreement (NDA).pdf', size: '850 KB' },
            ].map((doc, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-emerald-500" />
                  <span className="font-semibold text-[var(--text-primary)]">{doc.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  {doc.size}
                  <button className="p-1 hover:text-emerald-500"><Download size={14} /></button>
                </span>
              </div>
            ))}
          </div>
        );
};
