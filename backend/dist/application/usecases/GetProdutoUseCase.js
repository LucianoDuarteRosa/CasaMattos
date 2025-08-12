"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProdutoUseCase = void 0;
class GetProdutoUseCase {
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }
    async execute(id) {
        const produto = await this.produtoRepository.findById(id);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }
        return produto;
    }
}
exports.GetProdutoUseCase = GetProdutoUseCase;
//# sourceMappingURL=GetProdutoUseCase.js.map