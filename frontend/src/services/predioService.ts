import axios from 'axios';
import { IPredio, IRua } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: `${API_BASE_URL}/predios`,
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

export interface CreatePredioData {
    nomePredio: string;
    vagas?: number;
    idRua: number;
}

export interface UpdatePredioData {
    nomePredio?: string;
    vagas?: number;
    idRua?: number;
}

export interface PredioWithRua extends IPredio {
    rua?: IRua;
}

export const predioService = {
    // Listar todos os prédios
    async getAll(): Promise<PredioWithRua[]> {
        const response = await api.get('/');
        return response.data;
    },

    // Buscar prédio por ID
    async getById(id: number): Promise<PredioWithRua> {
        const response = await api.get(`/${id}`);
        return response.data;
    },

    // Criar novo prédio
    async create(data: CreatePredioData): Promise<IPredio> {
        const response = await api.post('/', data);
        return response.data;
    },

    // Atualizar prédio
    async update(id: number, data: UpdatePredioData): Promise<IPredio> {
        const response = await api.put(`/${id}`, data);
        return response.data;
    },

    // Deletar prédio
    async delete(id: number): Promise<void> {
        await api.delete(`/${id}`);
    },

    // Buscar prédios por nome
    async search(query: string): Promise<PredioWithRua[]> {
        const response = await api.get('/search', {
            params: { q: query }
        });
        return response.data;
    }
};
