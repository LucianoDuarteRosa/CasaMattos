import api from './api';
import { ILoginRequest, ILoginResponse, IApiResponse } from '@/types';

export const authService = {
    login: async (credentials: ILoginRequest): Promise<ILoginResponse> => {
        const response = await api.post<IApiResponse<ILoginResponse>>('/auth/login', credentials);
        return response.data.data!;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    setAuthData: (token: string, user: any) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    updateCurrentUser: (updatedUser: any) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Disparar evento customizado para componentes que escutam mudanças
        window.dispatchEvent(new Event('userUpdated'));
    },

    // Recarregar dados do usuário do servidor
    async refreshCurrentUser(): Promise<any> {
        try {
            const response = await api.get('/usuarios/me/profile');
            const updatedUser = response.data;
            this.updateCurrentUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Erro ao recarregar dados do usuário:', error);
            return this.getCurrentUser();
        }
    }
};
