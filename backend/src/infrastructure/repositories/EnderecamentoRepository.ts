import { IEnderecamentoRepository } from '../../domain/repositories/IEnderecamentoRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';
import EnderecamentoModel from '../database/models/EnderecamentoModel';
import ProdutoModel from '../database/models/ProdutoModel';
import PredioModel from '../database/models/PredioModel';
import RuaModel from '../database/models/RuaModel';
import { Op } from 'sequelize';

export class EnderecamentoRepository implements IEnderecamentoRepository {
    async create(enderecamentoData: Omit<IEnderecamento, 'id'>): Promise<IEnderecamento> {
        const enderecamento = await EnderecamentoModel.create(enderecamentoData);
        return this.mapToEntity(enderecamento);
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
            where: { idProduto },
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
        const enderecamentos = await EnderecamentoModel.findAll({
            include: [
                {
                    model: ProdutoModel,
                    as: 'produto',
                    where: {
                        [Op.or]: [
                            { codInterno: { [Op.like]: `%${termo}%` } },
                            { descricao: { [Op.iLike]: `%${termo}%` } },
                            { codBarras: { [Op.like]: `%${termo}%` } },
                            { codFabricante: { [Op.iLike]: `%${termo}%` } }
                        ]
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

    private mapToEntity(model: any): IEnderecamento {
        return {
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
    }
}
