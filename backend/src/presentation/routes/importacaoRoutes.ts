import { Router } from 'express';
import { ImportacaoController } from '../controllers/ImportacaoController';

const router = Router();
const controller = new ImportacaoController();

// POST /api/importacao
router.post('/', (req, res) => controller.importar(req, res));

export default router;
