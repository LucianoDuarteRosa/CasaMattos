import { api } from './api';

export const settingService = {
    async getAll() {
        const res = await api.get('/settings');
        return res.data;
    },
    async create(data: any) {
        const res = await api.post('/settings', data);
        return res.data;
    },
    async update(id: number, data: any) {
        const res = await api.put(`/settings/${id}`, data);
        return res.data;
    },
    async delete(id: number) {
        const res = await api.delete(`/settings/${id}`);
        return res.data;
    }
};
