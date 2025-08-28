import cron from 'node-cron';
import { sendScheduledEmail } from './application/services/smtpService';
// Agendamento diário às 20h
cron.schedule('0 19 * * *', async () => {
    await sendScheduledEmail();
});
// Envio de e-mail automático para teste após 10 segundos do start
/*setTimeout(async () => {
    await sendScheduledEmail();
}, 10000); // 10 segundos */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './infrastructure/database/connection';
import authRoutes from './presentation/routes/authRoutes';
import exportacaoRoutes from './presentation/routes/exportacaoRoutes';
import templateRoutes from './presentation/routes/templateRoutes';
import produtoRoutes from './presentation/routes/produtoRoutes';
import fornecedorRoutes from './presentation/routes/fornecedorRoutes';
import enderecamentoRoutes from './presentation/routes/enderecamentoRoutes';
import importacaoRoutes from './presentation/routes/importacaoRoutes';
import { usuarioRoutes } from './presentation/routes/usuarioRoutes';
import { ruaRoutes } from './presentation/routes/ruaRoutes';
import { predioRoutes } from './presentation/routes/predioRoutes';
import listaRoutes from './presentation/routes/listaRoutes';
import dashboardRoutes from './presentation/routes/dashboardRoutes';
import estoqueRoutes from './presentation/routes/estoqueItemRoutes';
import { logRoutes } from './presentation/routes/logRoutes';
import { settingRoutes } from './presentation/routes/SettingRoutes';
import estoqueItemRoutes from './presentation/routes/estoqueItemRoutes';
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

// Rate limiting - Configuração mais permissiva para desenvolvimento
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: process.env.NODE_ENV === 'production' ? 60 : 1000, // 60 em produção, 1000 em desenvolvimento
    message: {
        error: 'Muitas requisições do mesmo IP, tente novamente em alguns minutos.',
        retryAfter: 60
    },
    standardHeaders: true, // Retorna informações de rate limit nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
    skip: (req) => {
        // Pular rate limit para rotas de health check em desenvolvimento
        if (process.env.NODE_ENV !== 'production' && req.url === '/health') {
            return true;
        }
        return false;
    }
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
app.use('/api/listas', listaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/estoque-item', estoqueItemRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/exportacao', exportacaoRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/importacao', importacaoRoutes);

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
