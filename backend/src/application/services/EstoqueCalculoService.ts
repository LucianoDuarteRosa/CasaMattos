import { IEstoqueItemRepository } from '../../domain/repositories/IEstoqueItemRepository';
import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { EstoqueItem, IEstoqueItem } from '../../domain/entities/EstoqueItem';

export interface IEstoqueDetalhado {
    lote: string;
    ton: string;
    bit: string;
    quantidade: number;
    quantidadeVenda: number;
}

export interface IEstoqueCalculos {
    estoqueTotal: number;
    depositoTotal: number;
    totalGeral: number;
}

export class EstoqueCalculoService {
    constructor(
        private estoqueItemRepository: IEstoqueItemRepository,
        private produtoRepository: IProdutoRepository,
        private enderecamentoRepository: IEnderecamentoRepository
    ) { }

    async calcularEstoqueTotalProduto(produtoId: number): Promise<IEstoqueCalculos> {
        const produto = await this.produtoRepository.findById(produtoId);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        // Estoque = Soma das quantidades dos EstoqueItems (não multiplica por quantMinVenda)
        const estoqueTotal = await this.estoqueItemRepository.calcularEstoqueProduto(produtoId);

        // Depósito = soma das quantCaixas dos endereçamentos * QuantMinVenda
        const enderecamentos = await this.enderecamentoRepository.findByProduto(produtoId);
        const quantidadeDeposito = enderecamentos.reduce((total: number, enderecamento: any) =>
            total + (enderecamento.quantCaixas || 0), 0);
        const depositoTotal = quantidadeDeposito * produto.quantMinVenda;

        return {
            estoqueTotal,
            depositoTotal,
            totalGeral: estoqueTotal + depositoTotal
        };
    }

    async obterEstoqueDetalhado(produtoId: number): Promise<IEstoqueDetalhado[]> {
        const produto = await this.produtoRepository.findById(produtoId);
        if (!produto) return [];

        const estoqueItems = await this.estoqueItemRepository.findByProdutoId(produtoId);

        return estoqueItems.map(item => ({
            lote: item.lote,
            ton: item.ton,
            bit: item.bit,
            quantidade: item.quantidade,
            quantidadeVenda: item.quantidade * produto.quantMinVenda
        }));
    }

    async transferirDoDepositoParaEstoque(
        produtoId: number,
        quantidade: number,
        lote: string,
        ton: string,
        bit: string
    ): Promise<void> {
        const produto = await this.produtoRepository.findById(produtoId);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        // Adiciona ou atualiza item no estoque
        await this.estoqueItemRepository.upsertByCaracteristicas(produtoId, lote, ton, bit, quantidade);

        // Atualiza valores calculados do produto
        await this.atualizarEstoqueProduto(produtoId);
    }

    async retirarDoEstoque(
        produtoId: number,
        quantidade: number,
        lote?: string,
        ton?: string,
        bit?: string
    ): Promise<void> {
        const produto = await this.produtoRepository.findById(produtoId);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        let estoqueItems: EstoqueItem[];

        if (lote && ton && bit) {
            // Retirar de características específicas
            const item = await this.estoqueItemRepository.findByCaracteristicas(produtoId, lote, ton, bit);
            if (!item) {
                throw new Error('Item com essas características não encontrado no estoque');
            }
            estoqueItems = [item];
        } else {
            // Retirar usando FIFO (primeiro que entrou)
            estoqueItems = await this.estoqueItemRepository.findByProdutoId(produtoId);
        }

        if (estoqueItems.length === 0) {
            throw new Error('Não há itens no estoque');
        }

        let quantidadeRestante = quantidade;

        for (const item of estoqueItems) {
            if (quantidadeRestante <= 0) break;

            const quantidadeARetirar = Math.min(quantidadeRestante, item.quantidade);

            if (quantidadeARetirar >= item.quantidade) {
                // Remove o item completamente
                await this.estoqueItemRepository.delete(item.id);
            } else {
                // Atualiza a quantidade
                const novaQuantidade = item.quantidade - quantidadeARetirar;
                await this.estoqueItemRepository.update(item.id, { quantidade: novaQuantidade });
            }

            quantidadeRestante -= quantidadeARetirar;
        }

        if (quantidadeRestante > 0) {
            throw new Error(`Quantidade insuficiente no estoque. Faltam ${quantidadeRestante} unidades`);
        }

        // Atualiza valores calculados do produto
        await this.atualizarEstoqueProduto(produtoId);
    }

    private async atualizarEstoqueProduto(produtoId: number): Promise<void> {
        // Não precisa mais atualizar o produto pois os valores são calculados dinamicamente
        // O cálculo é feito sempre que necessário pelos métodos de consulta
        return;
    }

    async consultarPorCaracteristicas(
        produtoId: number,
        lote: string,
        ton: string,
        bit: string
    ): Promise<IEstoqueDetalhado | null> {
        const produto = await this.produtoRepository.findById(produtoId);
        if (!produto) return null;

        const estoqueItem = await this.estoqueItemRepository.findByCaracteristicas(produtoId, lote, ton, bit);

        if (!estoqueItem) return null;

        return {
            lote: estoqueItem.lote,
            ton: estoqueItem.ton,
            bit: estoqueItem.bit,
            quantidade: estoqueItem.quantidade,
            quantidadeVenda: estoqueItem.quantidade * produto.quantMinVenda
        };
    }
}