declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf';

    interface AutoTableColumn {
        header?: string;
        dataKey?: string;
    }

    interface AutoTableOptions {
        head?: string[][];
        body?: string[][];
        columns?: AutoTableColumn[];
        startY?: number;
        styles?: {
            fontSize?: number;
            cellPadding?: number;
        };
        headStyles?: {
            fillColor?: number[];
            textColor?: number | string;
            fontStyle?: string;
        };
        columnStyles?: {
            [key: number]: {
                cellWidth?: number;
            };
        };
        margin?: {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        };
        tableWidth?: string | number;
        pageBreak?: string;
    }

    export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
