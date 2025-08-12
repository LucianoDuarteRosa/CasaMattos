import { Request, Response } from 'express';
import { FornecedorRepository } from '../../infrastructure/repositories/FornecedorRepository';
import { CreateFornecedorUseCase } from '../../application/usecases/CreateFornecedorUseCase';
import { GetFornecedorUseCase } from '../../application/usecases/GetFornecedorUseCase';
import { ListFornecedoresUseCase } from '../../application/usecases/ListFornecedoresUseCase';
import { UpdateFornecedorUseCase } from '../../application/usecases/UpdateFornecedorUseCase';
import { DeleteFornecedorUseCase } from '../../application/usecases/DeleteFornecedorUseCase';
import { SearchFornecedoresUseCase } from '../../application/usecases/SearchFornecedoresUseCase';

export class FornecedorController {
    private fornecedorRepository: FornecedorRepository;
    private createFornecedorUseCase: CreateFornecedorUseCase;
    private getFornecedorUseCase: GetFornecedorUseCase;
    private listFornecedoresUseCase: ListFornecedoresUseCase;
    private updateFornecedorUseCase: UpdateFornecedorUseCase;
    private deleteFornecedorUseCase: DeleteFornecedorUseCase;
    private searchFornecedoresUseCase: SearchFornecedoresUseCase;

    constructor() {
        this.fornecedorRepository = new FornecedorRepository();
        this.createFornecedorUseCase = new CreateFornecedorUseCase(this.fornecedorRepository);
        this.getFornecedorUseCase = new GetFornecedorUseCase(this.fornecedorRepository);
        this.listFornecedoresUseCase = new ListFornecedoresUseCase(this.fornecedorRepository);
        this.updateFornecedorUseCase = new UpdateFornecedorUseCase(this.fornecedorRepository);
        this.deleteFornecedorUseCase = new DeleteFornecedorUseCase(this.fornecedorRepository);
        this.searchFornecedoresUseCase = new SearchFornecedoresUseCase(this.fornecedorRepository);
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const fornecedor = await this.createFornecedorUseCase.execute(req.body);
            res.status(201).json({
                success: true,
                data: fornecedor,
                message: 'Fornecedor criado com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao criar fornecedor'
            });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }

            const fornecedor = await this.getFornecedorUseCase.execute(id);
            res.status(200).json({
                success: true,
                data: fornecedor
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message || 'Fornecedor não encontrado'
            });
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const fornecedores = await this.listFornecedoresUseCase.execute();
            res.status(200).json({
                success: true,
                data: fornecedores,
                total: fornecedores.length
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao listar fornecedores'
            });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }

            const fornecedor = await this.updateFornecedorUseCase.execute(id, req.body);
            res.status(200).json({
                success: true,
                data: fornecedor,
                message: 'Fornecedor atualizado com sucesso'
            });
        } catch (error: any) {
            const statusCode = error.message.includes('não encontrado') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Erro ao atualizar fornecedor'
            });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }

            const sucesso = await this.deleteFornecedorUseCase.execute(id);
            if (sucesso) {
                res.status(200).json({
                    success: true,
                    message: 'Fornecedor deletado com sucesso'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro ao deletar fornecedor'
                });
            }
        } catch (error: any) {
            const statusCode = error.message.includes('não encontrado') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Erro ao deletar fornecedor'
            });
        }
    }

    async search(req: Request, res: Response): Promise<void> {
        try {
            const searchTerm = req.query.q as string;
            const fornecedores = await this.searchFornecedoresUseCase.execute(searchTerm || '');

            res.status(200).json({
                success: true,
                data: fornecedores,
                total: fornecedores.length,
                searchTerm: searchTerm || ''
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar fornecedores'
            });
        }
    }
}
