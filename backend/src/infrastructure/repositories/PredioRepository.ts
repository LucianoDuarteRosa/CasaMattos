import { IPredioRepository } from '../../domain/repositories/IPredioRepository';
import { IPredio } from '../../domain/entities/Predio';
import PredioModel from '../database/models/PredioModel';
import RuaModel from '../database/models/RuaModel';
import { Op } from 'sequelize';

export class PredioRepository implements IPredioRepository {
    async create(predioData: Omit<IPredio, 'id'>): Promise<IPredio> {
        const predio = await PredioModel.create(predioData);
        return this.mapToEntity(predio);
    }

    async findById(id: number): Promise<IPredio | null> {
        const predio = await PredioModel.findByPk(id, {
            include: [{
                model: RuaModel,
                as: 'rua'
            }]
        });

        if (!predio) {
            return null;
        }

        return this.mapToEntity(predio);
    }

    async findAll(): Promise<IPredio[]> {
        const predios = await PredioModel.findAll({
            include: [{
                model: RuaModel,
                as: 'rua'
            }],
            order: [
                [{ model: RuaModel, as: 'rua' }, 'nomeRua', 'ASC'],
                ['id', 'ASC']
            ]
        });

        return predios.map(predio => this.mapToEntity(predio));
    }

    async findByRua(idRua: number): Promise<IPredio[]> {
        const predios = await PredioModel.findAll({
            where: { idRua },
            include: [{
                model: RuaModel,
                as: 'rua'
            }],
            order: [
                [{ model: RuaModel, as: 'rua' }, 'nomeRua', 'ASC'],
                ['id', 'ASC']
            ]
        });

        return predios.map(predio => this.mapToEntity(predio));
    }

    async findByNome(nomePredio: string): Promise<IPredio[]> {
        const predios = await PredioModel.findAll({
            where: {
                nomePredio: {
                    [Op.iLike]: `%${nomePredio}%`
                }
            },
            include: [{
                model: RuaModel,
                as: 'rua'
            }],
            order: [
                [{ model: RuaModel, as: 'rua' }, 'nomeRua', 'ASC'],
                ['id', 'ASC']
            ]
        });

        return predios.map(predio => this.mapToEntity(predio));
    }

    async update(id: number, data: Partial<IPredio>): Promise<IPredio | null> {
        await PredioModel.update(data, {
            where: { id }
        });

        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const deletedRows = await PredioModel.destroy({
            where: { id }
        });

        return deletedRows > 0;
    }

    private mapToEntity(model: any): IPredio {
        return {
            id: model.id,
            nomePredio: model.nomePredio,
            vagas: model.vagas,
            idRua: model.idRua,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt
        };
    }
}
