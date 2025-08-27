import { api } from './api';

export const importacaoService = {
    importar: async (tipo: string, arquivo: File) => {
        const formData = new FormData();
        formData.append('tipo', tipo);
        formData.append('arquivo', arquivo);
        const response = await api.post('/importacao', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
