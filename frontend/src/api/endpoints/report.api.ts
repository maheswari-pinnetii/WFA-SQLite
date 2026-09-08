import { apiClient } from '../../services/api';

export type ReportType = 'attendance' | 'workforce' | 'leave';
export type ExportFormat = 'csv' | 'json';

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  department?: string;
  team?: string;
  status?: string;
  type?: string;
}

export interface ReportMetrics {
  availableReports: {
    id: string;
    name: string;
    totalRecords: number;
    formats: string[];
  }[];
  lastGeneratedAt: string;
}

export const reportApi = {
  /**
   * Stream and download a formatted report directly from SQLite
   */
  exportReport: async (
    reportType: ReportType,
    format: ExportFormat = 'csv',
    filters: ReportFilterParams = {}
  ): Promise<void> => {
    const response = await apiClient.get(`/reports/${reportType}/export`, {
      params: {
        ...filters,
        format
      },
      responseType: 'blob'
    });

    // Extract filename from Content-Disposition header if available
    const disposition = response.headers['content-disposition'];
    let filename = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.${format}`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Get report catalog summary statistics
   */
  getReportMetrics: async (): Promise<ReportMetrics> => {
    const res = await apiClient.get('/reports/metrics');
    return res.data?.data;
  }
};
