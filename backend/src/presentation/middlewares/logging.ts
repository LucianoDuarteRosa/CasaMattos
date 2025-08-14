import { Request, Response, NextFunction } from 'express';
import { loggingService } from '../../application/services/LoggingService';

interface LoggedRequest extends Request {
    user?: {
        id: number;
        idPerfil: number;
        email: string;
    };
    logContext?: {
        ip: string;
        userAgent: string;
        method: string;
        url: string;
        timestamp: Date;
    };
}

/**
 * Middleware para capturar informações de IP e User-Agent automaticamente
 */
export const loggingMiddleware = (req: LoggedRequest, res: Response, next: NextFunction) => {
    // Adiciona informações de contexto para logging
    req.logContext = {
        ip: req.ip || req.connection.remoteAddress || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date()
    };

    next();
};

/**
 * Helper para logar logout quando o frontend faz a chamada
 */
export const logLogout = async (req: LoggedRequest, res: Response, next: NextFunction) => {
    if (req.user) {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.ip || req.connection.remoteAddress || 'Unknown';

        await loggingService.logLogout(
            req.user.id,
            `Logout realizado - IP: ${ip}, Navegador: ${userAgent}`
        );
    }
    next();
};
