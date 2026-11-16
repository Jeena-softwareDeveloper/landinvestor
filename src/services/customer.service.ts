import { ICustomer } from '@/types';

export const CustomerService = {
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    kycStatus?: string;
    accountStatus?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.limit) qs.append('limit', params.limit.toString());
    if (params?.search) qs.append('search', params.search);
    if (params?.kycStatus && params.kycStatus !== 'all') qs.append('kycStatus', params.kycStatus);
    if (params?.accountStatus && params.accountStatus !== 'all')
      qs.append('accountStatus', params.accountStatus);

    const res = await fetch(`/api/customers?${qs.toString()}`);
    return res.json();
  },

  async getCustomerById(id: string) {
    const res = await fetch(`/api/customers/${id}`);
    return res.json();
  },

  async createCustomer(data: Partial<ICustomer>) {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCustomer(id: string, data: Partial<ICustomer>) {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteCustomer(id: string) {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
