import { Request, Response } from 'express';
import { LogRepository } from '../../infrastructure/repositories/LogRepository';
import UsuarioModel from '../../infrastructure/database/models/UsuarioModel';

const logRepository = new LogRepository();

export class LogController {
    static async list(req: Request, res: Response) {
        try {
            const { entidade, tipo, search } = req.query;
            let logs = await logRepository.findRecent(200); // Limite de 200 logs recentes

            // Filtros
            if (entidade) {
                logs = logs.filter((log) => log.entidade?.toLowerCase() === String(entidade).toLowerCase());
            }
            if (tipo) {
                logs = logs.filter((log) => log.acao?.toLowerCase() === String(tipo).toLowerCase());
            }
            if (search) {
                const s = String(search).toLowerCase();
                logs = logs.filter((log) =>
                    (log.descricao?.toLowerCase().includes(s))
                );
            }

            // Buscar nomes dos usuários (opcional, pode ser otimizado com join)
            const usuarioIds = Array.from(new Set(logs.map((log) => log.idUsuario)));
            const usuarios = await UsuarioModel.findAll({ where: { id: usuarioIds } });
            const usuarioMap = new Map<number, string>();
            usuarios.forEach((u) => usuarioMap.set(u.id, u.nomeCompleto));

            // Ajustar campos para o grid do front
            const result = logs.map((log) => ({
                id: log.id,
                dataHora: log.dataHora,
                usuario: usuarioMap.get(log.idUsuario) || '',
                entidade: log.entidade,
                tipo: log.acao,
                detalhes: log.descricao,
            }));

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar logs' });
        }
    }
}
