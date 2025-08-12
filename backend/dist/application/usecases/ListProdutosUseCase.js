"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProdutosUseCase = void 0;
class ListProdutosUseCase {
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }
    async execute(page = 1, limit = 10, search) {
        const result = await this.produtoRepository.findWithPagination(page, limit, search);
        return {
            data: result.produtos,
            total: result.total,
            page,
            limit,
            totalPages: result.totalPages
        };
    }
}
exports.ListProdutosUseCase = ListProdutosUseCase;
//# sourceMappingURL=ListProdutosUseCase.js.map