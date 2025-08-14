import axios from 'axios';
import { IEnderecamento, IProduto, IPredio } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: `${API_BASE_URL}/enderecamentos`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface CreateEnderecamentoData {
    tonalidade: string;
    bitola: string;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    disponivel: boolean;
    idProduto: number;
    idPredio: number;
}

export interface UpdateEnderecamentoData {
    tonalidade?: string;
    bitola?: string;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    disponivel?: boolean;
    idProduto?: number;
    idPredio?: number;
}

export interface EnderecamentoWithRelations extends IEnderecamento {
    produto?: IProduto;
    predio?: IPredio & { rua?: { id: number; nomeRua: string } };
}

export const enderecamentoService = {
    // Listar todos os endereçamentos
    async getAll(): Promise<EnderecamentoWithRelations[]> {
        const response = await api.get('/');
        return response.data;
    },

    // Listar apenas endereçamentos disponíveis
    async getDisponiveis(): Promise<EnderecamentoWithRelations[]> {
        const response = await api.get('/disponiveis');
        return response.data;
    },

    // Buscar endereçamento por ID
    async getById(id: number): Promise<EnderecamentoWithRelations> {
        const response = await api.get(`/${id}`);
        return response.data;
    },

    // Criar novo endereçamento
    async create(data: CreateEnderecamentoData): Promise<IEnderecamento> {
        const response = await api.post('/', data);
        return response.data;
    },

    // Atualizar endereçamento
    async update(id: number, data: UpdateEnderecamentoData): Promise<IEnderecamento> {
        const response = await api.put(`/${id}`, data);
        return response.data;
    },

    // Deletar endereçamento
    async delete(id: number): Promise<void> {
        await api.delete(`/${id}`);
    },

    // Buscar endereçamentos por produto
    async searchByProduto(idProduto: number): Promise<EnderecamentoWithRelations[]> {
        const response = await api.get(`/produto/${idProduto}`);
        return response.data;
    },

    // Buscar endereçamentos por código interno ou descrição do produto
    async searchByCodigoOuDescricao(termo: string): Promise<EnderecamentoWithRelations[]> {
        const response = await api.get('/search', {
            params: { q: termo }
        });
        return response.data;
    }
};
