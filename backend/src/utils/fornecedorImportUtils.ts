import * as XLSX from 'xlsx';

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
