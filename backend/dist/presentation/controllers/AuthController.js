"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UsuarioModel_1 = __importDefault(require("../../infrastructure/database/models/UsuarioModel"));
const PerfilModel_1 = __importDefault(require("../../infrastructure/database/models/PerfilModel"));
class AuthController {
    static async login(req, res) {
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
            const usuario = await UsuarioModel_1.default.findOne({
                where: {
                    email: email.toLowerCase().trim(),
                    ativo: true
                },
                include: [{
                        model: PerfilModel_1.default,
                        as: 'perfil',
                        attributes: ['id', 'nomePerfil']
                    }]
            });
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }
            // Verificar senha
            const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }
            // Gerar JWT token
            const token = jsonwebtoken_1.default.sign({
                userId: usuario.id,
                email: usuario.email,
                perfilId: usuario.idPerfil
            }, process.env.JWT_SECRET || 'casa-mattos-secret-key', { expiresIn: '8h' });
            // Retornar dados do usuário (sem a senha)
            const { senha: _, ...usuarioSemSenha } = usuario.toJSON();
            res.json({
                success: true,
                data: {
                    token,
                    usuario: usuarioSemSenha
                }
            });
        }
        catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    static async me(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token não fornecido'
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'casa-mattos-secret-key');
            const usuario = await UsuarioModel_1.default.findByPk(decoded.userId, {
                include: [{
                        model: PerfilModel_1.default,
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
        }
        catch (error) {
            console.error('Erro ao validar token:', error);
            res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map