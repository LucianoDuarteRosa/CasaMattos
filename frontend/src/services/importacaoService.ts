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
    confirmarImportacao: async (fornecedores: { cnpj: string, razaoSocial: string }[]) => {
        const response = await api.post('/importacao/confirmar', { fornecedores });
        return response.data;
    },
    confirmarImportacaoProdutos: async (produtos: any[]) => {
        const response = await api.post('/importacao/confirmar-produtos', { produtos });
        return response.data;
    },
    confirmarImportacaoSeparacao: async (payload: { pedidos: any[]; enderecamentos: any[] }) => {
        const response = await api.post('/importacao/confirmar-separacao', payload);
        return response.data;
    },
};
