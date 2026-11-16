import { IInvestment } from '@/types';

export const InvestmentService = {
  async getInvestments(params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    landId?: string;
    status?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.limit) qs.append('limit', params.limit.toString());
    if (params?.customerId) qs.append('customerId', params.customerId);
    if (params?.landId) qs.append('landId', params.landId);
    if (params?.status && params.status !== 'all') qs.append('status', params.status);

    const res = await fetch(`/api/investments?${qs.toString()}`);
    return res.json();
  },

  async getInvestmentById(id: string) {
    const res = await fetch(`/api/investments/${id}`);
    return res.json();
  },

  async createInvestment(data: Partial<IInvestment>) {
    const res = await fetch('/api/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateInvestment(id: string, data: Partial<IInvestment>) {
    const res = await fetch(`/api/investments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async cancelInvestment(id: string) {
    const res = await fetch(`/api/investments/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
