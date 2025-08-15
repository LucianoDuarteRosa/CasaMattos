import { IEstoqueItemRepository } from '../../domain/repositories/IEstoqueItemRepository';
import { IEstoqueItem, EstoqueItem } from '../../domain/entities/EstoqueItem';
import EstoqueItemModel from '../database/models/EstoqueItemModel';
import { Sequelize } from 'sequelize';

export class EstoqueItemRepository implements IEstoqueItemRepository {
    async create(estoqueItem: Omit<IEstoqueItem, 'id'>): Promise<EstoqueItem> {
        const novoEstoqueItem = await EstoqueItemModel.create(estoqueItem);
        const data = novoEstoqueItem.toJSON() as IEstoqueItem;

        return new EstoqueItem(
            data.id,
            data.produtoId,
            data.lote,
            data.ton,
            data.bit,
            data.quantidade,
            data.createdAt,
            data.updatedAt
        );
    }

    async findById(id: number): Promise<EstoqueItem | null> {
        const estoqueItem = await EstoqueItemModel.findByPk(id);
        if (!estoqueItem) return null;

        const data = estoqueItem.toJSON() as IEstoqueItem;
        return new EstoqueItem(
            data.id,
            data.produtoId,
            data.lote,
            data.ton,
            data.bit,
            data.quantidade,
            data.createdAt,
            data.updatedAt
        );
    }

    async findByProdutoId(produtoId: number): Promise<EstoqueItem[]> {
        const estoqueItems = await EstoqueItemModel.findAll({
            where: { produtoId },
            order: [['lote', 'ASC'], ['ton', 'ASC'], ['bit', 'ASC']]
        });

        return estoqueItems.map((item: any) => {
            const data = item.toJSON() as IEstoqueItem;
            return new EstoqueItem(
                data.id,
                data.produtoId,
                data.lote,
                data.ton,
                data.bit,
                data.quantidade,
                data.createdAt,
                data.updatedAt
            );
        });
    }

    async findByCaracteristicas(produtoId: number, lote: string, ton: string, bit: string): Promise<EstoqueItem | null> {
        const estoqueItem = await EstoqueItemModel.findOne({
            where: { produtoId, lote, ton, bit }
        });

        if (!estoqueItem) return null;

        const data = estoqueItem.toJSON() as IEstoqueItem;
        return new EstoqueItem(
            data.id,
            data.produtoId,
            data.lote,
            data.ton,
            data.bit,
            data.quantidade,
            data.createdAt,
            data.updatedAt
        );
    }

    async upsertByCaracteristicas(produtoId: number, lote: string, ton: string, bit: string, quantidade: number): Promise<EstoqueItem> {
        const itemExistente = await this.findByCaracteristicas(produtoId, lote, ton, bit);

        if (itemExistente) {
            // Se existe, soma a quantidade
            const novaQuantidade = itemExistente.quantidade + quantidade;
            const itemAtualizado = await this.update(itemExistente.id, { quantidade: novaQuantidade });
            return itemAtualizado!;
        } else {
            // Se não existe, cria novo
            return await this.create({ produtoId, lote, ton, bit, quantidade });
        }
    }

    async update(id: number, estoqueItem: Partial<IEstoqueItem>): Promise<EstoqueItem | null> {
        const item = await EstoqueItemModel.findByPk(id);
        if (!item) return null;

        await item.update(estoqueItem);
        const data = item.toJSON() as IEstoqueItem;

        return new EstoqueItem(
            data.id,
            data.produtoId,
            data.lote,
            data.ton,
            data.bit,
            data.quantidade,
            data.createdAt,
            data.updatedAt
        );
    }

    async delete(id: number): Promise<boolean> {
        const result = await EstoqueItemModel.destroy({ where: { id } });
        return result > 0;
    }

    async findAll(): Promise<EstoqueItem[]> {
        const estoqueItems = await EstoqueItemModel.findAll({
            order: [['produtoId', 'ASC'], ['lote', 'ASC'], ['ton', 'ASC'], ['bit', 'ASC']]
        });

        return estoqueItems.map((item: any) => {
            const data = item.toJSON() as IEstoqueItem;
            return new EstoqueItem(
                data.id,
                data.produtoId,
                data.lote,
                data.ton,
                data.bit,
                data.quantidade,
                data.createdAt,
                data.updatedAt
            );
        });
    }

    async calcularEstoqueProduto(produtoId: number): Promise<number> {
        const resultado = await EstoqueItemModel.findOne({
            where: { produtoId },
            attributes: [[Sequelize.fn('SUM', Sequelize.col('quantidade')), 'total']]
        });

        return resultado ? Number((resultado.toJSON() as any).total) || 0 : 0;
    }
}