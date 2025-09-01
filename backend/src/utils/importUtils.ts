import XLSX from 'xlsx';

/**
 * Faz o parse de um arquivo Excel (buffer) e retorna um array de separação.
 * Espera colunas: CodProduto, Descricao, CodFabricante, Lote, Tonalidade, Bitola, QuantMinimaVenda, Quantidade, Rota Pedido
 */
export function parseSeparacaoExcel(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    // Loga todas as linhas lidas do Excel para depuração
    console.log('Linhas lidas do Excel:', JSON.stringify(rows, null, 2));
    return rows.map((row: any) => ({
        CodProduto: (row.CodProduto || row.CodInterno || row.codProduto || row.codInterno || '').toString().toUpperCase(),
        Descricao: (row.Descricao || row.descricao || '').toString().toUpperCase(),
        CodFabricante: (row.CodFabricante || row.codFabricante || '').toString().toUpperCase(),
        Lote: (row.Lote || row.lote || '').toString().toUpperCase(),
        Tonalidade: (row.Tonalidade || row.tonalidade || '').toString().toUpperCase(),
        Bitola: (row.Bitola || row.bitola || '').toString().toUpperCase(),
        QuantMinimaVenda: (row.QuantMinimaVenda || row.QuantMinVenda || row.quantMinimaVenda || row.quantMinVenda || '').toString(),
        Quantidade: (row.Quantidade || row.quantidade || '').toString(),
        RotaPedido: (row['Rota Pedido'] || row.RotaPedido || row['RotaPedido'] || '').toString().toUpperCase(),
    }));
}

/**
 * Faz o parse de um arquivo Excel (buffer) e retorna um array de produtos.
 * Espera colunas: CodInterno, Descricao, QuantMinVenda, ValorCutos, CodBarras, CodFabricante, QuantCaixas, CnpjFornecedor, RazaoSocial
 */
export function parseProdutosExcel(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    // Normaliza os campos para garantir compatibilidade
    return rows.map((row: any) => ({
        CodInterno: (row.CodInterno || row.codInterno || '').toString().toUpperCase(),
        Descricao: (row.Descricao || row.descricao || '').toString().toUpperCase(),
        QuantMinVenda: (row.QuantMinVenda || row.quantMinVenda || '').toString(),
        ValorCusto: (row.ValorCusto || row.valorCusto || '').toString(),
        CodBarras: (row.CodBarras || row.codBarras || '').toString().toUpperCase(),
        CodFabricante: (row.CodFabricante || row.codFabricante || '').toString().toUpperCase(),
        QuantCaixas: (row.QuantCaixas || row.quantCaixas || '').toString(),
        CnpjFornecedor: (row.CnpjFornecedor || row.cnpjFornecedor || '').toString(),
        RazaoSocial: (row.RazaoSocial || row.razaoSocial || '').toString().toUpperCase(),
    }));
}

export function parseFornecedoresExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    return data.map((row: any) => ({
        cnpj: (row.CnpjFornecedor || '').toString(),
        razaoSocial: (row.RazaoSocial || '').toString().toUpperCase()
    }));
}

export function sanitizeCnpj(cnpj: string): string {
    return cnpj.replace(/[\.\/-]/g, '').trim();
}

export function isCnpjValid(cnpj: string): boolean {
    // Apenas checa se tem 14 dígitos
    return /^\d{14}$/.test(cnpj);
}
