import api from './api';
import { IProduto, IApiResponse, IPaginatedResponse } from '@/types';

export const produtoService = {
    getAll: async (page: number = 1, limit: number = 25, search?: string): Promise<IPaginatedResponse<IProduto>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) {
            params.append('search', search);
        }

        const response = await api.get<IApiResponse<IPaginatedResponse<IProduto>>>(`/produtos?${params}`);
        return response.data.data!;
    },

    getById: async (id: number): Promise<IProduto> => {
        const response = await api.get<IApiResponse<IProduto>>(`/produtos/${id}`);
        return response.data.data!;
    },

    create: async (produto: Omit<IProduto, 'id'>): Promise<IProduto> => {
        const response = await api.post<IApiResponse<IProduto>>('/produtos', produto);
        return response.data.data!;
    },

    update: async (id: number, produto: Partial<IProduto>): Promise<IProduto> => {
        const response = await api.put<IApiResponse<IProduto>>(`/produtos/${id}`, produto);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/produtos/${id}`);
    },

    searchByCodigoOrNome: async (term: string): Promise<IProduto[]> => {
        const response = await api.get<IApiResponse<IProduto[]>>(`/produtos/search?term=${encodeURIComponent(term)}`);
        return response.data.data!;
    },

    findByCodigoBarra: async (codBarra: string): Promise<IProduto | null> => {
        try {
            const response = await api.get<IApiResponse<IProduto>>(`/produtos/codigo-barras/${encodeURIComponent(codBarra)}`);
            return response.data.data!;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    findByCodigoInterno: async (codInterno: number): Promise<IProduto | null> => {
        try {
            const response = await api.get<IApiResponse<IProduto>>(`/produtos/codigo-interno/${codInterno}`);
            return response.data.data!;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
};
