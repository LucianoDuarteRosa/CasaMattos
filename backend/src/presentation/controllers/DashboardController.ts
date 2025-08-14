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
            const produtosComEstoque = await sequelize.query(`
                SELECT COUNT(*) as total 
                FROM "Produtos" 
                WHERE ("deposito" + "estoque") > 0
            `, {
                type: QueryTypes.SELECT
            });

            // Query para metragem total (sum do estoque + deposito)
            const metragemTotal = await sequelize.query(`
                SELECT SUM("deposito" + "estoque") as total 
                FROM "Produtos"
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
            const produtosPontaEstoque = await sequelize.query(`
                SELECT p.id, p."descricao", p."deposito", p."estoque", 
                       p."quantMinVenda", f."razaoSocial" as fornecedor,
                       (p."deposito" + p."estoque") as "totalDisponivel",
                       (p."quantMinVenda" * 10) as "limiteMinimo"
                FROM "Produtos" p
                LEFT JOIN "Fornecedores" f ON p."idFornecedor" = f.id
                WHERE (p."deposito" + p."estoque") < (p."quantMinVenda" * 10)
                  AND (p."deposito" + p."estoque") > 0
                  AND p."deposito" = 0
                ORDER BY (p."deposito" + p."estoque") ASC
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
            const produtosEstoqueBaixo = await sequelize.query(`
                SELECT p.id, p."descricao", p."deposito", p."estoque", 
                       p."quantMinVenda", p."quantCaixas", f."razaoSocial" as fornecedor,
                       (p."quantMinVenda" * COALESCE(p."quantCaixas", 1)) as "limiteCalculado",
                       ((p."quantMinVenda" * COALESCE(p."quantCaixas", 1)) * 0.5) as "cinquentaPorcento"
                FROM "Produtos" p
                LEFT JOIN "Fornecedores" f ON p."idFornecedor" = f.id
                WHERE p."deposito" > 0 
                  AND p."estoque" > 0
                  AND p."estoque" < ((p."quantMinVenda" * COALESCE(p."quantCaixas", 1)) * 0.5)
                ORDER BY p."estoque" ASC
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
