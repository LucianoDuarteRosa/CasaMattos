
import axios from 'axios';
import { SnackbarContext } from '@/components/SnackbarProvider';
import React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const SERVER_BASE_URL = API_BASE_URL.replace('/api', ''); // URL do servidor sem /api para arquivos estáticos

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token de autenticação
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

// Interceptor para tratar erros de resposta

// Função para injetar o contexto do snackbar dinamicamente
function handleAuthError(error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Tenta acessar o contexto do snackbar
        try {
            const snackbarContext = React.useContext(SnackbarContext);
            snackbarContext?.showSnackbar('Sua sessão expirou. Faça login novamente.', 'error');
        } catch {
            // fallback: pode ser chamado fora do React tree
        }
        window.location.href = '/';
    }
    return Promise.reject(error);
}

api.interceptors.response.use(
    (response) => response,
    (error) => handleAuthError(error)
);

export default api;
