import { IWithdrawal } from '@/types';

export const WithdrawalService = {
  async getWithdrawals(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.limit) qs.append('limit', params.limit.toString());
    if (params?.status && params.status !== 'all') qs.append('status', params.status);
    if (params?.customerId) qs.append('customerId', params.customerId);

    const res = await fetch(`/api/withdrawals?${qs.toString()}`);
    return res.json();
  },

  async requestWithdrawal(data: Partial<IWithdrawal>) {
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateWithdrawalStatus(
    id: string,
    data: {
      status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';
      paymentReference?: string;
      paymentProof?: string;
      rejectionReason?: string;
    }
  ) {
    const res = await fetch(`/api/withdrawals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

