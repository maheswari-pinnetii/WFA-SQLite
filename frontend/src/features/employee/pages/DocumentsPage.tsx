import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Upload, Plus, FileBadge2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { apiClient as api } from '../../../api/client';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'PAYSLIP',
    fileUrl: ''
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents/me');
      setDocuments(response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/documents', uploadData);
      setShowUploadModal(false);
      setUploadData({ title: '', type: 'PAYSLIP', fileUrl: '' });
      fetchDocuments();
    } catch (err) {
      console.error('Failed to upload document', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Secure Document Vault</h2>
          <p className="text-xs text-slate-400 mt-1">Manage and access your official HR documents, contracts, and payslips.</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2">
          <Upload size={16} />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-slate-400 py-10">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-10 bg-slate-900 rounded-2xl border border-slate-800">
            <FileBadge2 size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="font-bold text-slate-300">No documents found.</p>
            <p className="text-xs">Upload your first document to store it securely.</p>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl hover:border-slate-700 transition-all flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{doc.title}</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{doc.type}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 border-t border-slate-800/60 pt-4">
                <span className="text-[11px] text-slate-500">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                    <Download size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-white">Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" 
                  value={uploadData.title}
                  onChange={e => setUploadData({...uploadData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. Identity Proof"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Document Type</label>
                <select 
                  value={uploadData.type}
                  onChange={e => setUploadData({...uploadData, type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                >
                  <option value="PAYSLIP">Payslip</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="ID_PROOF">ID Proof</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">File URL</label>
                <input 
                  type="url" 
                  value={uploadData.fileUrl}
                  onChange={e => setUploadData({...uploadData, fileUrl: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl h-12">Cancel</Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-12 shadow-lg shadow-emerald-900/20">Upload</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
