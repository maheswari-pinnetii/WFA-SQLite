import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { reportApi, ReportType, ReportFilterParams } from '../../../api/endpoints/report.api';

interface ExportReportProps {
  title?: string;
  subtitle?: string;
  reportType?: ReportType;
  filters?: ReportFilterParams;
}

export const ExportReport: React.FC<ExportReportProps> = ({ 
  title = 'Export Analytics Report',
  subtitle = 'Download formatted workforce compliance data',
  reportType = 'attendance',
  filters = {}
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<'csv' | 'json' | null>(null);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'json') => {
    setDownloadingFormat(format);
    setSuccess(false);
    setErrorMessage(null);

    try {
      await reportApi.exportReport(reportType, format, filters);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to export report:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to generate report export.';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{title}</h4>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {success ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
              <CheckCircle2 size={16} />
              Downloaded Successfully!
            </div>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                isLoading={downloadingFormat === 'csv'}
                icon={<Download size={14} />}
                onClick={() => handleExport('csv')}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={downloadingFormat === 'json'}
                icon={<Download size={14} />}
                onClick={() => handleExport('json')}
              >
                Export JSON
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
