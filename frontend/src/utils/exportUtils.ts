import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface EnderecamentoExport {
    id: number;
    tonalidade: string;
    bitola: string;
    disponivel: boolean;
    idProduto: number;
    idPredio: number;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    idLista?: number;
    createdAt?: Date;
    updatedAt?: Date;
    produto?: {
        codInterno?: string;
        descricao?: string;
        codFabricante?: string;
        quantMinVenda?: number;
    };
    predio?: {
        nomePredio?: string;
        rua?: {
            nomeRua?: string;
        };
    };
}

export const exportarListaToPDF = (enderecamentos: EnderecamentoExport[], nomeList: string) => {
    const doc = new jsPDF();

    // Configurar fonte para suportar caracteres especiais
    doc.setFont('helvetica');

    // Título
    doc.setFontSize(20);
    doc.text(`Lista de Separação: ${nomeList}`, 20, 20);

    // Data
    const agora = new Date();
    doc.setFontSize(10);
    doc.text(`Gerado em: ${agora.toLocaleString('pt-BR')}`, 20, 30);

    // Preparar dados para a tabela
    const tableData = enderecamentos.map(enderecamento => [
        enderecamento.produto?.codInterno || 'N/A',
        enderecamento.produto?.descricao || 'N/A',
        enderecamento.produto?.codFabricante || 'N/A',
        enderecamento.tonalidade || 'N/A',
        enderecamento.bitola || 'N/A',
        (enderecamento.quantCaixas || 'N/A').toString(),
        (enderecamento.produto?.quantMinVenda || 'N/A').toString(),
        `${enderecamento.predio?.rua?.nomeRua || 'N/A'} - ${enderecamento.predio?.nomePredio || 'N/A'}`
    ]);

    // Criar tabela
    autoTable(doc, {
        startY: 40,
        head: [['Cód. Interno', 'Descrição', 'Cód. Fabricante', 'Tonalidade', 'Bitola', 'Qtd Caixas', 'Qtd Min Venda', 'Localização']],
        body: tableData,
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
        },
        columnStyles: {
            1: { cellWidth: 40 }, // Descrição
            7: { cellWidth: 35 }, // Localização
        },
        margin: { top: 10 },
        tableWidth: 'auto',
        pageBreak: 'auto',
    });

    // Salvar o arquivo
    const fileName = `Lista_Separacao_${nomeList.replace(/[^a-zA-Z0-9]/g, '_')}_${agora.getFullYear()}${(agora.getMonth() + 1).toString().padStart(2, '0')}${agora.getDate().toString().padStart(2, '0')}.pdf`;
    doc.save(fileName);
};

export const exportarListaToExcel = (enderecamentos: EnderecamentoExport[], nomeList: string) => {
    // Preparar dados para o Excel
    const data = enderecamentos.map(enderecamento => ({
        'Código Interno': enderecamento.produto?.codInterno || 'N/A',
        'Descrição': enderecamento.produto?.descricao || 'N/A',
        'Código Fabricante': enderecamento.produto?.codFabricante || 'N/A',
        'Tonalidade': enderecamento.tonalidade || 'N/A',
        'Bitola': enderecamento.bitola || 'N/A',
        'Quantidade de Caixas': enderecamento.quantCaixas || 'N/A',
        'Quantidade Mínima de Venda': enderecamento.produto?.quantMinVenda || 'N/A',
        'Localização': `${enderecamento.predio?.rua?.nomeRua || 'N/A'} - ${enderecamento.predio?.nomePredio || 'N/A'}`,
        'Lote': enderecamento.lote || '',
        'Observação': enderecamento.observacao || ''
    }));

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Configurar largura das colunas
    const colWidths = [
        { wch: 15 }, // Código Interno
        { wch: 40 }, // Descrição
        { wch: 18 }, // Código Fabricante
        { wch: 12 }, // Tonalidade
        { wch: 10 }, // Bitola
        { wch: 18 }, // Quantidade de Caixas
        { wch: 20 }, // Quantidade Mínima de Venda
        { wch: 35 }, // Localização
        { wch: 15 }, // Lote
        { wch: 30 }, // Observação
    ];
    ws['!cols'] = colWidths;

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Lista de Separação');

    // Gerar arquivo e fazer download
    const agora = new Date();
    const fileName = `Lista_Separacao_${nomeList.replace(/[^a-zA-Z0-9]/g, '_')}_${agora.getFullYear()}${(agora.getMonth() + 1).toString().padStart(2, '0')}${agora.getDate().toString().padStart(2, '0')}.xlsx`;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
};
