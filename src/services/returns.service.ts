export const ReturnsService = {
  async getReturns(params?: {
    page?: number;
    limit?: number;
    landId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    customerId?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.limit) qs.append('limit', params.limit.toString());
    if (params?.landId && params.landId !== 'all') qs.append('landId', params.landId);
    if (params?.status && params.status !== 'all') qs.append('status', params.status);
    if (params?.startDate) qs.append('startDate', params.startDate);
    if (params?.endDate) qs.append('endDate', params.endDate);
    if (params?.customerId) qs.append('customerId', params.customerId);

    const res = await fetch(`/api/returns?${qs.toString()}`);
    return res.json();
  },

  async calculateReturns(data: { date: string; landId?: string; overrideRate?: number }) {
    const res = await fetch('/api/returns/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateReturnPayout(returnIds: string[], status: 'verified' | 'paid') {
    const res = await fetch('/api/returns/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnIds, status }),
    });
    return res.json();
  },
};

