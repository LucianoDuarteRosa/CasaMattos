import api from './api';

export interface DashboardStats {
    produtosComEstoque: number;
    metragemTotal: string;
    enderecamentosDisponiveis: number;
    listasAtivas: number;
}

export interface ProdutoPontaEstoque {
    id: number;
    descricao: string;
    deposito: number;
    estoque: number;
    quantMinVenda: number;
    fornecedor: string;
    totalDisponivel: number;
}

export interface ProdutoEstoqueBaixo {
    id: number;
    descricao: string;
    deposito: number;
    estoque: number;
    quantMinVenda: number;
    quantCaixas: number;
    fornecedor: string;
    limiteCalculado: number;
    cinquentaPorcento: number;
}

export const dashboardService = {
    // Buscar estatísticas gerais do dashboard
    async getStats(): Promise<DashboardStats> {
        const response = await api.get('/dashboard/stats');
        return response.data.data;
    },

    // Buscar produtos em ponta de estoque
    async getProdutosPontaEstoque(): Promise<ProdutoPontaEstoque[]> {
        const response = await api.get('/dashboard/produtos-ponta-estoque');
        return response.data.data;
    },

    // Buscar produtos com estoque baixo na separação
    async getProdutosEstoqueBaixoSeparacao(): Promise<ProdutoEstoqueBaixo[]> {
        const response = await api.get('/dashboard/produtos-estoque-baixo-separacao');
        return response.data.data;
    },
};
