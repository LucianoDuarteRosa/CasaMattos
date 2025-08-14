import { Op } from 'sequelize';
import { IRuaRepository } from '../../domain/repositories/IRuaRepository';
import { IRua } from '../../domain/entities/Rua';
import RuaModel from '../database/models/RuaModel';

export class RuaRepository implements IRuaRepository {
    async create(data: Omit<IRua, 'id' | 'createdAt' | 'updatedAt'>): Promise<IRua> {
        const rua = await RuaModel.create({
            nomeRua: data.nomeRua
        });

        return this.mapToEntity(rua);
    }

    async findById(id: number): Promise<IRua | null> {
        const rua = await RuaModel.findByPk(id);
        return rua ? this.mapToEntity(rua) : null;
    }

    async findAll(): Promise<IRua[]> {
        const ruas = await RuaModel.findAll({
            order: [['nomeRua', 'ASC']]
        });
        return ruas.map(rua => this.mapToEntity(rua));
    }

    async update(id: number, data: Partial<Omit<IRua, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IRua | null> {
        const rua = await RuaModel.findByPk(id);
        if (!rua) {
            return null;
        }

        await rua.update({
            nomeRua: data.nomeRua || rua.nomeRua
        });

        return this.mapToEntity(rua);
    }

    async delete(id: number): Promise<boolean> {
        const deleted = await RuaModel.destroy({
            where: { id }
        });
        return deleted > 0;
    }

    async findByNome(nomeRua: string): Promise<IRua[]> {
        const ruas = await RuaModel.findAll({
            where: {
                nomeRua: {
                    [Op.iLike]: `%${nomeRua}%`
                }
            },
            order: [['nomeRua', 'ASC']]
        });
        return ruas.map(rua => this.mapToEntity(rua));
    }

    async findByNomeExato(nomeRua: string): Promise<IRua | null> {
        const rua = await RuaModel.findOne({
            where: {
                nomeRua: {
                    [Op.iLike]: nomeRua
                }
            }
        });
        return rua ? this.mapToEntity(rua) : null;
    }

    private mapToEntity(model: RuaModel): IRua {
        return {
            id: model.id,
            nomeRua: model.nomeRua,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt
        };
    }
}
