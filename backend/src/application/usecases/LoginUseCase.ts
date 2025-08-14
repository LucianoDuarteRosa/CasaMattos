import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { loggingService } from '../services/LoggingService';

interface LoginRequest {
    email: string;
    senha: string;
    userAgent?: string;
    ipAddress?: string;
}

interface LoginResponse {
    success: boolean;
    token?: string;
    usuario?: {
        id: number;
        nomeCompleto: string;
        nickname: string;
        email: string;
        idPerfil: number;
        perfil: {
            id: number;
            nomePerfil: string;
        };
        imagemUrl?: string;
    };
    message: string;
}

export class LoginUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(request: LoginRequest): Promise<LoginResponse> {
        try {
            // Validar se email e senha foram fornecidos
            if (!request.email || !request.senha) {
                const error = new Error('Email e senha são obrigatórios');
                // Para tentativas de login sem dados, não logamos com usuário específico
                console.log(`Tentativa de login sem dados - IP: ${request.ipAddress}, UserAgent: ${request.userAgent}`);
                return {
                    success: false,
                    message: 'Email e senha são obrigatórios'
                };
            }

            // Buscar usuário no banco
            const usuario = await this.usuarioRepository.findByEmail(request.email.toLowerCase().trim());

            if (!usuario || !usuario.ativo) {
                // Log de tentativa de login com email inválido/usuário inativo
                console.log(`Tentativa de login com email inválido/inativo: ${request.email} - IP: ${request.ipAddress}`);
                return {
                    success: false,
                    message: 'Email ou senha inválidos'
                };
            }

            // Verificar senha
            const senhaValida = await bcrypt.compare(request.senha, usuario.senha);
            if (!senhaValida) {
                // Log de tentativa de login com senha inválida
                await loggingService.logError(
                    usuario.id,
                    'Usuario',
                    new Error('Senha inválida'),
                    `Tentativa de login com senha inválida - IP: ${request.ipAddress}, UserAgent: ${request.userAgent?.substring(0, 100)}`
                );
                return {
                    success: false,
                    message: 'Email ou senha inválidos'
                };
            }

            // Gerar JWT token
            const token = jwt.sign(
                {
                    id: usuario.id,
                    userId: usuario.id,
                    email: usuario.email,
                    idPerfil: usuario.idPerfil
                },
                process.env.JWT_SECRET || 'casa-mattos-secret-key',
                { expiresIn: '8h' }
            );

            // Log de login bem-sucedido
            await loggingService.logLogin(
                usuario.id,
                `Login realizado com sucesso - IP: ${request.ipAddress}, UserAgent: ${request.userAgent?.substring(0, 100)}`
            );

            return {
                success: true,
                token,
                usuario: {
                    id: usuario.id,
                    nomeCompleto: usuario.nomeCompleto,
                    nickname: usuario.nickname,
                    email: usuario.email,
                    idPerfil: usuario.idPerfil,
                    perfil: usuario.perfil || { id: usuario.idPerfil, nomePerfil: 'Desconhecido' },
                    imagemUrl: usuario.imagemUrl
                },
                message: 'Login realizado com sucesso'
            };

        } catch (error) {
            // Log de erro inesperado
            console.error('Erro inesperado no login:', error);
            return {
                success: false,
                message: 'Erro interno do servidor'
            };
        }
    }
}
