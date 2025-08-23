import { Router } from 'express';
import { exportacaoController } from '../controllers/ExportacaoController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/inventario', authenticateToken, exportacaoController.exportarInventarioExcel);

export default router;
