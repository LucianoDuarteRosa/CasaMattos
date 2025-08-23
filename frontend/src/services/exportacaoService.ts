import api from './api';

export const exportacaoService = {
    async exportarInventario(fornecedorId?: number) {
        const params = fornecedorId ? { fornecedorId } : {};
        const response = await api.get('/exportacao/inventario', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },
};
