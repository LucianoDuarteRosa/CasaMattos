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
const connection_1 = __importDefault(require("./infrastructure/database/connection"));
const authRoutes_1 = __importDefault(require("./presentation/routes/authRoutes"));
const produtoRoutes_1 = __importDefault(require("./presentation/routes/produtoRoutes"));
// Importar associações para garantir que sejam carregadas
require("./infrastructure/database/models/associations");
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
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Rotas da API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/produtos', produtoRoutes_1.default);
app.use('/api/fornecedores', (req, res) => res.json({ message: 'Fornecedores routes not implemented yet' }));
app.use('/api/listas', (req, res) => res.json({ message: 'Listas routes not implemented yet' }));
app.use('/api/enderecamentos', (req, res) => res.json({ message: 'Enderecamentos routes not implemented yet' }));
// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
    });
});
// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
// Inicializar banco de dados e servidor
async function startServer() {
    try {
        // Testar conexão com o banco
        await connection_1.default.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
        // Sincronizar modelos (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            await connection_1.default.sync({ alter: true });
            console.log('✅ Modelos sincronizados com o banco de dados.');
        }
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌍 Acesse: http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map