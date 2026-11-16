export const ReportService = {
  async getDashboardMetrics() {
    const res = await fetch('/api/reports/dashboard');
    return res.json();
  },

  async getExportReport(params: {
    type: string;
    startDate?: string;
    endDate?: string;
    landId?: string;
    customerId?: string;
  }) {
    const qs = new URLSearchParams();
    qs.append('type', params.type);
    if (params.startDate) qs.append('startDate', params.startDate);
    if (params.endDate) qs.append('endDate', params.endDate);
    if (params.landId && params.landId !== 'all') qs.append('landId', params.landId);
    if (params.customerId && params.customerId !== 'all') qs.append('customerId', params.customerId);

    const res = await fetch(`/api/reports/export?${qs.toString()}`);
    return res.json();
  },
};
