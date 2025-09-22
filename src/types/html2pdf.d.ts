
declare module 'html2pdf.js' {
    interface Html2PdfOptions {
      margin?: number | [number, number] | [number, number, number, number];
      filename?: string;
      image?: { type: 'jpeg' | 'png' | 'webp', quality: number };
      html2canvas?: { scale?: number, useCORS?: boolean };
      jsPDF?: { unit?: 'pt' | 'mm' | 'cm' | 'in', format?: string | [number, number], orientation?: 'portrait' | 'landscape' };
    }
  
    interface Html2Pdf {
      from(element: HTMLElement): this;
      set(options: Html2PdfOptions): this;
      save(): Promise<void>;
      outputPdf(type?: string): Promise<any>;
    }
  
    const html2pdf: () => Html2Pdf;
    export = html2pdf;
}
