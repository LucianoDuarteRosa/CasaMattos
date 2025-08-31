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
    return rows.map((row: any) => ({
        CodProduto: row.CodProduto || row.CodInterno || row.codProduto || row.codInterno || '',
        Descricao: row.Descricao || row.descricao || '',
        CodFabricante: row.CodFabricante || row.codFabricante || '',
        Lote: row.Lote || row.lote || '',
        Tonalidade: row.Tonalidade || row.tonalidade || '',
        Bitola: row.Bitola || row.bitola || '',
        QuantMinimaVenda: row.QuantMinimaVenda || row.QuantMinVenda || row.quantMinimaVenda || row.quantMinVenda || '',
        Quantidade: row.Quantidade || row.quantidade || '',
        // Aceita tanto "Rota Pedido" quanto "RotaPedido" e variações
        RotaPedido: row['Rota Pedido'] || row.RotaPedido || row['RotaPedido'] || '',
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
        CodInterno: row.CodInterno || row.codInterno || '',
        Descricao: row.Descricao || row.descricao || '',
        QuantMinVenda: row.QuantMinVenda || row.quantMinVenda || '',
        ValorCusto: row.ValorCusto || row.valorCusto || '',
        CodBarras: row.CodBarras || row.codBarras || '',
        CodFabricante: row.CodFabricante || row.codFabricante || '',
        QuantCaixas: row.QuantCaixas || row.quantCaixas || '',
        CnpjFornecedor: row.CnpjFornecedor || row.cnpjFornecedor || '',
        RazaoSocial: row.RazaoSocial || row.razaoSocial || '',
    }));
}

export function parseFornecedoresExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    return data.map((row: any) => ({
        cnpj: row.CnpjFornecedor || '',
        razaoSocial: row.RazaoSocial || ''
    }));
}

export function sanitizeCnpj(cnpj: string): string {
    return cnpj.replace(/[\.\/-]/g, '').trim();
}

export function isCnpjValid(cnpj: string): boolean {
    // Apenas checa se tem 14 dígitos
    return /^\d{14}$/.test(cnpj);
}
