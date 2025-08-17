import { Request, Response } from 'express';
import Setting from '../../domain/entities/Setting';

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
    res.status(201).json(setting);
};

export const updateSetting = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { key, value, type, active } = req.body;
    const setting = await Setting.findByPk(id);
    if (!setting) return res.status(404).json({ error: 'Configuração não encontrada' });
    await setting.update({ key, value, type, active });
    res.json(setting);
};

export const deleteSetting = async (req: Request, res: Response) => {
    const { id } = req.params;
    const setting = await Setting.findByPk(id);
    if (!setting) return res.status(404).json({ error: 'Configuração não encontrada' });
    await setting.destroy();
    res.status(204).send();
};
