import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { IProduto } from '../../domain/entities/Produto';
import ProdutoModel from '../database/models/ProdutoModel';
import { Op } from 'sequelize';

export class ProdutoRepository implements IProdutoRepository {
    async create(produto: Omit<IProduto, 'id'>): Promise<IProduto> {
        const novoProduto = await ProdutoModel.create(produto);
        return novoProduto.toJSON() as IProduto;
    }

    async findById(id: number): Promise<IProduto | null> {
        const produto = await ProdutoModel.findByPk(id);
        return produto ? produto.toJSON() as IProduto : null;
    }

    async findAll(): Promise<IProduto[]> {
        // Aqui não é possível filtrar endereçamentos diretamente, mas o cálculo do depósito deve considerar apenas endereçamentos disponíveis.
        // Certifique-se de que o serviço/camada que calcula o depósito já usa apenas endereçamentos disponiveis (ajustado no EnderecamentoRepository).
        const produtos = await ProdutoModel.findAll({
            order: [['descricao', 'ASC']]
        });
        return produtos.map((produto: any) => produto.toJSON() as IProduto);
    }

    async update(id: number, data: Partial<IProduto>): Promise<IProduto | null> {
        const produto = await ProdutoModel.findByPk(id);
        if (!produto) {
            return null;
        }

        await produto.update(data);
        return produto.toJSON() as IProduto;
    }

    async delete(id: number): Promise<boolean> {
        const rowsAffected = await ProdutoModel.destroy({ where: { id } });
        return rowsAffected > 0;
    }

    async findByCodInterno(codInterno: number): Promise<IProduto | null> {
        const produto = await ProdutoModel.findOne({
            where: { codInterno }
        });
        return produto ? produto.toJSON() as IProduto : null;
    }

    async findByCodigoBarra(codBarra: string): Promise<IProduto | null> {
        const produto = await ProdutoModel.findOne({
            where: { codBarras: codBarra }
        });
        return produto ? produto.toJSON() as IProduto : null;
    }

    async findByDescricao(descricao: string): Promise<IProduto[]> {
        const produtos = await ProdutoModel.findAll({
            where: {
                descricao: {
                    [Op.iLike]: `%${descricao}%`
                }
            },
            order: [['descricao', 'ASC']]
        });
        return produtos.map((produto: any) => produto.toJSON() as IProduto);
    }

    async findByFornecedor(idFornecedor: number): Promise<IProduto[]> {
        const produtos = await ProdutoModel.findAll({
            where: { idFornecedor },
            order: [['descricao', 'ASC']]
        });
        return produtos.map((produto: any) => produto.toJSON() as IProduto);
    }

    async search(term: string): Promise<IProduto[]> {
        const searchConditions: any[] = [
            {
                descricao: {
                    [Op.iLike]: `%${term}%`
                }
            },
            {
                codBarras: {
                    [Op.iLike]: `%${term}%`
                }
            },
            {
                codFabricante: {
                    [Op.iLike]: `%${term}%`
                }
            }
        ];

        // Se o termo for numérico, também busca por código interno
        if (!isNaN(Number(term))) {
            searchConditions.push({
                codInterno: Number(term)
            });
        }

        const produtos = await ProdutoModel.findAll({
            where: {
                [Op.or]: searchConditions
            },
            order: [['descricao', 'ASC']]
        });
        return produtos.map((produto: any) => produto.toJSON() as IProduto);
    }

    async findWithPagination(
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<{ produtos: IProduto[], total: number, totalPages: number }> {
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (search) {
            whereClause = {
                [Op.or]: [
                    {
                        descricao: {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        codBarras: {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        codFabricante: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                ]
            };
        }

        const { count, rows } = await ProdutoModel.findAndCountAll({
            where: whereClause,
            order: [['descricao', 'ASC']],
            limit,
            offset
        });

        return {
            produtos: rows.map((produto: any) => produto.toJSON() as IProduto),
            total: count,
            totalPages: Math.ceil(count / limit)
        };
    }
}
