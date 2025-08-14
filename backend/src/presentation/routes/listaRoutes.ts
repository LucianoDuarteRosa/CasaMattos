import { Router } from 'express';
import { ListaController } from '../controllers/ListaController';
import { authenticateToken } from '../middlewares/auth';
import { addExecutorUserId } from '../middlewares/executorUserId';

const router = Router();
const listaController = new ListaController();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Adicionar executorUserId automaticamente para operações que modificam dados
router.use(addExecutorUserId);

// GET /api/listas - Listar listas com paginação
router.get('/', (req, res) => listaController.getAll(req, res));

// GET /api/listas/enderecamentos-disponiveis - Buscar endereçamentos disponíveis para adicionar em listas
router.get('/enderecamentos-disponiveis', (req, res) => listaController.getEnderecamentosDisponiveis(req, res));

// GET /api/listas/:id - Buscar lista por ID
router.get('/:id', (req, res) => listaController.getById(req, res));

// POST /api/listas - Criar nova lista
router.post('/', (req, res) => listaController.create(req, res));

// PUT /api/listas/:id - Atualizar lista
router.put('/:id', (req, res) => listaController.update(req, res));

// DELETE /api/listas/:id - Excluir lista
router.delete('/:id', (req, res) => listaController.delete(req, res));

// GET /api/listas/:id/enderecamentos - Obter endereçamentos de uma lista
router.get('/:id/enderecamentos', (req, res) => listaController.getEnderecamentos(req, res));

// POST /api/listas/:id/enderecamentos/:idEnderecamento - Adicionar endereçamento à lista
router.post('/:id/enderecamentos/:idEnderecamento', (req, res) => listaController.addEnderecamento(req, res));

// DELETE /api/listas/:id/enderecamentos/:idEnderecamento - Remover endereçamento da lista
router.delete('/:id/enderecamentos/:idEnderecamento', (req, res) => listaController.removeEnderecamento(req, res));

// PATCH /api/listas/:id/finalizar - Finalizar lista
router.patch('/:id/finalizar', (req, res) => listaController.finalizarLista(req, res));

// PATCH /api/listas/:id/desfazer-finalizacao - Desfazer finalização da lista
router.patch('/:id/desfazer-finalizacao', (req, res) => listaController.desfazerFinalizacao(req, res));

export default router;
