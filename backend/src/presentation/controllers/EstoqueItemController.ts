import { Request, Response } from 'express';
import { EstoqueItemRepository } from '../../infrastructure/repositories/EstoqueItemRepository';
import { ProdutoRepository } from '../../infrastructure/repositories/ProdutoRepository';
import { EnderecamentoRepository } from '../../infrastructure/repositories/EnderecamentoRepository';
import { EstoqueCalculoService } from '../../application/services/EstoqueCalculoService';
import { TransferirDepositoParaEstoqueUseCase } from '../../application/usecases/TransferirDepositoParaEstoqueUseCase';
import { RetirarDoEstoqueUseCase } from '../../application/usecases/RetirarDoEstoqueUseCase';
import { ConsultarEstoqueProdutoUseCase } from '../../application/usecases/ConsultarEstoqueProdutoUseCase';
import { LoggingService } from '../../application/services/LoggingService';

export class EstoqueItemController {
    private estoqueItemRepository: EstoqueItemRepository;
    private produtoRepository: ProdutoRepository;
    private enderecamentoRepository: EnderecamentoRepository;
    private estoqueCalculoService: EstoqueCalculoService;
    private transferirDepositoParaEstoqueUseCase: TransferirDepositoParaEstoqueUseCase;
    private retirarDoEstoqueUseCase: RetirarDoEstoqueUseCase;
    private consultarEstoqueProdutoUseCase: ConsultarEstoqueProdutoUseCase;
    private loggingService: LoggingService;

    constructor() {
        this.estoqueItemRepository = new EstoqueItemRepository();
        this.produtoRepository = new ProdutoRepository();
        this.enderecamentoRepository = new EnderecamentoRepository();

        this.loggingService = LoggingService.getInstance();

        this.estoqueCalculoService = new EstoqueCalculoService(
            this.estoqueItemRepository,
            this.produtoRepository,
            this.enderecamentoRepository
        );

        this.transferirDepositoParaEstoqueUseCase = new TransferirDepositoParaEstoqueUseCase(this.estoqueCalculoService);
        this.retirarDoEstoqueUseCase = new RetirarDoEstoqueUseCase(this.estoqueCalculoService);
        this.consultarEstoqueProdutoUseCase = new ConsultarEstoqueProdutoUseCase(this.estoqueCalculoService);
    }

    async listarEstoqueItens(req: Request, res: Response): Promise<void> {
        try {
            const produtoId = parseInt(req.params.produtoId);
            if (isNaN(produtoId)) {
                res.status(400).json({ success: false, message: 'ID do produto inválido' });
                return;
            }
            const itens = await this.estoqueItemRepository.findByProdutoId(produtoId);
            res.json({ success: true, data: itens });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || 'Erro ao listar itens de estoque' });
        }
    }

    async transferirDepositoParaEstoque(req: Request, res: Response): Promise<void> {
        try {
            const { produtoId, quantidade, lote, ton, bit } = req.body;

            await this.transferirDepositoParaEstoqueUseCase.execute({
                produtoId,
                quantidade,
                lote,
                ton,
                bit
            });

            res.json({
                success: true,
                message: 'Transferência realizada com sucesso'
            });

        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao transferir produto para estoque'
            });
        }
    }

    async retirarDoEstoque(req: Request, res: Response): Promise<void> {
        try {
            const { produtoId, quantidade, lote, ton, bit } = req.body;

            await this.retirarDoEstoqueUseCase.execute({
                produtoId,
                quantidade,
                lote,
                ton,
                bit
            });

            res.json({
                success: true,
                message: 'Retirada realizada com sucesso'
            });

        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao retirar produto do estoque'
            });
        }
    }

    async consultarEstoqueProduto(req: Request, res: Response): Promise<void> {
        try {
            const produtoId = parseInt(req.params.produtoId);
            const { lote, ton, bit, detalhado } = req.query;

            if (isNaN(produtoId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do produto inválido'
                });
                return;
            }

            const resultado = await this.consultarEstoqueProdutoUseCase.execute({
                produtoId,
                lote: lote as string,
                ton: ton as string,
                bit: bit as string,
                detalhado: detalhado === 'true'
            });

            res.json({
                success: true,
                data: resultado
            });

        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao consultar estoque do produto'
            });
        }
    }

    async listarEstoqueDetalhado(req: Request, res: Response): Promise<void> {
        try {
            const produtoId = parseInt(req.params.produtoId);

            if (isNaN(produtoId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do produto inválido'
                });
                return;
            }

            const detalhes = await this.estoqueCalculoService.obterEstoqueDetalhado(produtoId);

            res.json({
                success: true,
                data: detalhes
            });

        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao listar estoque detalhado'
            });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { produtoId, lote, ton, bit, quantidade } = req.body;
            if (!produtoId || !lote || !ton || !bit || quantidade === undefined) {
                res.status(400).json({ success: false, message: 'Dados obrigatórios não informados.' });
                return;
            }
            const novoItem = await this.estoqueItemRepository.create({ produtoId, lote, ton, bit, quantidade });

            // Log de criação
            const userId = req.body.executorUserId;
            if (userId) {
                await this.loggingService.logCreate(userId, 'EstoqueItem', novoItem, 'Item de estoque criado');
            }

            res.status(201).json({ success: true, data: novoItem });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || 'Erro ao criar item de estoque.' });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { lote, ton, bit, quantidade } = req.body;
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'ID inválido.' });
                return;
            }
            // Buscar dados antigos para log
            const oldItem = await this.estoqueItemRepository.findById(id);
            const atualizado = await this.estoqueItemRepository.update(id, { lote, ton, bit, quantidade });
            if (!atualizado) {
                res.status(404).json({ success: false, message: 'Item não encontrado.' });
                return;
            }

            // Log de atualização
            const userId = req.body.executorUserId;
            if (userId && oldItem) {
                await this.loggingService.logUpdate(userId, 'EstoqueItem', oldItem, atualizado, 'Item de estoque atualizado');
            }

            res.json({ success: true, data: atualizado });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || 'Erro ao atualizar item de estoque.' });
        }
    }
}
