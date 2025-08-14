import { loggingService } from '../services/LoggingService';

interface LogoutRequest {
    userId: number;
    userAgent?: string;
    ipAddress?: string;
}

export class LogoutUseCase {
    async execute(request: LogoutRequest): Promise<{ success: boolean; message: string }> {
        try {
            // Log de logout
            await loggingService.logLogout(
                request.userId,
                `Logout realizado - IP: ${request.ipAddress}, UserAgent: ${request.userAgent?.substring(0, 100)}`
            );

            return {
                success: true,
                message: 'Logout realizado com sucesso'
            };
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return {
                success: false,
                message: 'Erro interno do servidor'
            };
        }
    }
}
