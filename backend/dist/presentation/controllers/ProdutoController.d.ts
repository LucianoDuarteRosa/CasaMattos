import { Request, Response } from 'express';
export declare class ProdutoController {
    private produtoRepository;
    private createProdutoUseCase;
    private getProdutoUseCase;
    private listProdutosUseCase;
    private updateProdutoUseCase;
    private searchProdutosUseCase;
    constructor();
    create(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    search(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ProdutoController.d.ts.map