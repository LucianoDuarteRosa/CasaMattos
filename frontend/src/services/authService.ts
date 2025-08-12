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
    }
};
