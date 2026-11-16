import { ILand } from '@/types';

export const LandService = {
  async getLands(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.limit) qs.append('limit', params.limit.toString());
    if (params?.search) qs.append('search', params.search);
    if (params?.status && params.status !== 'all') qs.append('status', params.status);

    const res = await fetch(`/api/lands?${qs.toString()}`);
    return res.json();
  },

  async getLandById(id: string) {
    const res = await fetch(`/api/lands/${id}`);
    return res.json();
  },

  async createLand(data: Partial<ILand>) {
    const res = await fetch('/api/lands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateLand(id: string, data: Partial<ILand>) {
    const res = await fetch(`/api/lands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteLand(id: string) {
    const res = await fetch(`/api/lands/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
