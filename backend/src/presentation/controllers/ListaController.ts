import { Request, Response } from 'express';
import { ListaRepository } from '../../infrastructure/repositories/ListaRepository';
import { EnderecamentoRepository } from '../../infrastructure/repositories/EnderecamentoRepository';
import { GetListasUseCase } from '../../application/usecases/GetListasUseCase';
import { GetEnderecamentosDisponiveisUseCase } from '../../application/usecases/GetEnderecamentosDisponiveisUseCase';

export class ListaController {
    private listaRepository: ListaRepository;
    private enderecamentoRepository: EnderecamentoRepository;
    private getListasUseCase: GetListasUseCase;
    private getEnderecamentosDisponiveisUseCase: GetEnderecamentosDisponiveisUseCase;

    constructor() {
        this.listaRepository = new ListaRepository();
        this.enderecamentoRepository = new EnderecamentoRepository();
        this.getListasUseCase = new GetListasUseCase(this.listaRepository);
        this.getEnderecamentosDisponiveisUseCase = new GetEnderecamentosDisponiveisUseCase(this.enderecamentoRepository);
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.getListasUseCase.execute(page, limit);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Listas carregadas com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao carregar listas'
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

            const lista = await this.listaRepository.findById(id);
            if (!lista) {
                res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: lista,
                message: 'Lista encontrada com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao buscar lista'
            });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { nome } = req.body;

            if (!nome || !nome.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Nome da lista é obrigatório'
                });
                return;
            }

            const listaData = {
                nome: nome.trim(),
                disponivel: true
            };

            const lista = await this.listaRepository.create(listaData);

            res.status(201).json({
                success: true,
                data: lista,
                message: 'Lista criada com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao criar lista'
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

            const { nome } = req.body;
            if (!nome || !nome.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Nome da lista é obrigatório'
                });
                return;
            }

            const updatedLista = await this.listaRepository.update(id, {
                nome: nome.trim()
            });

            if (!updatedLista) {
                res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: updatedLista,
                message: 'Lista atualizada com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao atualizar lista'
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

            const deleted = await this.listaRepository.delete(id);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Lista excluída com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao excluir lista'
            });
        }
    }

    async getEnderecamentos(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }

            // Verificar se a lista existe
            const lista = await this.listaRepository.findById(id);
            if (!lista) {
                res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
                return;
            }

            const enderecamentos = await this.listaRepository.getEnderecamentos(id);

            res.status(200).json({
                success: true,
                data: enderecamentos,
                message: 'Endereçamentos da lista carregados com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao carregar endereçamentos da lista'
            });
        }
    }

    async addEnderecamento(req: Request, res: Response): Promise<void> {
        try {
            const idLista = parseInt(req.params.id);
            const idEnderecamento = parseInt(req.params.idEnderecamento);

            if (isNaN(idLista) || isNaN(idEnderecamento)) {
                res.status(400).json({
                    success: false,
                    message: 'IDs inválidos'
                });
                return;
            }

            await this.listaRepository.addEnderecamento(idLista, idEnderecamento);

            res.status(200).json({
                success: true,
                message: 'Endereçamento adicionado à lista com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao adicionar endereçamento à lista'
            });
        }
    }

    async removeEnderecamento(req: Request, res: Response): Promise<void> {
        try {
            const idLista = parseInt(req.params.id);
            const idEnderecamento = parseInt(req.params.idEnderecamento);

            if (isNaN(idLista) || isNaN(idEnderecamento)) {
                res.status(400).json({
                    success: false,
                    message: 'IDs inválidos'
                });
                return;
            }

            await this.listaRepository.removeEnderecamento(idLista, idEnderecamento);

            res.status(200).json({
                success: true,
                message: 'Endereçamento removido da lista com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao remover endereçamento da lista'
            });
        }
    }

    async finalizarLista(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }

            await this.listaRepository.finalizarLista(id);

            res.status(200).json({
                success: true,
                message: 'Lista finalizada com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao finalizar lista'
            });
        }
    }

    async desfazerFinalizacao(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
                return;
            }

            await this.listaRepository.desfazerFinalizacao(id);

            res.status(200).json({
                success: true,
                message: 'Finalização da lista desfeita com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao desfazer finalização da lista'
            });
        }
    }

    async getEnderecamentosDisponiveis(req: Request, res: Response): Promise<void> {
        try {
            const enderecamentos = await this.getEnderecamentosDisponiveisUseCase.execute();

            res.status(200).json({
                success: true,
                data: enderecamentos,
                message: 'Endereçamentos disponíveis carregados com sucesso'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao carregar endereçamentos disponíveis'
            });
        }
    }
}
