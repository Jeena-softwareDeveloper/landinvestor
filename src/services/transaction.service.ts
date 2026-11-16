import { ITransaction } from '@/types';

export const TransactionService = {
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    customerId?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.limit) qs.append('limit', params.limit.toString());
    if (params?.search) qs.append('search', params.search);
    if (params?.type && params.type !== 'all') qs.append('type', params.type);
    if (params?.status && params.status !== 'all') qs.append('status', params.status);
    if (params?.customerId) qs.append('customerId', params.customerId);

    const res = await fetch(`/api/transactions?${qs.toString()}`);
    return res.json();
  },

  async recordTransaction(data: Partial<ITransaction>) {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async verifyTransaction(id: string, status: string, adminNotes?: string) {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
    return res.json();
  },
};

