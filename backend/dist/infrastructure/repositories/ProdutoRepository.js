"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoRepository = void 0;
const ProdutoModel_1 = __importDefault(require("../database/models/ProdutoModel"));
const sequelize_1 = require("sequelize");
class ProdutoRepository {
    async create(produto) {
        const novoProduto = await ProdutoModel_1.default.create(produto);
        return novoProduto.toJSON();
    }
    async findById(id) {
        const produto = await ProdutoModel_1.default.findByPk(id);
        return produto ? produto.toJSON() : null;
    }
    async findAll() {
        const produtos = await ProdutoModel_1.default.findAll({
            order: [['descricao', 'ASC']]
        });
        return produtos.map((produto) => produto.toJSON());
    }
    async update(id, data) {
        const produto = await ProdutoModel_1.default.findByPk(id);
        if (!produto) {
            return null;
        }
        await produto.update(data);
        return produto.toJSON();
    }
    async delete(id) {
        const rowsAffected = await ProdutoModel_1.default.destroy({ where: { id } });
        return rowsAffected > 0;
    }
    async findByCodInterno(codInterno) {
        const produto = await ProdutoModel_1.default.findOne({
            where: { codInterno }
        });
        return produto ? produto.toJSON() : null;
    }
    async findByDescricao(descricao) {
        const produtos = await ProdutoModel_1.default.findAll({
            where: {
                descricao: {
                    [sequelize_1.Op.iLike]: `%${descricao}%`
                }
            },
            order: [['descricao', 'ASC']]
        });
        return produtos.map((produto) => produto.toJSON());
    }
    async findByFornecedor(idFornecedor) {
        const produtos = await ProdutoModel_1.default.findAll({
            where: { idFornecedor },
            order: [['descricao', 'ASC']]
        });
        return produtos.map((produto) => produto.toJSON());
    }
    async search(term) {
        const produtos = await ProdutoModel_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    {
                        descricao: {
                            [sequelize_1.Op.iLike]: `%${term}%`
                        }
                    },
                    {
                        codBarras: {
                            [sequelize_1.Op.iLike]: `%${term}%`
                        }
                    },
                    {
                        codFabricante: {
                            [sequelize_1.Op.iLike]: `%${term}%`
                        }
                    }
                ]
            },
            order: [['descricao', 'ASC']]
        });
        return produtos.map((produto) => produto.toJSON());
    }
    async findWithPagination(page = 1, limit = 10, search) {
        const offset = (page - 1) * limit;
        let whereClause = {};
        if (search) {
            whereClause = {
                [sequelize_1.Op.or]: [
                    {
                        descricao: {
                            [sequelize_1.Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        codBarras: {
                            [sequelize_1.Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        codFabricante: {
                            [sequelize_1.Op.iLike]: `%${search}%`
                        }
                    }
                ]
            };
        }
        const { count, rows } = await ProdutoModel_1.default.findAndCountAll({
            where: whereClause,
            order: [['descricao', 'ASC']],
            limit,
            offset
        });
        return {
            produtos: rows.map((produto) => produto.toJSON()),
            total: count,
            totalPages: Math.ceil(count / limit)
        };
    }
}
exports.ProdutoRepository = ProdutoRepository;
//# sourceMappingURL=ProdutoRepository.js.map