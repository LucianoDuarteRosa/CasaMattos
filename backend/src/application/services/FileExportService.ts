
import ExcelJS from 'exceljs';
import { ListEnderecamentosDisponiveisUseCase } from '../usecases/ListEnderecamentosDisponiveisUseCase';
import { EnderecamentoRepository } from '../../infrastructure/repositories/EnderecamentoRepository';
import { FornecedorRepository } from '../../infrastructure/repositories/FornecedorRepository';
import { IEnderecamento } from '../../domain/entities/Enderecamento';

export class FileExportService {
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
}
