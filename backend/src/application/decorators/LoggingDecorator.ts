import { loggingService, LogAction } from '../services/LoggingService';

export interface LoggedMethodOptions {
    entity: string;
    action: LogAction;
    description?: string;
    skipLogging?: boolean;
}

/**
 * Decorator para automatizar logging em métodos de repositório
 */
export function LoggedMethod(options: LoggedMethodOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            // Se o logging está desabilitado para este método, apenas executa
            if (options.skipLogging) {
                return await originalMethod.apply(this, args);
            }

            let result: any;
            let error: Error | undefined;
            const startTime = Date.now();

            try {
                result = await originalMethod.apply(this, args);
                return result;
            } catch (err) {
                error = err as Error;
                throw err;
            } finally {
                try {
                    // Extrai o userId do contexto (pode estar nos args ou em uma propriedade de contexto)
                    const userId = extractUserIdFromContext(this, args);

                    if (userId && userId > 0) {
                        if (error) {
                            await loggingService.logError(
                                userId,
                                options.entity,
                                error,
                                options.description || `Erro no método ${propertyKey}`
                            );
                        } else {
                            // Determina os dados antigos e novos baseado no tipo de operação e argumentos
                            const { oldData, newData } = extractDataFromArgs(options.action, args, result);

                            switch (options.action) {
                                case LogAction.CREATE:
                                    await loggingService.logCreate(
                                        userId,
                                        options.entity,
                                        newData || result,
                                        options.description
                                    );
                                    break;

                                case LogAction.UPDATE:
                                    await loggingService.logUpdate(
                                        userId,
                                        options.entity,
                                        oldData,
                                        newData || result,
                                        options.description
                                    );
                                    break;

                                case LogAction.DELETE:
                                    await loggingService.logDelete(
                                        userId,
                                        options.entity,
                                        oldData || (args.length > 0 ? { id: args[0] } : undefined),
                                        options.description
                                    );
                                    break;

                                default:
                                    await loggingService.logAction({
                                        userId,
                                        entity: options.entity,
                                        action: options.action,
                                        description: options.description || `Executou ${propertyKey}`,
                                        oldData,
                                        newData: newData || result
                                    });
                            }
                        }
                    }
                } catch (logError) {
                    // Log de erro do próprio sistema de logging - apenas imprime no console
                    console.error('Erro no sistema de logging:', logError);
                }
            }
        };

        return descriptor;
    };
}

/**
 * Extrai o userId do contexto de execução
 */
function extractUserIdFromContext(instance: any, args: any[]): number | null {
    // Verifica se há uma propriedade currentUserId na instância
    if (instance.currentUserId) {
        return instance.currentUserId;
    }

    // Verifica se há um contexto passado como último parâmetro
    const lastArg = args[args.length - 1];
    if (lastArg && typeof lastArg === 'object' && lastArg.userId) {
        return lastArg.userId;
    }

    // Verifica se há um contexto em uma posição específica
    for (const arg of args) {
        if (arg && typeof arg === 'object' && arg.userId) {
            return arg.userId;
        }
    }

    return null;
}

/**
 * Extrai dados antigos e novos dos argumentos baseado no tipo de ação
 */
function extractDataFromArgs(action: LogAction, args: any[], result: any): { oldData?: any; newData?: any } {
    switch (action) {
        case LogAction.CREATE:
            // Para criação, o primeiro argumento geralmente são os dados
            return { newData: args[0] };

        case LogAction.UPDATE:
            // Para update, primeiro arg é ID, segundo são os dados
            // O oldData seria necessário buscar, mas isso seria feito pelo UseCase
            return { newData: args[1] };

        case LogAction.DELETE:
            // Para delete, geralmente só temos o ID
            return { oldData: { id: args[0] } };

        default:
            return { newData: result };
    }
}

/**
 * Decorator simples para pular logging em métodos GET
 */
export function NoLogging() {
    return LoggedMethod({
        entity: '',
        action: LogAction.CREATE, // Valor dummy
        skipLogging: true
    });
}
