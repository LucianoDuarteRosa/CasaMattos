import { Request, Response } from 'express';
import { CreateEnderecamentoUseCase } from '../../application/usecases/CreateEnderecamentoUseCase';
import { CreateBulkEnderecamentoUseCase } from '../../application/usecases/CreateBulkEnderecamentoUseCase';
import { GetEnderecamentoUseCase } from '../../application/usecases/GetEnderecamentoUseCase';
import { ListEnderecamentosUseCase } from '../../application/usecases/ListEnderecamentosUseCase';
import { ListEnderecamentosDisponiveisUseCase } from '../../application/usecases/ListEnderecamentosDisponiveisUseCase';
import { UpdateEnderecamentoUseCase } from '../../application/usecases/UpdateEnderecamentoUseCase';
import { DeleteEnderecamentoUseCase } from '../../application/usecases/DeleteEnderecamentoUseCase';
import { SearchEnderecamentosUseCase } from '../../application/usecases/SearchEnderecamentosUseCase';
import { SearchEnderecamentosDisponiveisUseCase } from '../../application/usecases/SearchEnderecamentosDisponiveisUseCase';

export class EnderecamentoController {
    constructor(
        private createEnderecamentoUseCase: CreateEnderecamentoUseCase,
        private createBulkEnderecamentoUseCase: CreateBulkEnderecamentoUseCase,
        private getEnderecamentoUseCase: GetEnderecamentoUseCase,
        private listEnderecamentosUseCase: ListEnderecamentosUseCase,
        private listEnderecamentosDisponiveisUseCase: ListEnderecamentosDisponiveisUseCase,
        private updateEnderecamentoUseCase: UpdateEnderecamentoUseCase,
        private deleteEnderecamentoUseCase: DeleteEnderecamentoUseCase,
        private searchEnderecamentosUseCase: SearchEnderecamentosUseCase,
        private searchEnderecamentosDisponiveisUseCase: SearchEnderecamentosDisponiveisUseCase
    ) { }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { tonalidade, bitola, lote, observacao, quantCaixas, disponivel, idProduto, idPredio } = req.body;

            const enderecamento = await this.createEnderecamentoUseCase.execute({
                tonalidade,
                bitola,
                lote,
                observacao,
                quantCaixas,
                disponivel,
                idProduto,
                idPredio
            });

            res.status(201).json(enderecamento);
        } catch (error) {
            console.error('Erro ao criar endereçamento:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async createBulk(req: Request, res: Response): Promise<void> {
        try {
            const { quantidade, enderecamentoData } = req.body;

            // Validação básica
            if (!quantidade || !enderecamentoData) {
                res.status(400).json({
                    error: 'Quantidade e dados do endereçamento são obrigatórios'
                });
                return;
            }

            const result = await this.createBulkEnderecamentoUseCase.execute({
                quantidade,
                enderecamentoData
            });

            res.status(201).json({
                message: `${result.count} endereçamentos criados com sucesso!`,
                success: result.success,
                count: result.count,
                data: result.enderecamentos
            });
        } catch (error) {
            console.error('Erro ao criar endereçamentos em lote:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Validar se o ID foi fornecido e é válido
            if (!id || id === 'undefined' || id === 'null') {
                res.status(400).json({ error: 'ID do endereçamento é obrigatório' });
                return;
            }

            const parsedId = parseInt(id);

            // Validar se o parsing foi bem sucedido
            if (isNaN(parsedId) || parsedId <= 0) {
                res.status(400).json({ error: 'ID do endereçamento deve ser um número válido e maior que zero' });
                return;
            }

            const enderecamento = await this.getEnderecamentoUseCase.execute(parsedId);

            if (!enderecamento) {
                res.status(404).json({ error: 'Endereçamento não encontrado' });
                return;
            }

            res.json(enderecamento);
        } catch (error) {
            console.error('Erro ao buscar endereçamento:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const enderecamentos = await this.listEnderecamentosUseCase.execute();
            res.json(enderecamentos);
        } catch (error) {
            console.error('Erro ao listar endereçamentos:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async getDisponiveis(req: Request, res: Response): Promise<void> {
        try {
            const enderecamentos = await this.listEnderecamentosDisponiveisUseCase.execute();
            res.json(enderecamentos);
        } catch (error) {
            console.error('Erro ao listar endereçamentos disponíveis:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { tonalidade, bitola, lote, observacao, quantCaixas, disponivel, idProduto, idPredio } = req.body;

            const enderecamento = await this.updateEnderecamentoUseCase.execute({
                id: parseInt(id),
                tonalidade,
                bitola,
                lote,
                observacao,
                quantCaixas,
                disponivel,
                idProduto,
                idPredio
            });

            if (!enderecamento) {
                res.status(404).json({ error: 'Endereçamento não encontrado' });
                return;
            }

            res.json(enderecamento);
        } catch (error) {
            console.error('Erro ao atualizar endereçamento:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await this.deleteEnderecamentoUseCase.execute(parseInt(id));

            if (!deleted) {
                res.status(404).json({ error: 'Endereçamento não encontrado' });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar endereçamento:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async search(req: Request, res: Response): Promise<void> {
        try {
            const { q } = req.query;

            if (!q || typeof q !== 'string') {
                res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório' });
                return;
            }

            const enderecamentos = await this.searchEnderecamentosUseCase.execute(q);
            res.json(enderecamentos);
        } catch (error) {
            console.error('Erro ao buscar endereçamentos:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async searchDisponiveis(req: Request, res: Response): Promise<void> {
        try {
            const { codigoFabricante, codigoInterno, codigoBarras, descricao } = req.query;

            const filters = {
                codigoFabricante: codigoFabricante as string,
                codigoInterno: codigoInterno as string,
                codigoBarras: codigoBarras as string,
                descricao: descricao as string
            };

            const enderecamentos = await this.searchEnderecamentosDisponiveisUseCase.execute(filters);
            res.json({ data: enderecamentos });
        } catch (error) {
            console.error('Erro ao buscar endereçamentos disponíveis:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async getByProduto(req: Request, res: Response): Promise<void> {
        try {
            const { idProduto } = req.params;
            // Esta funcionalidade pode usar o repositório diretamente ou criar um use case específico
            // Por simplicidade, vamos retornar um array vazio por enquanto
            res.json([]);
        } catch (error) {
            console.error('Erro ao buscar endereçamentos por produto:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }
}
