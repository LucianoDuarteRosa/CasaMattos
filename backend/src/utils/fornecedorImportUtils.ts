import XLSX from 'xlsx';

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
