import { Router } from 'express';
import { ImportacaoController } from '../controllers/ImportacaoController';
import { authenticateToken } from '../middlewares/auth';
import multer from 'multer';

const router = Router();
const controller = new ImportacaoController();
const upload = multer();

router.post('/', upload.single('arquivo'), (req, res) => controller.importar(req, res));
router.post('/confirmar-produtos', authenticateToken, async (req, res) => controller.confirmarImportacaoProdutos(req, res));
router.post('/confirmar', authenticateToken, async (req, res) => controller.confirmarImportacao(req, res));

export default router;
