"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProdutoUseCase = void 0;
class UpdateProdutoUseCase {
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }
    async execute(id, data) {
        // Verificar se o produto existe
        const produtoExistente = await this.produtoRepository.findById(id);
        if (!produtoExistente) {
            throw new Error('Produto não encontrado');
        }
        // Se está alterando o código interno, verificar se não existe outro produto com o mesmo código
        if (data.codInterno && data.codInterno !== produtoExistente.codInterno) {
            const produtoComMesmoCodigo = await this.produtoRepository.findByCodInterno(data.codInterno);
            if (produtoComMesmoCodigo) {
                throw new Error('Já existe um produto com este código interno');
            }
        }
        const produtoAtualizado = await this.produtoRepository.update(id, data);
        if (!produtoAtualizado) {
            throw new Error('Erro ao atualizar produto');
        }
        return produtoAtualizado;
    }
}
exports.UpdateProdutoUseCase = UpdateProdutoUseCase;
//# sourceMappingURL=UpdateProdutoUseCase.js.map