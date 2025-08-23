import { api } from './api';

export const templateService = {
    async baixarTemplate(tipo: 'fornecedor' | 'produto'): Promise<Blob> {
        const response = await api.get(`/templates/${tipo}`, { responseType: 'blob' });
        return response.data;
    },
};
