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

            // Calcular vagas restantes nos prédios
            // Busca prédios com vagas > 0
            const predios = await sequelize.query(`
                SELECT id, vagas FROM "Predios" WHERE vagas IS NOT NULL AND vagas > 0
            `, { type: QueryTypes.SELECT });

            // Busca endereçamentos disponíveis agrupados por prédio
            const enderecamentosPorPredio = await sequelize.query(`
                SELECT "idPredio", COUNT(*) as total FROM "Enderecamentos" WHERE "disponivel" = true GROUP BY "idPredio"
            `, { type: QueryTypes.SELECT });

            let vagasRestantes = null;
            if (predios.length > 0) {
                let totalVagas = 0;
                let totalEnderecamentos = 0;
                predios.forEach((predio: any) => {
                    totalVagas += predio.vagas;
                    const enderecamentos = enderecamentosPorPredio.find((e: any) => e.idPredio === predio.id);
                    // Garantir que o objeto é do tipo certo e acessar o campo corretamente
                    if (enderecamentos && (typeof enderecamentos === 'object')) {
                        const total = (enderecamentos as { total: string | number }).total;
                        totalEnderecamentos += total ? parseInt(total as string) : 0;
                    }
                });
                vagasRestantes = totalVagas - totalEnderecamentos;
            }

            res.json({
                success: true,
                data: {
                    produtosComEstoque: (produtosComEstoque[0] as any).total || 0,
                    metragemTotal: parseFloat((metragemTotal[0] as any).total || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }),
                    enderecamentosDisponiveis: (enderecamentosDisponiveis[0] as any).total || 0,
                    listasAtivas: (listasAtivas[0] as any).total || 0,
                    vagasRestantes: vagasRestantes
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
            // Produtos em ponta de estoque: qualquer lote com quantidade < 10*quantMinVenda e sem mais caixas no endereçamento
            const produtosPontaEstoque = await sequelize.query(`
                SELECT 
                    p.id as "produtoId",
                    p."descricao",
                    p."quantMinVenda",
                    f."razaoSocial" as fornecedor,
                    ei.lote,
                    ei.ton,
                    ei.bit,
                    ei.quantidade as "totalDisponivel",
                    (p."quantMinVenda" * 10) as limiteMinimo
                FROM "EstoqueItems" ei
                INNER JOIN "Produtos" p ON p.id = ei."produtoId"
                LEFT JOIN "Fornecedores" f ON p."idFornecedor" = f.id
                LEFT JOIN "Enderecamentos" e 
                    ON e."idProduto" = p.id 
                    AND e.lote = ei.lote 
                    AND e.tonalidade = ei.ton 
                    AND e.bitola = ei.bit
                    AND e."disponivel" = true
                GROUP BY p.id, p."descricao", p."quantMinVenda", f."razaoSocial", ei.lote, ei.ton, ei.bit, ei.quantidade
                HAVING 
                    SUM(COALESCE(e."quantCaixas", 0)) = 0 -- não há mais caixas desse lote no endereçamento disponivel
                    AND ei.quantidade < (p."quantMinVenda" * 10)
                    AND ei.quantidade > 0
                ORDER BY "totalDisponivel" ASC
                LIMIT 20
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
            // Estoque = soma das quantidades dos estoque_items
            const produtosEstoqueBaixo = await sequelize.query(`
                WITH produto_calculos AS (
                    SELECT 
                        p.id,
                        p."descricao",
                        p."quantMinVenda",
                        p."quantCaixas",
                        f."razaoSocial" as fornecedor,
                        COALESCE(SUM(CASE WHEN e."disponivel" = true THEN e."quantCaixas" ELSE 0 END), 0) * p."quantMinVenda" as deposito,
                        COALESCE(SUM(ei.quantidade), 0) as estoque,
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
