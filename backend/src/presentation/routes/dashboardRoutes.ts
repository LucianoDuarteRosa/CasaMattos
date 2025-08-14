import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticateToken } from '../middlewares/auth';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

// Aplicar middleware de autenticação em todas as rotas
dashboardRoutes.use(authenticateToken);

// Rota para buscar estatísticas gerais do dashboard
dashboardRoutes.get('/stats', dashboardController.getStats.bind(dashboardController));

// Rota para produtos em ponta de estoque
dashboardRoutes.get('/produtos-ponta-estoque', dashboardController.getProdutosPontaEstoque.bind(dashboardController));

// Rota para produtos com estoque baixo na separação
dashboardRoutes.get('/produtos-estoque-baixo-separacao', dashboardController.getProdutosEstoqueBaixoSeparacao.bind(dashboardController));

export default dashboardRoutes;
