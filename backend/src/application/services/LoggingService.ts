import { ILogRepository } from '../../domain/repositories/ILogRepository';
import { LogRepository } from '../../infrastructure/repositories/LogRepository';

export enum LogAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    ERROR = 'ERROR',
    BULK_CREATE = 'BULK_CREATE',
    FINALIZE = 'FINALIZE',
    UNFINALIZE = 'UNFINALIZE'
}

export interface LogContext {
    userId: number;
    entity: string;
    action: LogAction;
    description?: string;
    oldData?: any;
    newData?: any;
    error?: Error;
    metadata?: any;
}

export class LoggingService {
    private static instance: LoggingService;
    private logRepository: ILogRepository;

    private constructor() {
        this.logRepository = new LogRepository();
    }

    public static getInstance(): LoggingService {
        if (!LoggingService.instance) {
            LoggingService.instance = new LoggingService();
        }
        return LoggingService.instance;
    }

    async logAction(context: LogContext): Promise<void> {
        try {
            const description = this.buildDescription(context);

            await this.logRepository.create({
                idUsuario: context.userId,
                entidade: context.entity,
                acao: context.action,
                descricao: description
            });
        } catch (error) {
            console.error('Erro ao salvar log:', error);
            // Não lançamos erro aqui para não quebrar o fluxo principal
        }
    }

    async logCreate(userId: number, entity: string, data: any, description?: string): Promise<void> {
        await this.logAction({
            userId,
            entity,
            action: LogAction.CREATE,
            newData: data,
            description
        });
    }

    async logUpdate(userId: number, entity: string, oldData: any, newData: any, description?: string): Promise<void> {
        await this.logAction({
            userId,
            entity,
            action: LogAction.UPDATE,
            oldData,
            newData,
            description
        });
    }

    async logDelete(userId: number, entity: string, data: any, description?: string): Promise<void> {
        await this.logAction({
            userId,
            entity,
            action: LogAction.DELETE,
            oldData: data,
            description
        });
    }

    async logError(userId: number, entity: string, error: Error, description?: string): Promise<void> {
        await this.logAction({
            userId,
            entity,
            action: LogAction.ERROR,
            error,
            description
        });
    }

    async logLogin(userId: number, description?: string): Promise<void> {
        await this.logAction({
            userId,
            entity: 'Usuario',
            action: LogAction.LOGIN,
            description: description || 'Login realizado'
        });
    }

    async logLogout(userId: number, description?: string): Promise<void> {
        await this.logAction({
            userId,
            entity: 'Usuario',
            action: LogAction.LOGOUT,
            description: description || 'Logout realizado'
        });
    }

    private buildDescription(context: LogContext): string {
        if (context.description) {
            return context.description;
        }

        let description = '';

        switch (context.action) {
            case LogAction.CREATE:
                description = `Criou novo registro`;
                if (context.newData) {
                    const name = this.extractName(context.newData);
                    if (name) description += ` - ${name}`;
                }
                break;

            case LogAction.UPDATE:
                description = `Atualizou registro`;
                if (context.oldData && context.newData) {
                    const changes = this.compareObjects(context.oldData, context.newData);
                    if (changes.length > 0) {
                        description += ` - Alterações: ${changes.join(', ')}`;
                    }
                }
                break;

            case LogAction.DELETE:
                description = `Excluiu registro`;
                if (context.oldData) {
                    const name = this.extractName(context.oldData);
                    if (name) description += ` - ${name}`;
                }
                break;

            case LogAction.ERROR:
                description = `Erro na operação`;
                if (context.error) {
                    description += ` - ${context.error.message}`;
                }
                break;

            case LogAction.BULK_CREATE:
                description = `Criação em lote`;
                if (context.metadata?.count) {
                    description += ` - ${context.metadata.count} registros`;
                }
                break;

            case LogAction.FINALIZE:
                description = `Finalizou registro`;
                break;

            case LogAction.UNFINALIZE:
                description = `Desfez finalização`;
                break;

            default:
                description = `Executou ação: ${context.action}`;
        }

        return description;
    }

    private extractName(data: any): string | null {
        // Tenta extrair um nome identificador do objeto
        const nameFields = ['nome', 'nomeCompleto', 'nickname', 'descricao', 'nomePredio', 'nomeRua'];

        for (const field of nameFields) {
            if (data[field]) {
                return data[field];
            }
        }

        if (data.id) {
            return `ID: ${data.id}`;
        }

        return null;
    }

    private compareObjects(oldData: any, newData: any): string[] {
        const changes: string[] = [];
        const keys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

        // Campos que devem ser ignorados na comparação
        const ignoredFields = ['id', 'createdAt', 'updatedAt', 'dataHora', 'senha'];

        for (const key of keys) {
            if (ignoredFields.includes(key)) continue;

            const oldValue = oldData?.[key];
            const newValue = newData?.[key];

            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                const oldDisplay = this.formatValue(oldValue);
                const newDisplay = this.formatValue(newValue);
                changes.push(`${key}: ${oldDisplay} → ${newDisplay}`);
            }
        }

        return changes;
    }

    private formatValue(value: any): string {
        if (value === null || value === undefined) {
            return 'vazio';
        }
        if (typeof value === 'boolean') {
            return value ? 'sim' : 'não';
        }
        if (typeof value === 'string' && value.length > 50) {
            return value.substring(0, 47) + '...';
        }
        return String(value);
    }
}

// Exporta instância singleton
export const loggingService = LoggingService.getInstance();
