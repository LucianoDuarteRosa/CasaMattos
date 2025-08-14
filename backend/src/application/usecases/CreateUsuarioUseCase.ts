import { IUsuario } from '../../domain/entities/Usuario';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { loggingService } from '../services/LoggingService';
const bcrypt = require('bcrypt');

interface CreateUsuarioRequest {
    nomeCompleto: string;
    nickname: string;
    email: string;
    telefone?: string;
    senha: string;
    idPerfil: number;
    imagemUrl?: string;
    executorUserId: number; // ID do usuário que está executando a ação
}

export class CreateUsuarioUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(request: CreateUsuarioRequest, userPerfilId: number): Promise<IUsuario> {
        try {
            // Apenas administradores podem criar usuários
            if (userPerfilId !== 1) {
                const error = new Error('Acesso negado. Apenas administradores podem criar usuários.');
                await loggingService.logError(request.executorUserId, 'Usuario', error, 'Tentativa de criação de usuário sem permissão');
                throw error;
            }

            // Verificar se o email já existe
            const existingUser = await this.usuarioRepository.findByEmail(request.email);
            if (existingUser) {
                const error = new Error('Email já está em uso');
                await loggingService.logError(request.executorUserId, 'Usuario', error, `Tentativa de criação com email duplicado: ${request.email}`);
                throw error;
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(request.senha, 10);

            const usuarioData = {
                nomeCompleto: request.nomeCompleto,
                nickname: request.nickname,
                email: request.email,
                telefone: request.telefone,
                senha: hashedPassword,
                ativo: true,
                idPerfil: request.idPerfil,
                imagemUrl: request.imagemUrl
            };

            const newUser = await this.usuarioRepository.create(usuarioData);

            // Log de sucesso
            await loggingService.logCreate(
                request.executorUserId,
                'Usuario',
                {
                    id: newUser.id,
                    nomeCompleto: newUser.nomeCompleto,
                    nickname: newUser.nickname,
                    email: newUser.email,
                    idPerfil: newUser.idPerfil
                },
                `Criou novo usuário: ${newUser.nomeCompleto} (${newUser.email})`
            );

            return newUser;
        } catch (error) {
            // Se ainda não foi logado (erros não previstos)
            if (!(error as Error).message.includes('Acesso negado') && !(error as Error).message.includes('Email já está em uso')) {
                await loggingService.logError(request.executorUserId, 'Usuario', error as Error, 'Erro inesperado ao criar usuário');
            }
            throw error;
        }
    }
}
