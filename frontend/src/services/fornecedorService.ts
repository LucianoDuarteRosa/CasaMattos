import api from './api';
import { IFornecedor, IApiResponse } from '@/types';

export const fornecedorService = {
    getAll: async (): Promise<IFornecedor[]> => {
        const response = await api.get<IApiResponse<IFornecedor[]>>('/fornecedores');
        return response.data.data!;
    },

    getById: async (id: number): Promise<IFornecedor> => {
        const response = await api.get<IApiResponse<IFornecedor>>(`/fornecedores/${id}`);
        return response.data.data!;
    },

    create: async (fornecedor: Omit<IFornecedor, 'id'>): Promise<IFornecedor> => {
        const response = await api.post<IApiResponse<IFornecedor>>('/fornecedores', fornecedor);
        return response.data.data!;
    },

    update: async (id: number, fornecedor: Partial<IFornecedor>): Promise<IFornecedor> => {
        const response = await api.put<IApiResponse<IFornecedor>>(`/fornecedores/${id}`, fornecedor);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/fornecedores/${id}`);
    },

    search: async (term: string): Promise<IFornecedor[]> => {
        const response = await api.get<IApiResponse<IFornecedor[]>>(`/fornecedores/search?q=${encodeURIComponent(term)}`);
        return response.data.data!;
    }
};
