import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UsuarioModel from '../../infrastructure/database/models/UsuarioModel';
import PerfilModel from '../../infrastructure/database/models/PerfilModel';
import { loggingService } from '../../application/services/LoggingService';

export class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;

            // Validar se email e senha foram fornecidos
            if (!email || !senha) {
                return res.status(400).json({
                    success: false,
                    message: 'Email e senha são obrigatórios'
                });
            }

            // Buscar usuário no banco
            const usuario = await UsuarioModel.findOne({
                where: {
                    email: email.toLowerCase().trim(),
                    ativo: true
                },
                include: [{
                    model: PerfilModel,
                    as: 'perfil',
                    attributes: ['id', 'nomePerfil']
                }]
            });

            if (!usuario) {
                // Log tentativa de login com email inválido
                await loggingService.logError(0, 'Usuario', new Error('Tentativa de login com email inválido'), `Login falhado para email: ${email}`);
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

            // Verificar senha
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                // Log tentativa de login com senha inválida
                await loggingService.logError(usuario.id, 'Usuario', new Error('Tentativa de login com senha inválida'), `Login falhado para usuário: ${usuario.nomeCompleto} (${usuario.email})`);
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

            // Log login bem-sucedido
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const ip = req.ip || req.connection.remoteAddress || 'Unknown';
            await loggingService.logLogin(usuario.id, `Login realizado com sucesso - IP: ${ip}, Navegador: ${userAgent}`);

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

            // Retornar dados do usuário (sem a senha)
            const { senha: _, ...usuarioSemSenha } = usuario.toJSON();

            res.json({
                success: true,
                data: {
                    token,
                    usuario: usuarioSemSenha
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            // O logging já foi feito pelo middleware
            res.json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
        } catch (error) {
            console.error('Erro no logout:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async me(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token não fornecido'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'casa-mattos-secret-key') as any;

            const usuario = await UsuarioModel.findByPk(decoded.userId, {
                include: [{
                    model: PerfilModel,
                    as: 'perfil',
                    attributes: ['id', 'nomePerfil']
                }],
                attributes: { exclude: ['senha'] }
            });

            if (!usuario || !usuario.ativo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário inválido'
                });
            }

            res.json({
                success: true,
                data: { usuario }
            });

        } catch (error) {
            console.error('Erro ao validar token:', error);
            res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
    }
}
