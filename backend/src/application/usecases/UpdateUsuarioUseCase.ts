import { IUsuario } from '../../domain/entities/Usuario';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { loggingService } from '../services/LoggingService';

interface UpdateUsuarioRequest {
    nomeCompleto?: string;
    nickname?: string;
    email?: string;
    telefone?: string;
    ativo?: boolean;
    idPerfil?: number;
    imagemUrl?: string;
    executorUserId: number; // ID do usuário que está executando a ação
}

export class UpdateUsuarioUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(id: number, request: UpdateUsuarioRequest, userPerfilId: number, userId: number): Promise<IUsuario> {
        try {
            // Administradores podem atualizar qualquer usuário
            // Operadores podem atualizar apenas seu próprio perfil (exceto perfil e status ativo)
            if (userPerfilId !== 1 && id !== userId) {
                const error = new Error('Acesso negado.');
                await loggingService.logError(request.executorUserId, 'Usuario', error, 'Tentativa de atualizar usuário sem permissão');
                throw error;
            }

            const usuario = await this.usuarioRepository.findById(id);
            if (!usuario) {
                const error = new Error('Usuário não encontrado');
                await loggingService.logError(request.executorUserId, 'Usuario', error, `Tentativa de atualizar usuário inexistente ID: ${id}`);
                throw error;
            }

            // Criar uma cópia dos dados originais para logging (sem senha)
            const originalData = {
                id: usuario.id,
                nomeCompleto: usuario.nomeCompleto,
                nickname: usuario.nickname,
                email: usuario.email,
                telefone: usuario.telefone,
                ativo: usuario.ativo,
                idPerfil: usuario.idPerfil,
                imagemUrl: usuario.imagemUrl
            };

            // Se é operador, remover campos que não pode alterar
            const requestData = { ...request };
            if (userPerfilId !== 1) {
                delete requestData.ativo;
                delete requestData.idPerfil;
            }

            // Se está alterando email, verificar se já existe
            if (requestData.email && requestData.email !== usuario.email) {
                const existingUser = await this.usuarioRepository.findByEmail(requestData.email);
                if (existingUser) {
                    const error = new Error('Email já está em uso');
                    await loggingService.logError(request.executorUserId, 'Usuario', error, `Tentativa de alterar para email duplicado: ${requestData.email}`);
                    throw error;
                }
            }

            // Atualizar diretamente com os dados enviados - o frontend agora sempre envia a imagemUrl correta
            const updatedUser = await this.usuarioRepository.update(id, requestData);
            if (!updatedUser) {
                const error = new Error('Erro ao atualizar usuário');
                await loggingService.logError(request.executorUserId, 'Usuario', error, 'Falha na atualização do usuário no banco');
                throw error;
            }

            // Criar dados atualizados para logging (sem senha)
            const updatedData = {
                id: updatedUser.id,
                nomeCompleto: updatedUser.nomeCompleto,
                nickname: updatedUser.nickname,
                email: updatedUser.email,
                telefone: updatedUser.telefone,
                ativo: updatedUser.ativo,
                idPerfil: updatedUser.idPerfil,
                imagemUrl: updatedUser.imagemUrl
            };

            // Log de sucesso com comparação de dados
            await loggingService.logUpdate(
                request.executorUserId,
                'Usuario',
                originalData,
                updatedData,
                `Atualizou usuário: ${updatedUser.nomeCompleto} (ID: ${id})`
            );

            return updatedUser;
        } catch (error) {
            // Se ainda não foi logado (erros não previstos)
            const message = (error as Error).message;
            if (!message.includes('Acesso negado') &&
                !message.includes('não encontrado') &&
                !message.includes('Email já está em uso') &&
                !message.includes('Erro ao atualizar')) {
                await loggingService.logError(request.executorUserId, 'Usuario', error as Error, 'Erro inesperado ao atualizar usuário');
            }
            throw error;
        }
    }
}
