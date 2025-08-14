import { Request, Response, NextFunction } from 'express';

// Estende o Request do Express para incluir informações de contexto
declare global {
    namespace Express {
        interface Request {
            userContext?: {
                userId?: number;
                userPerfilId?: number;
                ipAddress?: string;
                userAgent?: string;
            };
        }
    }
}

/**
 * Middleware para capturar informações de contexto da requisição
 */
export function contextMiddleware(req: Request, res: Response, next: NextFunction) {
    // Captura IP do cliente (considerando proxies)
    const ipAddress = req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (req.headers['x-real-ip'] as string) ||
        'IP não identificado';

    // Captura User-Agent
    const userAgent = req.headers['user-agent'] || 'User-Agent não identificado';

    // Inicializa o contexto
    req.userContext = {
        ipAddress,
        userAgent,
        userId: (req as any).userId,
        userPerfilId: (req as any).userPerfilId
    };

    next();
}

/**
 * Middleware para extrair informações do usuário do token JWT
 * Deve ser usado após o middleware de autenticação
 */
export function userContextMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.userContext && (req as any).userId) {
        req.userContext.userId = (req as any).userId;
        req.userContext.userPerfilId = (req as any).userPerfilId;
    }

    next();
}
