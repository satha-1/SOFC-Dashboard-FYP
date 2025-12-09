import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface AutoTableOptions {
    startY?: number;
    head?: (string | number)[][];
    body?: (string | number)[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: {
      fillColor?: [number, number, number];
      textColor?: [number, number, number];
      fontStyle?: string;
    };
    styles?: {
      fontSize?: number;
      cellPadding?: number;
    };
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}

