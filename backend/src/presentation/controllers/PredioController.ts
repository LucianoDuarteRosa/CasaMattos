import { Request, Response } from 'express';
import { PredioRepository } from '../../infrastructure/repositories/PredioRepository';
import { CreatePredioUseCase } from '../../application/usecases/CreatePredioUseCase';
import { GetPredioUseCase } from '../../application/usecases/GetPredioUseCase';
import { ListPrediosUseCase } from '../../application/usecases/ListPrediosUseCase';
import { UpdatePredioUseCase } from '../../application/usecases/UpdatePredioUseCase';
import { DeletePredioUseCase } from '../../application/usecases/DeletePredioUseCase';
import { SearchPrediosUseCase } from '../../application/usecases/SearchPrediosUseCase';
import { loggingService } from '../../application/services/LoggingService';

export class PredioController {
    private predioRepository: PredioRepository;
    private createPredioUseCase: CreatePredioUseCase;
    private getPredioUseCase: GetPredioUseCase;
    private listPrediosUseCase: ListPrediosUseCase;
    private updatePredioUseCase: UpdatePredioUseCase;
    private deletePredioUseCase: DeletePredioUseCase;
    private searchPrediosUseCase: SearchPrediosUseCase;

    constructor() {
        this.predioRepository = new PredioRepository();
        this.createPredioUseCase = new CreatePredioUseCase(this.predioRepository);
        this.getPredioUseCase = new GetPredioUseCase(this.predioRepository);
        this.listPrediosUseCase = new ListPrediosUseCase(this.predioRepository);
        this.updatePredioUseCase = new UpdatePredioUseCase(this.predioRepository, loggingService);
        this.deletePredioUseCase = new DeletePredioUseCase(this.predioRepository, loggingService);
        this.searchPrediosUseCase = new SearchPrediosUseCase(this.predioRepository);
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { nomePredio, vagas, idRua, executorUserId } = req.body;

            const predio = await this.createPredioUseCase.execute({
                nomePredio,
                vagas,
                idRua,
                executorUserId
            });

            res.status(201).json(predio);
        } catch (error) {
            console.error('Erro ao criar prédio:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const predio = await this.getPredioUseCase.execute(parseInt(id));

            if (!predio) {
                res.status(404).json({ error: 'Prédio não encontrado' });
                return;
            }

            res.json(predio);
        } catch (error) {
            console.error('Erro ao buscar prédio:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const predios = await this.listPrediosUseCase.execute();
            res.json(predios);
        } catch (error) {
            console.error('Erro ao listar prédios:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { nomePredio, vagas, idRua, executorUserId } = req.body;

            const predio = await this.updatePredioUseCase.execute({
                id: parseInt(id),
                nomePredio,
                vagas,
                idRua,
                executorUserId
            });

            if (!predio) {
                res.status(404).json({ error: 'Prédio não encontrado' });
                return;
            }

            res.json(predio);
        } catch (error) {
            console.error('Erro ao atualizar prédio:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { executorUserId } = req.body;
            const deleted = await this.deletePredioUseCase.execute(parseInt(id), executorUserId);

            if (!deleted) {
                res.status(404).json({ error: 'Prédio não encontrado' });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar prédio:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async search(req: Request, res: Response): Promise<void> {
        try {
            const { q } = req.query;
            const predios = await this.searchPrediosUseCase.execute(q as string || '');
            res.json(predios);
        } catch (error) {
            console.error('Erro ao buscar prédios:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }
}
