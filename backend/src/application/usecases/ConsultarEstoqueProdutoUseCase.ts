import { EstoqueCalculoService, IEstoqueCalculos, IEstoqueDetalhado } from '../services/EstoqueCalculoService';

export interface ConsultarEstoqueProdutoRequest {
    produtoId: number;
    lote?: string;
    ton?: string;
    bit?: string;
    detalhado?: boolean;
}

export interface ConsultarEstoqueProdutoResponse {
    produtoId: number;
    calculos: IEstoqueCalculos;
    detalhes?: IEstoqueDetalhado[] | IEstoqueDetalhado | null;
}

export class ConsultarEstoqueProdutoUseCase {
    constructor(
        private estoqueCalculoService: EstoqueCalculoService
    ) { }

    async execute(request: ConsultarEstoqueProdutoRequest): Promise<ConsultarEstoqueProdutoResponse> {
        const { produtoId, lote, ton, bit, detalhado = false } = request;

        const calculos = await this.estoqueCalculoService.calcularEstoqueTotalProduto(produtoId);

        let detalhes: IEstoqueDetalhado[] | IEstoqueDetalhado | null | undefined;

        if (detalhado) {
            if (lote && ton && bit) {
                detalhes = await this.estoqueCalculoService.consultarPorCaracteristicas(produtoId, lote, ton, bit);
            } else {
                detalhes = await this.estoqueCalculoService.obterEstoqueDetalhado(produtoId);
            }
        }

        return {
            produtoId,
            calculos,
            detalhes
        };
    }
}
