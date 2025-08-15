import api from './api';

export interface IEstoqueItem {
    id: number;
    produtoId: number;
    lote: string;
    ton: string;
    bit: string;
    quantidade: number;
    createdAt?: string;
    updatedAt?: string;
}

export const estoqueItemService = {
    getByProdutoId: async (produtoId: number): Promise<IEstoqueItem[]> => {
        const response = await api.get(`/estoque/produto/${produtoId}/detalhado`);
        return response.data.data;
    },
};
