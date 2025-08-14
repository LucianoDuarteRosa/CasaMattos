import { ILogRepository } from '../../domain/repositories/ILogRepository';
import { ILog } from '../../domain/entities/Log';
import LogModel from '../database/models/LogModel';
import { Op } from 'sequelize';

export class LogRepository implements ILogRepository {
    async create(logData: Omit<ILog, 'id' | 'dataHora'>): Promise<ILog> {
        const result = await LogModel.create({
            ...logData,
            dataHora: new Date()
        });
        return this.toEntity(result);
    }

    async findByUsuario(idUsuario: number, limit: number = 50): Promise<ILog[]> {
        const results = await LogModel.findAll({
            where: { idUsuario },
            order: [['dataHora', 'DESC']],
            limit
        });
        return results.map(this.toEntity);
    }

    async findByEntidade(entidade: string, limit: number = 50): Promise<ILog[]> {
        const results = await LogModel.findAll({
            where: { entidade },
            order: [['dataHora', 'DESC']],
            limit
        });
        return results.map(this.toEntity);
    }

    async findRecent(limit: number = 100): Promise<ILog[]> {
        const results = await LogModel.findAll({
            order: [['dataHora', 'DESC']],
            limit
        });
        return results.map(this.toEntity);
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<ILog[]> {
        const results = await LogModel.findAll({
            where: {
                dataHora: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['dataHora', 'DESC']]
        });
        return results.map(this.toEntity);
    }

    private toEntity(model: LogModel): ILog {
        return {
            id: model.id,
            idUsuario: model.idUsuario,
            entidade: model.entidade,
            acao: model.acao,
            descricao: model.descricao,
            dataHora: model.dataHora
        };
    }
}
