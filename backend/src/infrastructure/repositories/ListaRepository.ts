import { IListaRepository } from '../../domain/repositories/IListaRepository';
import { ILista } from '../../domain/entities/Lista';
import { IEnderecamento } from '../../domain/entities/Enderecamento';
import { IProduto } from '../../domain/entities/Produto';
import { IPredio } from '../../domain/entities/Predio';
import { IRua } from '../../domain/entities/Rua';
import ListaModel from '../database/models/ListaModel';
import EnderecamentoModel from '../database/models/EnderecamentoModel';
import ProdutoModel from '../database/models/ProdutoModel';
import PredioModel from '../database/models/PredioModel';
import RuaModel from '../database/models/RuaModel';
import { Transaction } from 'sequelize';
import sequelize from '../database/connection';

interface IEnderecamentoWithRelations extends IEnderecamento {
    produto?: IProduto;
    predio?: IPredio & { rua?: IRua };
}

export class ListaRepository implements IListaRepository {
    async findAll(): Promise<ILista[]> {
        const listas = await ListaModel.findAll({
            order: [['createdAt', 'DESC']]
        });
        return listas.map(lista => this.mapToEntity(lista));
    }

    async findById(id: number): Promise<ILista | null> {
        const lista = await ListaModel.findByPk(id);
        if (!lista) return null;
        return this.mapToEntity(lista);
    }

    async findByNome(nome: string): Promise<ILista | null> {
        const lista = await ListaModel.findOne({
            where: { nome: nome.trim() }
        });
        if (!lista) return null;
        return this.mapToEntity(lista);
    }

    async findAndCountAll(options: {
        offset?: number;
        limit?: number;
        order?: any[];
    }): Promise<{ rows: ILista[]; count: number }> {
        const result = await ListaModel.findAndCountAll({
            offset: options.offset,
            limit: options.limit,
            order: options.order || [['createdAt', 'DESC']]
        });

        return {
            rows: result.rows.map(lista => this.mapToEntity(lista)),
            count: result.count
        };
    }

    async create(listaData: Omit<ILista, 'id'>): Promise<ILista> {
        const lista = await ListaModel.create(listaData);
        return this.mapToEntity(lista);
    }

    async update(id: number, listaData: Partial<ILista>): Promise<ILista | null> {
        const [updatedRows] = await ListaModel.update(listaData, {
            where: { id }
        });

        if (updatedRows === 0) return null;

        const updatedLista = await ListaModel.findByPk(id);
        if (!updatedLista) return null;

        return this.mapToEntity(updatedLista);
    }

    async delete(id: number): Promise<boolean> {
        // Verificar se há endereçamentos associados
        const enderecamentosCount = await EnderecamentoModel.count({
            where: { idLista: id }
        });

        if (enderecamentosCount > 0) {
            throw new Error('Não é possível excluir lista que possui endereçamentos associados');
        }

        const deletedRows = await ListaModel.destroy({
            where: { id }
        });

        return deletedRows > 0;
    }

    async findDisponiveis(): Promise<ILista[]> {
        const listas = await ListaModel.findAll({
            where: { disponivel: true },
            order: [['createdAt', 'DESC']]
        });
        return listas.map(lista => this.mapToEntity(lista));
    }

    async getEnderecamentos(idLista: number): Promise<IEnderecamento[]> {
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
            order: [['createdAt', 'DESC']]
        });

        return enderecamentos.map(enderecamento => this.mapEnderecamentoToEntity(enderecamento));
    }

    async addEnderecamento(idLista: number, idEnderecamento: number): Promise<void> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Verificar se a lista existe e está disponível
            const lista = await ListaModel.findByPk(idLista, { transaction });
            if (!lista) {
                throw new Error('Lista não encontrada');
            }
            if (!lista.disponivel) {
                throw new Error('Não é possível adicionar endereçamentos a uma lista finalizada');
            }

            // Verificar se o endereçamento existe e está disponível
            const enderecamento = await EnderecamentoModel.findByPk(idEnderecamento, { transaction });
            if (!enderecamento) {
                throw new Error('Endereçamento não encontrado');
            }
            if (!enderecamento.disponivel) {
                throw new Error('Endereçamento não está disponível');
            }
            if (enderecamento.idLista) {
                throw new Error('Endereçamento já está associado a uma lista');
            }

            // Associar o endereçamento à lista
            await enderecamento.update({ idLista }, { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async removeEnderecamento(idLista: number, idEnderecamento: number): Promise<void> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Verificar se a lista existe e está disponível
            const lista = await ListaModel.findByPk(idLista, { transaction });
            if (!lista) {
                throw new Error('Lista não encontrada');
            }
            if (!lista.disponivel) {
                throw new Error('Não é possível remover endereçamentos de uma lista finalizada');
            }

            // Verificar se o endereçamento existe e está associado à lista
            const enderecamento = await EnderecamentoModel.findByPk(idEnderecamento, { transaction });
            if (!enderecamento) {
                throw new Error('Endereçamento não encontrado');
            }
            if (enderecamento.idLista !== idLista) {
                throw new Error('Endereçamento não está associado a esta lista');
            }

            // Remover a associação
            await enderecamento.update({ idLista: undefined }, { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async finalizarLista(idLista: number): Promise<void> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Buscar a lista
            const lista = await ListaModel.findByPk(idLista, { transaction });
            if (!lista) {
                throw new Error('Lista não encontrada');
            }
            if (!lista.disponivel) {
                throw new Error('Lista já está finalizada');
            }

            // Buscar todos os endereçamentos da lista
            const enderecamentos = await EnderecamentoModel.findAll({
                where: { idLista },
                include: [{
                    model: ProdutoModel,
                    as: 'produto'
                }],
                transaction
            });

            // Marcar todos os endereçamentos como indisponíveis
            for (const enderecamento of enderecamentos) {
                await enderecamento.update({ disponivel: false }, { transaction });

                // Movimentar estoque: calcular quantidadeCaixa * quantidadeMinVenda e retirar do depósito para o estoque
                if ((enderecamento as any).produto && enderecamento.quantCaixas) {
                    const produto = (enderecamento as any).produto;
                    const quantidadeMovimentar = enderecamento.quantCaixas * produto.quantMinVenda;
                    const novoDeposito = produto.deposito - quantidadeMovimentar;
                    const novoEstoque = produto.estoque + quantidadeMovimentar;

                    if (novoDeposito < 0) {
                        throw new Error(`Estoque insuficiente no depósito para o produto ${produto.descricao}`);
                    }

                    await produto.update({
                        deposito: novoDeposito,
                        estoque: novoEstoque
                    }, { transaction });
                }
            }

            // Finalizar a lista
            await lista.update({ disponivel: false }, { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async desfazerFinalizacao(idLista: number): Promise<void> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Buscar a lista
            const lista = await ListaModel.findByPk(idLista, { transaction });
            if (!lista) {
                throw new Error('Lista não encontrada');
            }
            if (lista.disponivel) {
                throw new Error('Lista não está finalizada');
            }

            // Buscar todos os endereçamentos da lista
            const enderecamentos = await EnderecamentoModel.findAll({
                where: { idLista },
                include: [{
                    model: ProdutoModel,
                    as: 'produto'
                }],
                transaction
            });

            // Marcar todos os endereçamentos como disponíveis
            for (const enderecamento of enderecamentos) {
                await enderecamento.update({ disponivel: true }, { transaction });

                // Movimentar estoque inversamente: devolver as quantidades retiradas do depósito para o estoque original
                if ((enderecamento as any).produto && enderecamento.quantCaixas) {
                    const produto = (enderecamento as any).produto;
                    const quantidadeMovimentar = enderecamento.quantCaixas * produto.quantMinVenda;
                    const novoDeposito = produto.deposito + quantidadeMovimentar;
                    const novoEstoque = produto.estoque - quantidadeMovimentar;

                    if (novoEstoque < 0) {
                        throw new Error(`Estoque insuficiente para devolver para o produto ${produto.descricao}`);
                    }

                    await produto.update({
                        deposito: novoDeposito,
                        estoque: novoEstoque
                    }, { transaction });
                }
            }

            // Reabrir a lista
            await lista.update({ disponivel: true }, { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private mapToEntity(lista: any): ILista {
        return {
            id: lista.id,
            nome: lista.nome,
            disponivel: lista.disponivel,
            createdAt: lista.createdAt,
            updatedAt: lista.updatedAt
        };
    }

    private mapEnderecamentoToEntity(enderecamento: any): IEnderecamentoWithRelations {
        return {
            id: enderecamento.id,
            tonalidade: enderecamento.tonalidade,
            bitola: enderecamento.bitola,
            lote: enderecamento.lote,
            observacao: enderecamento.observacao,
            quantCaixas: enderecamento.quantCaixas,
            disponivel: enderecamento.disponivel,
            idProduto: enderecamento.idProduto,
            idLista: enderecamento.idLista,
            idPredio: enderecamento.idPredio,
            produto: enderecamento.produto ? {
                id: enderecamento.produto.id,
                codInterno: enderecamento.produto.codInterno,
                descricao: enderecamento.produto.descricao,
                quantMinVenda: enderecamento.produto.quantMinVenda,
                codBarras: enderecamento.produto.codBarras,
                deposito: enderecamento.produto.deposito,
                estoque: enderecamento.produto.estoque,
                custo: enderecamento.produto.custo,
                codFabricante: enderecamento.produto.codFabricante,
                quantCaixas: enderecamento.produto.quantCaixas,
                idFornecedor: enderecamento.produto.idFornecedor
            } : undefined,
            predio: enderecamento.predio ? {
                id: enderecamento.predio.id,
                nomePredio: enderecamento.predio.nomePredio,
                vagas: enderecamento.predio.vagas,
                idRua: enderecamento.predio.idRua,
                rua: enderecamento.predio.rua ? {
                    id: enderecamento.predio.rua.id,
                    nomeRua: enderecamento.predio.rua.nomeRua
                } : undefined
            } : undefined,
            createdAt: enderecamento.createdAt,
            updatedAt: enderecamento.updatedAt
        };
    }
}
