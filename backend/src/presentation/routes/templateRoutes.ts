import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

// Rota única para servir templates de fornecedores e produtos
router.get('/:tipo', (req: Request, res: Response) => {
    const { tipo } = req.params;
    let filename = '';
    if (tipo === 'fornecedor') {
        filename = 'Template_Fornecedores.xlsx';
    } else if (tipo === 'produto') {
        filename = 'Template_Produtos.xlsx';
    } else if (tipo === 'separacao') {
        filename = 'Template_Separacao.xlsx';
    } else {
        return res.status(400).json({ error: 'Tipo de template inválido' });
    }
    // Tentar encontrar o arquivo em diferentes caminhos possíveis
    const pathsToTry = [
        path.join(process.cwd(), 'backend', 'templates', filename),
        path.join(process.cwd(), 'templates', filename),
    ];
    const filePath = pathsToTry.find(p => fs.existsSync(p));
    if (!filePath) {
        return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    res.download(filePath, filename, (err) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao baixar o arquivo' });
        }
    });
});

export default router;
