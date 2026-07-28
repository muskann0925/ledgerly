import PDFDocument from "pdfkit";

export interface QuotationPdfData {
  quotationNumber: string;
  issueDate: Date | string;
  expiryDate: Date | string;
  status: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string | null;
  terms?: string | null;
  client: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    gstNumber?: string | null;
    billingAddress?: string | null;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount: number;
    total: number;
  }>;
}

export const generateQuotationPdfBuffer = (data: QuotationPdfData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const currencySymbol = data.currency === "INR" ? "INR " : `${data.currency} `;

      // Header Brand Accent
      doc.rect(0, 0, 600, 12).fill("#F97316");

      // Company Title & Quotation Header
      doc.fillColor("#0F172A").fontSize(20).font("Helvetica-Bold").text("LEDGERLY", 40, 30);
      doc.fillColor("#64748B").fontSize(9).font("Helvetica").text("Official Quotation & Estimate", 40, 54);

      // Quotation Number & Status Box
      doc.fillColor("#0F172A").fontSize(18).font("Helvetica-Bold").text(data.quotationNumber, 400, 30, { align: "right" });
      doc.fillColor("#F97316").fontSize(10).font("Helvetica-Bold").text(`STATUS: ${data.status}`, 400, 52, { align: "right" });

      doc.moveTo(40, 75).lineTo(555, 75).strokeColor("#E2E8F0").lineWidth(1).stroke();

      // Bill To & Quotation Info Columns
      doc.fillColor("#475569").fontSize(10).font("Helvetica-Bold").text("PREPARED FOR:", 40, 90);
      doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text(data.client.companyName, 40, 104);
      doc.fillColor("#334155").fontSize(9).font("Helvetica");
      doc.text(`Attn: ${data.client.contactPerson}`, 40, 118);
      doc.text(`Email: ${data.client.email}`, 40, 130);
      doc.text(`Phone: ${data.client.phone}`, 40, 142);
      if (data.client.gstNumber) {
        doc.text(`GSTIN: ${data.client.gstNumber}`, 40, 154);
      }
      if (data.client.billingAddress) {
        doc.text(`Address: ${data.client.billingAddress}`, 40, 166, { width: 230 });
      }

      // Metadata Block Right Side
      doc.fillColor("#475569").fontSize(10).font("Helvetica-Bold").text("QUOTATION DETAILS:", 350, 90);
      doc.fillColor("#334155").fontSize(9).font("Helvetica");
      const issueDateStr = new Date(data.issueDate).toLocaleDateString("en-IN");
      const expiryDateStr = new Date(data.expiryDate).toLocaleDateString("en-IN");
      doc.text(`Issue Date: ${issueDateStr}`, 350, 104);
      doc.text(`Valid Until / Expiry: ${expiryDateStr}`, 350, 118);
      doc.text(`Currency: ${data.currency}`, 350, 130);

      // Line Items Table Header
      let y = 210;
      doc.rect(40, y, 515, 22).fill("#F8FAFC");
      doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold");
      doc.text("ITEM DESCRIPTION", 48, y + 6);
      doc.text("QTY", 280, y + 6, { width: 40, align: "right" });
      doc.text("RATE", 330, y + 6, { width: 60, align: "right" });
      doc.text("TAX", 400, y + 6, { width: 50, align: "right" });
      doc.text("AMOUNT", 460, y + 6, { width: 85, align: "right" });

      y += 28;
      doc.font("Helvetica").fontSize(9);

      data.items.forEach((item) => {
        if (y > 700) {
          doc.addPage();
          y = 40;
        }

        doc.fillColor("#0F172A").text(item.description, 48, y, { width: 220 });
        doc.text(item.quantity.toString(), 280, y, { width: 40, align: "right" });
        doc.text(`${currencySymbol}${item.unitPrice.toFixed(2)}`, 330, y, { width: 60, align: "right" });
        doc.text(`${item.taxRate}%`, 400, y, { width: 50, align: "right" });
        doc.text(`${currencySymbol}${item.total.toFixed(2)}`, 460, y, { width: 85, align: "right" });

        y += 22;
      });

      y += 10;
      doc.moveTo(40, y).lineTo(555, y).strokeColor("#CBD5E1").lineWidth(0.5).stroke();
      y += 15;

      // Summary Totals Box Right Side
      const summaryX = 350;
      doc.font("Helvetica").fontSize(9).fillColor("#475569");
      doc.text("Subtotal:", summaryX, y);
      doc.text(`${currencySymbol}${data.subtotal.toFixed(2)}`, 460, y, { width: 85, align: "right" });

      if (data.discount > 0) {
        y += 16;
        doc.text("Discount:", summaryX, y);
        doc.text(`-${currencySymbol}${data.discount.toFixed(2)}`, 460, y, { width: 85, align: "right" });
      }

      if (data.tax > 0) {
        y += 16;
        doc.text("GST / Tax:", summaryX, y);
        doc.text(`${currencySymbol}${data.tax.toFixed(2)}`, 460, y, { width: 85, align: "right" });
      }

      y += 20;
      doc.rect(summaryX - 5, y - 4, 210, 26).fill("#FFF7ED");
      doc.fillColor("#C2410C").font("Helvetica-Bold").fontSize(11);
      doc.text("Total Proposal Amount:", summaryX, y + 2);
      doc.text(`${currencySymbol}${data.total.toFixed(2)}`, 460, y + 2, { width: 85, align: "right" });

      // Notes & Terms
      y += 45;
      if (data.notes || data.terms) {
        if (y > 680) {
          doc.addPage();
          y = 40;
        }

        if (data.notes) {
          doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(9).text("Notes / Scope of Work:", 40, y);
          doc.fillColor("#475569").font("Helvetica").fontSize(8.5).text(data.notes, 40, y + 14, { width: 500 });
          y += 40;
        }

        if (data.terms) {
          doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(9).text("Terms & Conditions:", 40, y);
          doc.fillColor("#475569").font("Helvetica").fontSize(8.5).text(data.terms, 40, y + 14, { width: 500 });
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
