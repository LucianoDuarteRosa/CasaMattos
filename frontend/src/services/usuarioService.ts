import api from './api';
import { IUsuario, CreateUsuarioData, UpdateUsuarioData, UpdateUsuarioSenhaData, IPerfil } from '../types';

export const usuarioService = {
    // Criar usuário (apenas admin)
    async create(data: CreateUsuarioData): Promise<IUsuario> {
        const response = await api.post('/usuarios', data);
        return response.data;
    },

    // Listar usuários (apenas admin)
    async list(): Promise<IUsuario[]> {
        const response = await api.get('/usuarios');
        return response.data;
    },

    // Buscar usuário por ID
    async getById(id: number): Promise<IUsuario> {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    // Atualizar usuário
    async update(id: number, data: UpdateUsuarioData): Promise<IUsuario> {
        const response = await api.put(`/usuarios/${id}`, data);
        return response.data;
    },

    // Alterar senha
    async updatePassword(id: number, data: UpdateUsuarioSenhaData): Promise<void> {
        await api.put(`/usuarios/${id}/senha`, data);
    },

    // Deletar usuário (apenas admin)
    async delete(id: number): Promise<void> {
        await api.delete(`/usuarios/${id}`);
    },

    // Buscar perfil do usuário logado
    async getProfile(): Promise<IUsuario> {
        const response = await api.get('/usuarios/me/profile');
        return response.data;
    },

    // Listar perfis disponíveis
    async listPerfis(): Promise<IPerfil[]> {
        const response = await api.get('/perfis');
        return response.data;
    },

    // Upload de imagem do usuário
    async uploadImage(id: number, file: File): Promise<{ imagemUrl: string; message: string }> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post(`/usuarios/${id}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
