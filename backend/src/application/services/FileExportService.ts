
import ExcelJS from 'exceljs';
import { ProdutoRepository } from '../../infrastructure/repositories/ProdutoRepository';
import { EstoqueItemRepository } from '../../infrastructure/repositories/EstoqueItemRepository';
import { EnderecamentoRepository } from '../../infrastructure/repositories/EnderecamentoRepository';
import { ListEnderecamentosDisponiveisUseCase } from '../usecases/ListEnderecamentosDisponiveisUseCase';
import { FornecedorRepository } from '../../infrastructure/repositories/FornecedorRepository';
import { IProduto } from '../../domain/entities/Produto';
import { IEstoqueItem } from '../../domain/entities/EstoqueItem';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

export class FileExportService {
    /**
     * Exporta inventário geral ou por fornecedor, agrupando por lote/tonalidade/bitola e separando estoque e endereçamento.
     */
    /**
     * Exporta endereçamentos disponíveis em um arquivo Excel, ordenado por rua e prédio, com separadores.
     */
    static async exportarEnderecamentosExcel(): Promise<Buffer> {
        // Instanciar repositórios
        const enderecamentoRepo = new EnderecamentoRepository();
        const fornecedorRepo = new FornecedorRepository();
        const useCase = new ListEnderecamentosDisponiveisUseCase(enderecamentoRepo);
        const enderecamentos: IEnderecamento[] = await useCase.execute();

        // Ordena por rua e prédio
        enderecamentos.sort((a, b) => {
            // Ordenação: Produto, Rua, Prédio, Lote, Tonalidade, Bitola
            const prodA = a.produto?.descricao || '';
            const prodB = b.produto?.descricao || '';
            if (prodA !== prodB) return prodA.localeCompare(prodB);
            const ruaA = a.predio?.rua?.nomeRua || '';
            const ruaB = b.predio?.rua?.nomeRua || '';
            if (ruaA !== ruaB) return ruaA.localeCompare(ruaB);
            const predioA = a.predio?.nomePredio || '';
            const predioB = b.predio?.nomePredio || '';
            if (predioA !== predioB) return predioA.localeCompare(predioB);
            const loteA = a.lote || '';
            const loteB = b.lote || '';
            if (loteA !== loteB) return loteA.localeCompare(loteB);
            const tonalidadeA = a.tonalidade || '';
            const tonalidadeB = b.tonalidade || '';
            if (tonalidadeA !== tonalidadeB) return tonalidadeA.localeCompare(tonalidadeB);
            const bitolaA = a.bitola || '';
            const bitolaB = b.bitola || '';
            return bitolaA.localeCompare(bitolaB);
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Endereçamentos Disponíveis');

        // Definição dos campos
        const columns = [
            'Id', 'Cod. Interno', 'Produto', 'Cod. Fabricante', 'Lote', 'Tonalidade', 'Bitola', 'Rua', 'Prédio', 'Quant. Min. Venda', 'Quant. Caixas', 'Custo', 'Cod. Barras', 'Fornecedor', 'Criado em', 'Atualizado em'
        ];
        sheet.columns = columns.map(() => ({ width: 20 }));

        let lastRua = '';
        let lastPredio = '';
        let rowIndex = 1;
        // Cache para evitar múltiplas queries do mesmo fornecedor
        const fornecedorCache: Record<number, string> = {};

        for (let i = 0; i < enderecamentos.length; i++) {
            const e = enderecamentos[i];
            const rua = e.predio?.rua?.nomeRua || '';
            const predio = e.predio?.nomePredio || '';
            let novoGrupo = false;
            if (rua !== lastRua || predio !== lastPredio) {
                // Pular linha se não for o primeiro grupo
                if (lastRua !== '' || lastPredio !== '') {
                    sheet.addRow([]);
                    rowIndex++;
                }
                // Linha mesclada com Rua e Prédio
                const label = `${rua} - ${predio}`;
                sheet.mergeCells(rowIndex, 1, rowIndex, columns.length);
                const cell = sheet.getCell(rowIndex, 1);
                cell.value = label;
                cell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                // Cinza escuro
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF444444' } };
                rowIndex++;

                // Cabeçalho
                const headerRow = sheet.addRow(columns);
                headerRow.font = { bold: true, size: 12 };
                headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
                headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB0B0B0' } };
                rowIndex++;
                novoGrupo = true;
                lastRua = rua;
                lastPredio = predio;
            }

            // Buscar nome do fornecedor se necessário
            let fornecedorNome = '';
            if (e.produto?.idFornecedor) {
                if (fornecedorCache[e.produto.idFornecedor]) {
                    fornecedorNome = fornecedorCache[e.produto.idFornecedor];
                } else {
                    const fornecedor = await fornecedorRepo.findById(e.produto.idFornecedor);
                    fornecedorNome = fornecedor?.razaoSocial || '';
                    fornecedorCache[e.produto.idFornecedor] = fornecedorNome;
                }
            }

            // Alternância de cor de fundo (zebra)
            const zebraColor = (i % 2 === 0) ? 'FFFFFFFF' : 'FFF2F2F2';
            // Formatar datas para horário brasileiro
            const formatDate = (date?: Date) => {
                if (!date) return '';
                const d = new Date(date);
                d.setHours(d.getHours() - d.getTimezoneOffset() / 60 - 3); // Ajuste para GMT-3
                return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            };
            // Formatar quantidade mínima de venda
            const formatQtdMin = (qtd?: number) => {
                if (qtd === undefined || qtd === null || isNaN(qtd)) return '';
                return Number(qtd).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };
            // Formatar custo
            const formatCusto = (custo?: number) => {
                if (custo === undefined || custo === null || isNaN(custo)) return '';
                return Number(custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            };
            const dataRow = sheet.addRow([
                e.id,
                e.produto?.codInterno || '',
                e.produto?.descricao || '',
                e.produto?.codFabricante || '',
                e.lote || '',
                e.tonalidade,
                e.bitola,
                rua,
                predio,
                formatQtdMin(e.produto?.quantMinVenda),
                e.quantCaixas || '',
                formatCusto(e.produto?.custo),
                e.produto?.codBarras || '',
                fornecedorNome,
                formatDate(e.createdAt),
                formatDate(e.updatedAt)
            ]);
            dataRow.font = { size: 11 };
            dataRow.alignment = { vertical: 'middle', horizontal: 'center' };
            dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraColor } };
            rowIndex++;
        }

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }

    /**
     * Exporta inventário geral ou por fornecedor, agrupando por lote/tonalidade/bitola e separando estoque e endereçamento.
     */
    static async exportarInventarioExcel(fornecedorId?: number): Promise<Buffer> {
        const produtoRepo = new ProdutoRepository();
        const estoqueRepo = new EstoqueItemRepository();
        const enderecamentoRepo = new EnderecamentoRepository();

        // Buscar produtos
        const produtos: IProduto[] = fornecedorId
            ? await produtoRepo.findByFornecedor(fornecedorId)
            : await produtoRepo.findAll();

        // Montar dados agrupados
        type Agrupado = {
            produto: IProduto;
            lote: string;
            tonalidade: string;
            bitola: string;
            estoque: number;
            enderecamento: number;
            total: number;
        };
        const linhas: Agrupado[] = [];

        for (const produto of produtos) {
            // Buscar estoque e endereçamentos do produto
            const estoqueItems: IEstoqueItem[] = await estoqueRepo.findByProdutoId(produto.id);
            const enderecamentos: IEnderecamento[] = await enderecamentoRepo.findByProduto(produto.id);

            // Agrupar estoque
            const map: Record<string, Agrupado> = {};
            for (const item of estoqueItems) {
                const key = `${item.lote}|${item.ton}|${item.bit}`;
                if (!map[key]) {
                    map[key] = {
                        produto,
                        lote: item.lote,
                        tonalidade: item.ton,
                        bitola: item.bit,
                        estoque: 0,
                        enderecamento: 0,
                        total: 0
                    };
                }
                map[key].estoque += item.quantidade;
            }
            // Agrupar endereçamentos
            for (const end of enderecamentos) {
                if (!end.disponivel || !end.quantCaixas || end.quantCaixas <= 0) continue;
                const key = `${end.lote?.toUpperCase() || ''}|${end.tonalidade}|${end.bitola}`;
                if (!map[key]) {
                    map[key] = {
                        produto,
                        lote: end.lote?.toUpperCase() || '',
                        tonalidade: end.tonalidade,
                        bitola: end.bitola,
                        estoque: 0,
                        enderecamento: 0,
                        total: 0
                    };
                }
                map[key].enderecamento += (end.quantCaixas || 0) * (produto.quantMinVenda || 1);
            }
            // Calcular total e adicionar às linhas
            for (const key in map) {
                map[key].total = map[key].estoque + map[key].enderecamento;
                linhas.push(map[key]);
            }
        }

        // Gerar Excel com layout simples para importação
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Inventário');
        const columns = [
            'Produto', 'Lote', 'Tonalidade', 'Bitola', 'Estoque', 'Endereçamento', 'Total'
        ];
        sheet.columns = columns.map((header, idx) => {
            let col: any = { header, width: [30, 15, 15, 15, 15, 18, 15][idx] };
            if (idx >= 4) col.style = { numFmt: '#,##0.00' };
            return col;
        });

        // Adicionar cabeçalho estilizado
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB0B0B0' } };

        // Adicionar linhas de dados, apenas uma linha por registro, sem linha extra com o nome do produto
        for (let i = 0; i < linhas.length; i++) {
            const l = linhas[i];
            const row = sheet.addRow([
                l.produto.descricao,
                l.lote,
                l.tonalidade,
                l.bitola,
                typeof l.estoque === 'number' && !isNaN(l.estoque) ? Number(l.estoque.toFixed(2)) : 0,
                typeof l.enderecamento === 'number' && !isNaN(l.enderecamento) ? Number(l.enderecamento.toFixed(2)) : 0,
                typeof l.total === 'number' && !isNaN(l.total) ? Number(l.total.toFixed(2)) : 0
            ]);
            row.font = { size: 11 };
            row.alignment = { vertical: 'middle', horizontal: 'center' };
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: (i % 2 === 0) ? 'FFFFFFFF' : 'FFF2F2F2' } };
        }

        // Não precisa mais garantir formatação numérica pois já está formatado como string pt-BR

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }
}
