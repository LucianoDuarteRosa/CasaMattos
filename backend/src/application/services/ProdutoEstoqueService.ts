import { IProduto } from '../../domain/entities/Produto';
import { EstoqueCalculoService, IEstoqueCalculos } from './EstoqueCalculoService';

export interface IProdutoComEstoque extends IProduto {
    estoque: number;
    deposito: number;
    estoqueCalculos: IEstoqueCalculos;
}

export class ProdutoEstoqueService {
    constructor(
        private estoqueCalculoService: EstoqueCalculoService
    ) { }

    async adicionarCalculosEstoque(produto: IProduto): Promise<IProdutoComEstoque> {
        const calculos = await this.estoqueCalculoService.calcularEstoqueTotalProduto(produto.id);

        return {
            ...produto,
            estoque: calculos.estoqueTotal, // Quantidade total de itens no estoque
            deposito: calculos.depositoTotal / produto.quantMinVenda, // Quantidade em unidades do produto
            estoqueCalculos: calculos
        };
    }

    async adicionarCalculosEstoqueLista(produtos: IProduto[]): Promise<IProdutoComEstoque[]> {
        const produtosComEstoque = await Promise.all(
            produtos.map(produto => this.adicionarCalculosEstoque(produto))
        );

        return produtosComEstoque;
    }
}
