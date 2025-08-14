import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { loggingService } from '../services/LoggingService';

interface DeleteUsuarioRequest {
    executorUserId: number; // ID do usuário que está executando a ação
}

export class DeleteUsuarioUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(id: number, userPerfilId: number, executorUserId: number): Promise<void> {
        try {
            // Apenas administradores podem deletar usuários
            if (userPerfilId !== 1) {
                const error = new Error('Acesso negado. Apenas administradores podem deletar usuários.');
                await loggingService.logError(executorUserId, 'Usuario', error, 'Tentativa de deletar usuário sem permissão');
                throw error;
            }

            const usuario = await this.usuarioRepository.findById(id);
            if (!usuario) {
                const error = new Error('Usuário não encontrado');
                await loggingService.logError(executorUserId, 'Usuario', error, `Tentativa de deletar usuário inexistente ID: ${id}`);
                throw error;
            }

            // Não permitir deletar o próprio usuário
            if (id === executorUserId) {
                const error = new Error('Não é possível deletar seu próprio usuário');
                await loggingService.logError(executorUserId, 'Usuario', error, 'Tentativa de auto-exclusão');
                throw error;
            }

            // Salvar dados para log antes de deletar (sem senha)
            const deletedUserData = {
                id: usuario.id,
                nomeCompleto: usuario.nomeCompleto,
                nickname: usuario.nickname,
                email: usuario.email,
                telefone: usuario.telefone,
                ativo: usuario.ativo,
                idPerfil: usuario.idPerfil
            };

            const success = await this.usuarioRepository.delete(id);
            if (!success) {
                const error = new Error('Erro ao deletar usuário');
                await loggingService.logError(executorUserId, 'Usuario', error, 'Falha na exclusão do usuário no banco');
                throw error;
            }

            // Log de sucesso
            await loggingService.logDelete(
                executorUserId,
                'Usuario',
                deletedUserData,
                `Deletou usuário: ${deletedUserData.nomeCompleto} (${deletedUserData.email})`
            );
        } catch (error) {
            // Se ainda não foi logado (erros não previstos)
            const message = (error as Error).message;
            if (!message.includes('Acesso negado') &&
                !message.includes('não encontrado') &&
                !message.includes('Não é possível deletar') &&
                !message.includes('Erro ao deletar')) {
                await loggingService.logError(executorUserId, 'Usuario', error as Error, 'Erro inesperado ao deletar usuário');
            }
            throw error;
        }
    }
}
