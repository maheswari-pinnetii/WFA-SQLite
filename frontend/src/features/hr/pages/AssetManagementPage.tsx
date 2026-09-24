import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Monitor,
  Smartphone,
  CreditCard,
  Plus,
  UserCheck,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';

interface Asset {
  id: string;
  assetTag: string;
  assetType: string;
  description?: string;
  serialNumber?: string;
  value?: number;
  status: 'AVAILABLE' | 'ASSIGNED' | 'UNDER_REPAIR' | 'RETIRED' | 'LOST';
  assignedToName?: string;
  assignedToId?: string;
}

export const AssetManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [assetTag, setAssetTag] = useState('');
  const [assetType, setAssetType] = useState('LAPTOP');
  const [description, setDescription] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [value, setValue] = useState<number | ''>('');

  const token = localStorage.getItem('token');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAssets(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTag || !assetType) return;
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assetTag,
          assetType,
          description,
          serialNumber,
          value: value ? Number(value) : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setAssetTag('');
        setDescription('');
        setSerialNumber('');
        setValue('');
        fetchAssets();
      }
    } catch (err) {
      console.error('Failed to create asset:', err);
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.assignedToName && a.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'ALL' || a.assetType === filterType;
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'LAPTOP': return <Laptop size={16} className="text-blue-500" />;
      case 'MONITOR': return <Monitor size={16} className="text-purple-500" />;
      case 'PHONE': return <Smartphone size={16} className="text-emerald-500" />;
      case 'ACCESS_CARD': return <CreditCard size={16} className="text-amber-500" />;
      default: return <Laptop size={16} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">Available</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">Assigned</span>;
      case 'UNDER_REPAIR':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">Under Repair</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Laptop className="text-emerald-600 dark:text-emerald-400" size={22} /> Asset Management & Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track hardware inventory, IT allocations, warranty records, and offboarding returns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAssets}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 text-slate-700 dark:text-slate-300"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Add New Asset
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tag, serial #, or employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Asset Types</option>
            <option value="LAPTOP">Laptops</option>
            <option value="MONITOR">Monitors</option>
            <option value="PHONE">Mobile Devices</option>
            <option value="ACCESS_CARD">Access Cards</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNDER_REPAIR">Under Repair</option>
          </select>
        </div>
      </div>

      {/* Asset Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Asset Tag</th>
                <th className="p-3">Type</th>
                <th className="p-3">Serial Number</th>
                <th className="p-3">Assigned Employee</th>
                <th className="p-3">Est. Value (₹)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">Loading company assets...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">No assets matching search criteria.</td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {getCategoryIcon(asset.assetType)} {asset.assetTag}
                    </td>
                    <td className="p-3 uppercase text-[11px] font-mono">{asset.assetType}</td>
                    <td className="p-3 font-mono">{asset.serialNumber || '—'}</td>
                    <td className="p-3">{asset.assignedToName ? <span className="font-medium text-slate-900 dark:text-slate-100">{asset.assignedToName}</span> : <span className="text-slate-400 italic">Unassigned</span>}</td>
                    <td className="p-3 font-mono">{asset.value ? `₹${asset.value.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="p-3">{getStatusBadge(asset.status)}</td>
                    <td className="p-3 text-right font-medium">
                      <button className="text-emerald-600 dark:text-emerald-400 hover:underline">Manage</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Asset */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus size={18} className="text-emerald-500" /> Register Company Asset
            </h2>
            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Asset Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STACKLY-LAP-099"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Asset Category *</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="LAPTOP">Laptop / Workstation</option>
                  <option value="MONITOR">External Monitor</option>
                  <option value="PHONE">Mobile Phone</option>
                  <option value="ACCESS_CARD">Access Card</option>
                  <option value="OTHER">Peripherals & Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. C02G1234Q6L"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Purchase Value (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={value}
                  onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
