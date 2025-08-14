import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './infrastructure/database/connection';
import authRoutes from './presentation/routes/authRoutes';
import produtoRoutes from './presentation/routes/produtoRoutes';
import fornecedorRoutes from './presentation/routes/fornecedorRoutes';
import enderecamentoRoutes from './presentation/routes/enderecamentoRoutes';
import { usuarioRoutes } from './presentation/routes/usuarioRoutes';
import { ruaRoutes } from './presentation/routes/ruaRoutes';
import { predioRoutes } from './presentation/routes/predioRoutes';
// Importar associações para garantir que sejam carregadas
import './infrastructure/database/models/associations';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "http://localhost:5173", "http://localhost:5174"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: [
        process.env.CORS_ORIGIN || 'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requests por IP por janela de tempo
});
app.use(limiter);

// Parser do body - aumentar limite para suportar imagens em base64
app.use(express.json({ limit: '10mb' })); // Aumentar para 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Também para URL encoded

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Servir arquivos estáticos (imagens de upload) com cabeçalhos CORS apropriados
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}, express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ruas', ruaRoutes);
app.use('/api/predios', predioRoutes);
app.use('/api/enderecamentos', enderecamentoRoutes);
app.use('/api/listas', (req, res) => res.json({ message: 'Listas routes not implemented yet' }));

// Middleware de tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

        // Sincronizar modelos (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Modelos sincronizados com o banco de dados.');
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌍 Acesse: http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

startServer();
