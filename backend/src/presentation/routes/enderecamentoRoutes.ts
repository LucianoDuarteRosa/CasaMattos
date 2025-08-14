import { Router } from 'express';
import { EnderecamentoController } from '../controllers/EnderecamentoController';
import { CreateEnderecamentoUseCase } from '../../application/usecases/CreateEnderecamentoUseCase';
import { CreateBulkEnderecamentoUseCase } from '../../application/usecases/CreateBulkEnderecamentoUseCase';
import { GetEnderecamentoUseCase } from '../../application/usecases/GetEnderecamentoUseCase';
import { ListEnderecamentosUseCase } from '../../application/usecases/ListEnderecamentosUseCase';
import { ListEnderecamentosDisponiveisUseCase } from '../../application/usecases/ListEnderecamentosDisponiveisUseCase';
import { UpdateEnderecamentoUseCase } from '../../application/usecases/UpdateEnderecamentoUseCase';
import { DeleteEnderecamentoUseCase } from '../../application/usecases/DeleteEnderecamentoUseCase';
import { SearchEnderecamentosUseCase } from '../../application/usecases/SearchEnderecamentosUseCase';
import { SearchEnderecamentosDisponiveisUseCase } from '../../application/usecases/SearchEnderecamentosDisponiveisUseCase';
import { EnderecamentoRepository } from '../../infrastructure/repositories/EnderecamentoRepository';
import { authenticateToken } from '../middlewares/auth';
import { addExecutorUserId } from '../middlewares/executorUserId';
import { loggingService } from '../../application/services/LoggingService';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Adicionar executorUserId automaticamente para operações que modificam dados
router.use(addExecutorUserId);

// Instanciar repositório
const enderecamentoRepository = new EnderecamentoRepository();

// Instanciar use cases
const createEnderecamentoUseCase = new CreateEnderecamentoUseCase(enderecamentoRepository);
const createBulkEnderecamentoUseCase = new CreateBulkEnderecamentoUseCase(enderecamentoRepository);
const getEnderecamentoUseCase = new GetEnderecamentoUseCase(enderecamentoRepository);
const listEnderecamentosUseCase = new ListEnderecamentosUseCase(enderecamentoRepository);
const listEnderecamentosDisponiveisUseCase = new ListEnderecamentosDisponiveisUseCase(enderecamentoRepository);
const updateEnderecamentoUseCase = new UpdateEnderecamentoUseCase(enderecamentoRepository, loggingService);
const deleteEnderecamentoUseCase = new DeleteEnderecamentoUseCase(enderecamentoRepository, loggingService);
const searchEnderecamentosUseCase = new SearchEnderecamentosUseCase(enderecamentoRepository);
const searchEnderecamentosDisponiveisUseCase = new SearchEnderecamentosDisponiveisUseCase(enderecamentoRepository);

// Instanciar controller
const enderecamentoController = new EnderecamentoController(
    createEnderecamentoUseCase,
    createBulkEnderecamentoUseCase,
    getEnderecamentoUseCase,
    listEnderecamentosUseCase,
    listEnderecamentosDisponiveisUseCase,
    updateEnderecamentoUseCase,
    deleteEnderecamentoUseCase,
    searchEnderecamentosUseCase,
    searchEnderecamentosDisponiveisUseCase
);

// Rotas
router.post('/', (req, res) => enderecamentoController.create(req, res));
router.post('/bulk', (req, res) => enderecamentoController.createBulk(req, res));
router.get('/', (req, res) => enderecamentoController.getAll(req, res));
router.get('/disponiveis', (req, res) => enderecamentoController.getDisponiveis(req, res));
router.get('/search', (req, res) => enderecamentoController.search(req, res));
router.get('/search-disponiveis', (req, res) => enderecamentoController.searchDisponiveis(req, res));
router.get('/produto/:idProduto', (req, res) => enderecamentoController.getByProduto(req, res));
router.get('/:id', (req, res) => enderecamentoController.getById(req, res));
router.put('/:id', (req, res) => enderecamentoController.update(req, res));
router.delete('/:id', (req, res) => enderecamentoController.delete(req, res));

export default router;
