import { ILog } from '../entities/Log';

export interface ILogRepository {
    create(log: Omit<ILog, 'id' | 'dataHora'>): Promise<ILog>;
    findByUsuario(idUsuario: number, limit?: number): Promise<ILog[]>;
    findByEntidade(entidade: string, limit?: number): Promise<ILog[]>;
    findRecent(limit?: number): Promise<ILog[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<ILog[]>;
}
