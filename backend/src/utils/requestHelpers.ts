import { Request } from 'express';

/**
 * Extrai informações de contexto da requisição para uso em logging
 */
export function extractRequestContext(req: Request) {
    return {
        executorUserId: (req as any).userId || 0,
        userPerfilId: (req as any).userPerfilId || 0,
        ipAddress: req.userContext?.ipAddress || 'IP não identificado',
        userAgent: req.userContext?.userAgent || 'User-Agent não identificado'
    };
}

/**
 * Cria um objeto de contexto para Use Cases que incluem logging
 */
export function createUseCaseContext(req: Request) {
    const context = extractRequestContext(req);
    return {
        executorUserId: context.executorUserId,
        userPerfilId: context.userPerfilId,
        metadata: {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent?.substring(0, 200) // Limita o tamanho
        }
    };
}

/**
 * Verifica se o usuário tem permissão de administrador
 */
export function isAdmin(req: Request): boolean {
    return (req as any).userPerfilId === 1;
}

/**
 * Verifica se o usuário atual é o mesmo que está sendo modificado
 */
export function isSameUser(req: Request, targetUserId: number): boolean {
    return (req as any).userId === targetUserId;
}
