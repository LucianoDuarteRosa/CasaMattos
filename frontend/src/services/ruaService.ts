import axios from 'axios';
import { IRua } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: `${API_BASE_URL}/ruas`,
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

export const ruaService = {
    // Listar todas as ruas
    async getAll(): Promise<IRua[]> {
        const response = await api.get('/');
        return response.data;
    },

    // Buscar rua por ID
    async getById(id: number): Promise<IRua> {
        const response = await api.get(`/${id}`);
        return response.data;
    },

    // Criar nova rua
    async create(data: Omit<IRua, 'id' | 'createdAt' | 'updatedAt'>): Promise<IRua> {
        const response = await api.post('/', data);
        return response.data;
    },

    // Atualizar rua
    async update(id: number, data: Partial<Omit<IRua, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IRua> {
        const response = await api.put(`/${id}`, data);
        return response.data;
    },

    // Deletar rua
    async delete(id: number): Promise<void> {
        await api.delete(`/${id}`);
    },

    // Buscar ruas por nome
    async search(query: string): Promise<IRua[]> {
        const response = await api.get('/search', {
            params: { q: query }
        });
        return response.data;
    }
};
