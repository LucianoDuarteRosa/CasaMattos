import { Request, Response } from 'express';
import Setting from '../../domain/entities/Setting';
import { loggingService } from '../../application/services/LoggingService';

export const getSettings = async (req: Request, res: Response) => {
    const { type } = req.query;
    const where = type ? { type } : {};
    const settings = await Setting.findAll({ where });
    res.json(settings);
};

export const getSetting = async (req: Request, res: Response) => {
    const { id } = req.params;
    const setting = await Setting.findByPk(id);
    if (!setting) return res.status(404).json({ error: 'Configuração não encontrada' });
    res.json(setting);
};

export const createSetting = async (req: Request, res: Response) => {
    const { key, value, type, active } = req.body;
    const setting = await Setting.create({ key, value, type, active });
    const userId = req.body.executorUserId;
    if (userId) {
        await loggingService.logCreate(userId, 'Configuração', setting.toJSON(), 'Configuração criada');
    }
    res.status(201).json(setting);
};

export const updateSetting = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { key, value, type, active } = req.body;
    const setting = await Setting.findByPk(id);
    if (!setting) return res.status(404).json({ error: 'Configuração não encontrada' });
    const oldData = setting.toJSON();
    await setting.update({ key, value, type, active });
    const userId = req.body.executorUserId;
    if (userId) {
        await loggingService.logUpdate(userId, 'Configuração', oldData, setting.toJSON(), 'Configuração atualizada');
    }
    res.json(setting);
};

export const deleteSetting = async (req: Request, res: Response) => {
    const { id } = req.params;
    const setting = await Setting.findByPk(id);
    if (!setting) return res.status(404).json({ error: 'Configuração não encontrada' });
    await setting.destroy();
    res.status(204).send();
};