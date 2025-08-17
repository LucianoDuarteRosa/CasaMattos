import { LogEntry } from '../types';
import { api } from './api';

export const logService = {
    async list(params: { entidade?: string; tipo?: string; search?: string }) {
        const query = new URLSearchParams();
        if (params.entidade) query.append('entidade', params.entidade);
        if (params.tipo) query.append('tipo', params.tipo);
        if (params.search) query.append('search', params.search);
        const { data } = await api.get<LogEntry[]>(`/logs?${query.toString()}`);
        return data;
    },
};
