import { IEnderecamentoRepository, SearchEnderecamentosDisponiveisFilters } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';
import EnderecamentoModel from '../database/models/EnderecamentoModel';
import ProdutoModel from '../database/models/ProdutoModel';
import PredioModel from '../database/models/PredioModel';
import RuaModel from '../database/models/RuaModel';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database/connection';

export class EnderecamentoRepository implements IEnderecamentoRepository {
    async create(enderecamentoData: Omit<IEnderecamento, 'id'>): Promise<IEnderecamento> {
        const enderecamento = await EnderecamentoModel.create(enderecamentoData);
        return this.mapToEntity(enderecamento);
    }

    async createBulk(enderecamentoData: Omit<IEnderecamento, 'id'>, quantidade: number): Promise<IEnderecamento[]> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const enderecamentos: any[] = [];

            // Criar múltiplos endereçamentos dentro de uma transação
            for (let i = 0; i < quantidade; i++) {
                const enderecamento = await EnderecamentoModel.create(enderecamentoData, { transaction });
                enderecamentos.push(enderecamento);
            }

            // Commit da transação
            await transaction.commit();

            // Retornar os endereçamentos criados mapeados para entidades
            return enderecamentos.map(enderecamento => this.mapToEntity(enderecamento));
        } catch (error) {
            // Rollback em caso de erro
            await transaction.rollback();
            throw error;
        }
    }

    async findById(id: number): Promise<IEnderecamento | null> {
        const enderecamento = await EnderecamentoModel.findByPk(id, {
            include: [
                {
                    model: ProdutoModel,
                    as: 'produto'
                },
                {
                    model: PredioModel,
                    as: 'predio',
                    include: [{
                        model: RuaModel,
                        as: 'rua'
                    }]
                }
            ]
        });

        if (!enderecamento) {
            return null;
        }

        return this.mapToEntity(enderecamento);
    }

    async findAll(): Promise<IEnderecamento[]> {
        const enderecamentos = await EnderecamentoModel.findAll({
            include: [
                {
                    model: ProdutoModel,
                    as: 'produto'
                },
                {
                    model: PredioModel,
                    as: 'predio',
                    include: [{
                        model: RuaModel,
                        as: 'rua'
                    }]
                }
            ],
            order: [
                ['id', 'ASC']
            ]
        });

        return enderecamentos.map(enderecamento => this.mapToEntity(enderecamento));
    }

    async update(id: number, data: Partial<IEnderecamento>): Promise<IEnderecamento | null> {
        await EnderecamentoModel.update(data, {
            where: { id }
        });

        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const deletedRows = await EnderecamentoModel.destroy({
            where: { id }
        });

        return deletedRows > 0;
    }

    async findByLista(idLista: number): Promise<IEnderecamento[]> {
        const enderecamentos = await EnderecamentoModel.findAll({
            where: { idLista },
            include: [
                {
                    model: ProdutoModel,
                    as: 'produto'
                },
                {
                    model: PredioModel,
                    as: 'predio',
                    include: [{
                        model: RuaModel,
                        as: 'rua'
                    }]
                }
            ],
            order: [
                ['id', 'ASC']
            ]
        });

        return enderecamentos.map(enderecamento => this.mapToEntity(enderecamento));
    }

    async findByProduto(idProduto: number): Promise<IEnderecamento[]> {
        const enderecamentos = await EnderecamentoModel.findAll({
            where: { idProduto, disponivel: true },
            include: [
                {
                    model: ProdutoModel,
                    as: 'produto'
                },
                {
                    model: PredioModel,
                    as: 'predio',
                    include: [{
                        model: RuaModel,
                        as: 'rua'
                    }]
                }
            ],
            order: [
                ['id', 'ASC']
            ]
        });

        return enderecamentos.map(enderecamento => this.mapToEntity(enderecamento));
    }

    async findDisponiveis(): Promise<IEnderecamento[]> {
        const enderecamentos = await EnderecamentoModel.findAll({
            where: { disponivel: true },
            include: [
                {
                    model: ProdutoModel,
                    as: 'produto'
                },
                {
                    model: PredioModel,
                    as: 'predio',
                    include: [{
                        model: RuaModel,
                        as: 'rua'
                    }]
                }
            ],
            order: [
                ['id', 'ASC']
            ]
        });

        return enderecamentos.map(enderecamento => this.mapToEntity(enderecamento));
    }

    async findByCodInternoOuDescricao(termo: string): Promise<IEnderecamento[]> {
        const whereConditions: any[] = [
            { descricao: { [Op.iLike]: `%${termo}%` } },
            { codFabricante: { [Op.iLike]: `%${termo}%` } }
        ];

        // Se o termo for numérico, busca por codInterno exato
        const termoNumerico = parseInt(termo);
        if (!isNaN(termoNumerico)) {
            whereConditions.push({ codInterno: termoNumerico });
        }

        // Para códigos de barras, usar LIKE apenas se não for vazio
        if (termo.trim()) {
            whereConditions.push({ codBarras: { [Op.like]: `%${termo}%` } });
        }

        const enderecamentos = await EnderecamentoModel.findAll({
            include: [
                {
                    model: ProdutoModel,
                    as: 'produto',
                    where: {
                        [Op.or]: whereConditions
                    }
                },
                {
                    model: PredioModel,
                    as: 'predio',
                    include: [{
                        model: RuaModel,
                        as: 'rua'
                    }]
                }
            ],
            order: [
                ['id', 'ASC']
            ]
        });

        return enderecamentos.map(enderecamento => this.mapToEntity(enderecamento));
    }

    async searchAvailableByFilters(filters: SearchEnderecamentosDisponiveisFilters): Promise<IEnderecamento[]> {
        const whereConditions: any = {
            disponivel: true // Apenas endereçamentos disponíveis
        };

        const produtoWhere: any = {};

        // Construir condições de filtro baseado nos parâmetros
        if (filters.codigoFabricante) {
            produtoWhere.codigoFabricante = {
                [Op.like]: `%${filters.codigoFabricante}%`
            };
        }

        if (filters.codigoInterno) {
            produtoWhere.codigoInterno = {
                [Op.like]: `%${filters.codigoInterno}%`
            };
        }

        if (filters.codigoBarras) {
            produtoWhere.codigoBarras = {
                [Op.like]: `%${filters.codigoBarras}%`
            };
        }

        if (filters.descricao) {
            produtoWhere.descricao = {
                [Op.like]: `%${filters.descricao}%`
            };
        }

        const enderecamentos = await EnderecamentoModel.findAll({
            where: whereConditions,
            include: [
                {
                    model: ProdutoModel,
                    as: 'produto',
                    where: Object.keys(produtoWhere).length > 0 ? produtoWhere : undefined,
                    required: Object.keys(produtoWhere).length > 0
                },
                {
                    model: PredioModel,
                    as: 'predio',
                    include: [{
                        model: RuaModel,
                        as: 'rua'
                    }]
                }
            ],
            order: [
                ['id', 'ASC']
            ]
        });

        return enderecamentos.map(enderecamento => this.mapToEntity(enderecamento));
    }

    private mapToEntity(model: any): IEnderecamento {
        const entity: any = {
            id: model.id,
            tonalidade: model.tonalidade,
            bitola: model.bitola,
            lote: model.lote,
            observacao: model.observacao,
            quantCaixas: model.quantCaixas,
            disponivel: model.disponivel,
            idProduto: model.idProduto,
            idLista: model.idLista,
            idPredio: model.idPredio,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt
        };

        // Incluir dados relacionados se existirem
        if (model.produto) {
            entity.produto = {
                id: model.produto.id,
                codInterno: model.produto.codInterno,
                descricao: model.produto.descricao,
                codBarras: model.produto.codBarras,
                codFabricante: model.produto.codFabricante,
                quantMinVenda: model.produto.quantMinVenda,
                deposito: model.produto.deposito,
                estoque: model.produto.estoque,
                custo: model.produto.custo,
                quantCaixas: model.produto.quantCaixas,
                idFornecedor: model.produto.idFornecedor,
                createdAt: model.produto.createdAt,
                updatedAt: model.produto.updatedAt
            };
        }

        if (model.predio) {
            entity.predio = {
                id: model.predio.id,
                nomePredio: model.predio.nomePredio,
                vagas: model.predio.vagas,
                idRua: model.predio.idRua,
                createdAt: model.predio.createdAt,
                updatedAt: model.predio.updatedAt
            };

            // Incluir dados da rua se existirem
            if (model.predio.rua) {
                entity.predio.rua = {
                    id: model.predio.rua.id,
                    nomeRua: model.predio.rua.nomeRua,
                    createdAt: model.predio.rua.createdAt,
                    updatedAt: model.predio.rua.updatedAt
                };
            }
        }

        return entity;
    }
}
