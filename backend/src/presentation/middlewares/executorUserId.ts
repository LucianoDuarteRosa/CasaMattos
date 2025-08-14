import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

/**
 * Middleware que adiciona automaticamente o executorUserId ao body das requisições
 * que modificam dados (POST, PUT, PATCH, DELETE)
 */
export const addExecutorUserId = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Só aplicar para métodos que modificam dados
    const modifyingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (modifyingMethods.includes(req.method) && req.user?.id) {
        // Garantir que req.body existe
        if (!req.body) {
            req.body = {};
        }

        // Adicionar o executorUserId ao body
        req.body.executorUserId = req.user.id;
    }

    next();
};
