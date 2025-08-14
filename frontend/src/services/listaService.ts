import api from './api';
import { ILista, IEnderecamento, IApiResponse, IPaginatedResponse } from '@/types';

export interface IBaixaListaRequest {
    idLista: number;
    enderecamentos: {
        idEnderecamento: number;
        quantCaixasBaixa: number;
    }[];
}

export const listaService = {
    getAll: async (page: number = 1, limit: number = 10): Promise<IPaginatedResponse<ILista>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        const response = await api.get<IApiResponse<IPaginatedResponse<ILista>>>(`/listas?${params}`);
        return response.data.data!;
    },

    getById: async (id: number): Promise<ILista> => {
        const response = await api.get<IApiResponse<ILista>>(`/listas/${id}`);
        return response.data.data!;
    },

    create: async (lista: Omit<ILista, 'id'>): Promise<ILista> => {
        const response = await api.post<IApiResponse<ILista>>('/listas', lista);
        return response.data.data!;
    },

    update: async (id: number, lista: Partial<ILista>): Promise<ILista> => {
        const response = await api.put<IApiResponse<ILista>>(`/listas/${id}`, lista);
        return response.data.data!;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/listas/${id}`);
    },

    getEnderecamentos: async (idLista: number): Promise<IEnderecamento[]> => {
        const response = await api.get<IApiResponse<IEnderecamento[]>>(`/listas/${idLista}/enderecamentos`);
        return response.data.data!;
    },

    adicionarEnderecamento: async (idLista: number, idEnderecamento: number): Promise<void> => {
        await api.post(`/listas/${idLista}/enderecamentos/${idEnderecamento}`);
    },

    removerEnderecamento: async (idLista: number, idEnderecamento: number): Promise<void> => {
        await api.delete(`/listas/${idLista}/enderecamentos/${idEnderecamento}`);
    },

    baixarLista: async (dadosBaixa: IBaixaListaRequest): Promise<void> => {
        await api.post('/listas/baixar', dadosBaixa);
    },

    finalizarLista: async (idLista: number): Promise<void> => {
        await api.post(`/listas/${idLista}/finalizar`);
    },

    desfazerFinalizacao: async (idLista: number): Promise<void> => {
        await api.post(`/listas/${idLista}/desfazer-finalizacao`);
    },

    searchEnderecamentosDisponiveis: async (filtros: {
        codigoFabricante?: string;
        codigoInterno?: string;
        codigoBarras?: string;
        descricao?: string;
    }): Promise<IEnderecamento[]> => {
        const params = new URLSearchParams();

        if (filtros.codigoFabricante) params.append('codigoFabricante', filtros.codigoFabricante);
        if (filtros.codigoInterno) params.append('codigoInterno', filtros.codigoInterno);
        if (filtros.codigoBarras) params.append('codigoBarras', filtros.codigoBarras);
        if (filtros.descricao) params.append('descricao', filtros.descricao);

        const response = await api.get<IApiResponse<IEnderecamento[]>>(`/enderecamentos/search-disponiveis?${params}`);
        return response.data.data!;
    }
};
