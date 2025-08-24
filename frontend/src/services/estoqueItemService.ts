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
        const response = await api.get(`/estoque/produto/${produtoId}/itens`);
        return response.data.data;
    },
    create: async (item: Omit<IEstoqueItem, 'id'>) => {
        const response = await api.post('/estoque/item', item);
        return response.data;
    },
    update: async (id: number, item: Partial<IEstoqueItem>) => {
        const response = await api.put(`/estoque/item/${id}`, item);
        return response.data;
    },
};
