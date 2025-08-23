import { Request, Response } from 'express';
import { FileExportService } from '../../application/services/FileExportService';

export const exportacaoController = {
    async exportarInventarioExcel(req: Request, res: Response) {
        try {
            const fornecedorId = req.query.fornecedorId ? Number(req.query.fornecedorId) : undefined;
            const buffer = await FileExportService.exportarInventarioExcel(fornecedorId);
            res.setHeader('Content-Disposition', 'attachment; filename="inventario.xlsx"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao exportar inventário', error });
        }
    }
};
