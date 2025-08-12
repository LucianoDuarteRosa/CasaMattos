"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Carregar variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares de segurança
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requests por IP por janela de tempo
});
app.use(limiter);
// Parser do body
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Casa Mattos API - Funcionando sem banco de dados'
    });
});
// Rotas da API (mockadas para demonstração)
app.post('/api/auth/login', (req, res) => {
    const { email, senha } = req.body;
    // Mock de autenticação
    if (email === 'admin@casamattos.com' && senha === '123456') {
        res.json({
            success: true,
            data: {
                token: 'mock-jwt-token-123',
                usuario: {
                    id: 1,
                    nomeCompleto: 'Administrador Casa Mattos',
                    email: 'admin@casamattos.com',
                    perfil: { nomePerfil: 'Administrador' }
                }
            }
        });
    }
    else {
        res.status(401).json({
            success: false,
            message: 'Email ou senha inválidos'
        });
    }
});
// Rotas mockadas para demonstração
app.get('/api/produtos', (req, res) => {
    res.json({
        success: true,
        data: {
            data: [
                {
                    id: 1,
                    codInterno: 1001,
                    descricao: 'Produto de Teste',
                    estoque: 100,
                    quantCaixas: 10,
                    fornecedor: { razaoSocial: 'Fornecedor Teste' }
                }
            ],
            total: 1,
            page: 1,
            limit: 25,
            totalPages: 1
        }
    });
});
app.get('/api/fornecedores', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, razaoSocial: 'Fornecedor Teste LTDA', cnpj: '12.345.678/0001-90' }
        ]
    });
});
app.get('/api/listas', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, nome: 'Lista Teste', disponivel: true }
        ]
    });
});
// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
    });
});
// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
    });
});
// Inicializar servidor
async function startServer() {
    try {
        console.log('⚠️  Iniciando servidor SEM conexão com banco de dados (modo demonstração)');
        console.log('📋 Para usar com banco, configure o MySQL e use server.ts');
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌍 Acesse: http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔑 Login de teste: admin@casamattos.com / 123456`);
        });
    }
    catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server-demo.js.map