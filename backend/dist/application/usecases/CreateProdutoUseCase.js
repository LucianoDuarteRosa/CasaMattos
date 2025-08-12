"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProdutoUseCase = void 0;
class CreateProdutoUseCase {
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }
    async execute(data) {
        // Verificar se já existe um produto com o mesmo código interno
        const produtoExistente = await this.produtoRepository.findByCodInterno(data.codInterno);
        if (produtoExistente) {
            throw new Error('Já existe um produto com este código interno');
        }
        return await this.produtoRepository.create(data);
    }
}
exports.CreateProdutoUseCase = CreateProdutoUseCase;
//# sourceMappingURL=CreateProdutoUseCase.js.map