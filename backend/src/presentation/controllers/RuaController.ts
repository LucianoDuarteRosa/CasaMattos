import { Request, Response } from 'express';
import { RuaRepository } from '../../infrastructure/repositories/RuaRepository';
import { CreateRuaUseCase } from '../../application/usecases/CreateRuaUseCase';
import { GetRuaUseCase } from '../../application/usecases/GetRuaUseCase';
import { ListRuasUseCase } from '../../application/usecases/ListRuasUseCase';
import { UpdateRuaUseCase } from '../../application/usecases/UpdateRuaUseCase';
import { DeleteRuaUseCase } from '../../application/usecases/DeleteRuaUseCase';
import { SearchRuasUseCase } from '../../application/usecases/SearchRuasUseCase';

export class RuaController {
    private ruaRepository: RuaRepository;
    private createRuaUseCase: CreateRuaUseCase;
    private getRuaUseCase: GetRuaUseCase;
    private listRuasUseCase: ListRuasUseCase;
    private updateRuaUseCase: UpdateRuaUseCase;
    private deleteRuaUseCase: DeleteRuaUseCase;
    private searchRuasUseCase: SearchRuasUseCase;

    constructor() {
        this.ruaRepository = new RuaRepository();
        this.createRuaUseCase = new CreateRuaUseCase(this.ruaRepository);
        this.getRuaUseCase = new GetRuaUseCase(this.ruaRepository);
        this.listRuasUseCase = new ListRuasUseCase(this.ruaRepository);
        this.updateRuaUseCase = new UpdateRuaUseCase(this.ruaRepository);
        this.deleteRuaUseCase = new DeleteRuaUseCase(this.ruaRepository);
        this.searchRuasUseCase = new SearchRuasUseCase(this.ruaRepository);
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { nomeRua } = req.body;

            const rua = await this.createRuaUseCase.execute({
                nomeRua
            });

            res.status(201).json(rua);
        } catch (error) {
            console.error('Erro ao criar rua:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const rua = await this.getRuaUseCase.execute(parseInt(id));

            if (!rua) {
                res.status(404).json({ error: 'Rua não encontrada' });
                return;
            }

            res.json(rua);
        } catch (error) {
            console.error('Erro ao buscar rua:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const ruas = await this.listRuasUseCase.execute();
            res.json(ruas);
        } catch (error) {
            console.error('Erro ao listar ruas:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { nomeRua } = req.body;

            const rua = await this.updateRuaUseCase.execute({
                id: parseInt(id),
                nomeRua
            });

            if (!rua) {
                res.status(404).json({ error: 'Rua não encontrada' });
                return;
            }

            res.json(rua);
        } catch (error) {
            console.error('Erro ao atualizar rua:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await this.deleteRuaUseCase.execute(parseInt(id));

            if (!deleted) {
                res.status(404).json({ error: 'Rua não encontrada' });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar rua:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }

    async search(req: Request, res: Response): Promise<void> {
        try {
            const { q } = req.query;
            const ruas = await this.searchRuasUseCase.execute(q as string || '');
            res.json(ruas);
        } catch (error) {
            console.error('Erro ao buscar ruas:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }
}
