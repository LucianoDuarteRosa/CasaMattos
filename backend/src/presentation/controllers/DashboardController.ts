import { Request, Response } from 'express';
import { ProdutoRepository } from '../../infrastructure/repositories/ProdutoRepository';
import { ListaRepository } from '../../infrastructure/repositories/ListaRepository';
import { EnderecamentoRepository } from '../../infrastructure/repositories/EnderecamentoRepository';
import sequelize from '../../infrastructure/database/connection';
import { QueryTypes } from 'sequelize';

export class DashboardController {
    private produtoRepository: ProdutoRepository;
    private listaRepository: ListaRepository;
    private enderecamentoRepository: EnderecamentoRepository;

    constructor() {
        this.produtoRepository = new ProdutoRepository();
        this.listaRepository = new ListaRepository();
        this.enderecamentoRepository = new EnderecamentoRepository();
    }

    async getStats(req: Request, res: Response): Promise<void> {
        try {
            // Query para produtos com estoque (deposito + estoque > 0)
            // Deposito = soma das quantCaixas dos endereçamentos * quantMinVenda
            // Estoque = soma das quantidade dos estoque_items * quantMinVenda
            const produtosComEstoque = await sequelize.query(`
                WITH produto_calculos AS (
                    SELECT 
                        p.id,
                        p."quantMinVenda",
                        COALESCE(SUM(e."quantCaixas"), 0) * p."quantMinVenda" as deposito_total,
                        COALESCE(SUM(ei.quantidade), 0) * p."quantMinVenda" as estoque_total
                    FROM "Produtos" p
                    LEFT JOIN "Enderecamentos" e ON e."idProduto" = p.id
                    LEFT JOIN "EstoqueItems" ei ON ei."produtoId" = p.id
                    GROUP BY p.id, p."quantMinVenda"
                )
                SELECT COUNT(*) as total 
                FROM produto_calculos 
                WHERE (deposito_total + estoque_total) > 0
            `, {
                type: QueryTypes.SELECT
            });

            // Query para metragem total (sum do estoque + deposito)
            const metragemTotal = await sequelize.query(`
                WITH produto_calculos AS (
                    SELECT 
                        p.id,
                        p."quantMinVenda",
                        COALESCE(SUM(e."quantCaixas"), 0) * p."quantMinVenda" as deposito_total,
                        COALESCE(SUM(ei.quantidade), 0) * p."quantMinVenda" as estoque_total
                    FROM "Produtos" p
                    LEFT JOIN "Enderecamentos" e ON e."idProduto" = p.id
                    LEFT JOIN "EstoqueItems" ei ON ei."produtoId" = p.id
                    GROUP BY p.id, p."quantMinVenda"
                )
                SELECT SUM(deposito_total + estoque_total) as total 
                FROM produto_calculos
            `, {
                type: QueryTypes.SELECT
            });

            // Query para endereçamentos disponíveis
            const enderecamentosDisponiveis = await sequelize.query(`
                SELECT COUNT(*) as total 
                FROM "Enderecamentos" 
                WHERE "disponivel" = true
            `, {
                type: QueryTypes.SELECT
            });

            // Query para listas ativas (não finalizadas)
            const listasAtivas = await sequelize.query(`
                SELECT COUNT(*) as total 
                FROM "Listas" 
                WHERE "disponivel" = true
            `, {
                type: QueryTypes.SELECT
            });

            res.json({
                success: true,
                data: {
                    produtosComEstoque: (produtosComEstoque[0] as any).total || 0,
                    metragemTotal: parseFloat((metragemTotal[0] as any).total || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }),
                    enderecamentosDisponiveis: (enderecamentosDisponiveis[0] as any).total || 0,
                    listasAtivas: (listasAtivas[0] as any).total || 0
                }
            });

        } catch (error: any) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar estatísticas'
            });
        }
    }

    async getProdutosPontaEstoque(req: Request, res: Response): Promise<void> {
        try {
            // Produtos em ponta de estoque: menos de 10 * quantMinVenda no total (estoque + deposito)
            // Deposito = soma das quantCaixas dos endereçamentos * quantMinVenda
            // Estoque = soma das quantidade dos estoque_items * quantMinVenda
            const produtosPontaEstoque = await sequelize.query(`
                WITH produto_calculos AS (
                    SELECT 
                        p.id,
                        p."descricao",
                        p."quantMinVenda",
                        f."razaoSocial" as fornecedor,
                        COALESCE(SUM(e."quantCaixas"), 0) * p."quantMinVenda" as deposito,
                        COALESCE(SUM(ei.quantidade), 0) * p."quantMinVenda" as estoque,
                        (COALESCE(SUM(e."quantCaixas"), 0) + COALESCE(SUM(ei.quantidade), 0)) * p."quantMinVenda" as totalDisponivel,
                        (p."quantMinVenda" * 10) as limiteMinimo
                    FROM "Produtos" p
                    LEFT JOIN "Fornecedores" f ON p."idFornecedor" = f.id
                    LEFT JOIN "Enderecamentos" e ON e."idProduto" = p.id
                    LEFT JOIN "EstoqueItems" ei ON ei."produtoId" = p.id
                    GROUP BY p.id, p."descricao", p."quantMinVenda", f."razaoSocial"
                )
                SELECT id, descricao, deposito, estoque, "quantMinVenda", fornecedor, 
                       totalDisponivel, limiteMinimo
                FROM produto_calculos
                WHERE totalDisponivel < limiteMinimo
                  AND totalDisponivel > 0
                  AND deposito = 0
                ORDER BY totalDisponivel ASC
                LIMIT 10
            `, {
                type: QueryTypes.SELECT
            });

            res.json({
                success: true,
                data: produtosPontaEstoque
            });

        } catch (error: any) {
            console.error('Erro ao buscar produtos em ponta de estoque:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar produtos em ponta de estoque'
            });
        }
    }

    async getProdutosEstoqueBaixoSeparacao(req: Request, res: Response): Promise<void> {
        try {
            // Produtos com estoque baixo na separação 
            // Regra: estoque < 50% de (quantMinVenda * quantCaixas)
            // Só aparecem produtos que tenham estoque no depósito (deposito > 0)
            // Deposito = soma das quantCaixas dos endereçamentos * quantMinVenda
            // Estoque = soma das quantidade dos estoque_items * quantMinVenda
            const produtosEstoqueBaixo = await sequelize.query(`
                WITH produto_calculos AS (
                    SELECT 
                        p.id,
                        p."descricao",
                        p."quantMinVenda",
                        p."quantCaixas",
                        f."razaoSocial" as fornecedor,
                        COALESCE(SUM(e."quantCaixas"), 0) * p."quantMinVenda" as deposito,
                        COALESCE(SUM(ei.quantidade), 0) * p."quantMinVenda" as estoque,
                        (p."quantMinVenda" * COALESCE(p."quantCaixas", 1)) as limiteCalculado,
                        ((p."quantMinVenda" * COALESCE(p."quantCaixas", 1)) * 0.5) as cinquentaPorcento
                    FROM "Produtos" p
                    LEFT JOIN "Fornecedores" f ON p."idFornecedor" = f.id
                    LEFT JOIN "Enderecamentos" e ON e."idProduto" = p.id
                    LEFT JOIN "EstoqueItems" ei ON ei."produtoId" = p.id
                    GROUP BY p.id, p."descricao", p."quantMinVenda", p."quantCaixas", f."razaoSocial"
                )
                SELECT id, descricao, deposito, estoque, "quantMinVenda", "quantCaixas", 
                       fornecedor, limiteCalculado, cinquentaPorcento
                FROM produto_calculos
                WHERE deposito > 0 
                  AND estoque > 0
                  AND estoque < cinquentaPorcento
                ORDER BY estoque ASC
                LIMIT 10
            `, {
                type: QueryTypes.SELECT
            });

            res.json({
                success: true,
                data: produtosEstoqueBaixo
            });

        } catch (error: any) {
            console.error('Erro ao buscar produtos com estoque baixo na separação:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar produtos com estoque baixo na separação'
            });
        }
    }
}
