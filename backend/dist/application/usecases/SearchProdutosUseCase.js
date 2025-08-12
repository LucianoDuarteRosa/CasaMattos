"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchProdutosUseCase = void 0;
class SearchProdutosUseCase {
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }
    async execute(term) {
        if (!term || term.trim().length < 2) {
            throw new Error('Termo de busca deve ter pelo menos 2 caracteres');
        }
        return await this.produtoRepository.search(term.trim());
    }
}
exports.SearchProdutosUseCase = SearchProdutosUseCase;
//# sourceMappingURL=SearchProdutosUseCase.js.map