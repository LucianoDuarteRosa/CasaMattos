import { Request, Response } from 'express';
import { loggingService, LogAction } from '../services/LoggingService';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        idPerfil: number;
        email: string;
    };
}

/**
 * Helper para facilitar o uso do sistema de logging nos controllers
 */
export class LoggingHelper {
    /**
     * Extrai o userId do request autenticado
     */
    static getUserId(req: AuthenticatedRequest): number {
        return req.user?.id || 0;
    }

    /**
     * Extrai informações de contexto do request
     */
    static getRequestContext(req: AuthenticatedRequest) {
        return {
            ip: req.ip || req.connection.remoteAddress || 'Unknown',
            userAgent: req.headers['user-agent'] || 'Unknown',
            method: req.method,
            url: req.originalUrl
        };
    }

    /**
     * Wrapper para try-catch com logging automático de erro
     */
    static async withLogging<T>(
        req: AuthenticatedRequest,
        entity: string,
        operation: () => Promise<T>,
        operationDescription?: string
    ): Promise<T> {
        const userId = this.getUserId(req);
        const context = this.getRequestContext(req);

        try {
            return await operation();
        } catch (error) {
            await loggingService.logError(
                userId,
                entity,
                error as Error,
                operationDescription ? `${operationDescription} - ${context.method} ${context.url}` : `Erro na operação - ${context.method} ${context.url}`
            );
            throw error;
        }
    }

    /**
     * Log de operação CREATE com dados
     */
    static async logCreate(
        req: AuthenticatedRequest,
        entity: string,
        data: any,
        description?: string
    ) {
        const userId = this.getUserId(req);
        await loggingService.logCreate(userId, entity, data, description);
    }

    /**
     * Log de operação UPDATE com comparação de dados
     */
    static async logUpdate(
        req: AuthenticatedRequest,
        entity: string,
        oldData: any,
        newData: any,
        description?: string
    ) {
        const userId = this.getUserId(req);
        await loggingService.logUpdate(userId, entity, oldData, newData, description);
    }

    /**
     * Log de operação DELETE
     */
    static async logDelete(
        req: AuthenticatedRequest,
        entity: string,
        data: any,
        description?: string
    ) {
        const userId = this.getUserId(req);
        await loggingService.logDelete(userId, entity, data, description);
    }

    /**
     * Log de ação personalizada
     */
    static async logAction(
        req: AuthenticatedRequest,
        entity: string,
        action: LogAction,
        description: string,
        metadata?: any
    ) {
        const userId = this.getUserId(req);
        await loggingService.logAction({
            userId,
            entity,
            action,
            description,
            metadata
        });
    }

    /**
     * Log de erro com contexto do request
     */
    static async logError(
        req: AuthenticatedRequest,
        entity: string,
        error: Error,
        description?: string
    ) {
        const userId = this.getUserId(req);
        const context = this.getRequestContext(req);
        const fullDescription = description
            ? `${description} - ${context.method} ${context.url} - IP: ${context.ip}`
            : `Erro - ${context.method} ${context.url} - IP: ${context.ip}`;

        await loggingService.logError(userId, entity, error, fullDescription);
    }

    /**
     * Middleware para adicionar informações do usuário no request body automaticamente
     */
    static addUserToRequest(req: AuthenticatedRequest, res: Response, next: Function) {
        if (req.user && req.body) {
            req.body.executorUserId = req.user.id;
        }
        next();
    }
}
