
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

        // Cabeçalho
        sheet.addRow([
            'Id', 'Cod. Interno', 'Produto', 'Cod. Fabricante', 'Lote', 'Tonalidade', 'Bitola', 'Rua', 'Prédio', 'Quant. Min. Venda', 'Quant. Caixas', 'Cod. Barras', 'Fornecedor'
        ]);

        let lastRua = '';
        let lastPredio = '';
        // Cache para evitar múltiplas queries do mesmo fornecedor
        const fornecedorCache: Record<number, string> = {};

        for (const e of enderecamentos) {
            const rua = e.predio?.rua?.nomeRua || '';
            const predio = e.predio?.nomePredio || '';
            if (rua !== lastRua) {
                if (lastRua !== '') sheet.addRow([]); // separador visual
                lastRua = rua;
                lastPredio = '';
            }
            if (predio !== lastPredio) {
                if (lastPredio !== '') sheet.addRow([]); // separador visual
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

            sheet.addRow([
                e.id,
                e.produto?.codInterno || '',
                e.produto?.descricao || '',
                e.produto?.codFabricante || '',
                e.lote || '',
                e.tonalidade,
                e.bitola,
                rua,
                predio,
                e.produto?.quantMinVenda || '',
                e.quantCaixas || '',
                e.produto?.codBarras || '',
                fornecedorNome
            ]);
        }

        // Layout bonito: cabeçalho em negrito
        sheet.getRow(1).font = { bold: true };
        sheet.columns?.forEach((col: any) => { col.width = 20; });

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }
}
