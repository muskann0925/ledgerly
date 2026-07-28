import PDFDocument from "pdfkit";

export interface PaymentReceiptPdfData {
  receiptNumber: string;
  paymentDate: Date | string;
  amountPaid: number;
  paymentMethod: string;
  paymentReference?: string | null;
  invoiceNumber: string;
  remainingBalance: number;
  notes?: string | null;
  client: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
}

export const generatePaymentReceiptPdfBuffer = (data: PaymentReceiptPdfData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header Banner Accent (Green)
      doc.rect(0, 0, 600, 10).fill("#16A34A");

      // Company Branding
      doc.fillColor("#0F172A").fontSize(20).font("Helvetica-Bold").text("LEDGERLY BILLING", 40, 25);
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Enterprise Financial Operations", 40, 48);

      // Title & Receipt Number
      doc.fillColor("#16A34A").fontSize(18).font("Helvetica-Bold").text("PAYMENT RECEIPT", 360, 25, { align: "right" });
      doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text(data.receiptNumber, 360, 46, { align: "right" });

      doc.moveTo(40, 84).lineTo(555, 84).strokeColor("#E2E8F0").lineWidth(1).stroke();

      // Info Grid
      const yInfo = 100;
      doc.fillColor("#64748B").fontSize(8).font("Helvetica-Bold").text("RECEIVED FROM:", 40, yInfo);
      doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text(data.client.companyName, 40, yInfo + 12);
      doc.fillColor("#334155").fontSize(8).font("Helvetica").text(`Contact: ${data.client.contactPerson}`, 40, yInfo + 25);
      doc.text(`Email: ${data.client.email} | Phone: ${data.client.phone}`, 40, yInfo + 35);

      doc.fillColor("#64748B").fontSize(8).font("Helvetica-Bold").text("PAYMENT DETAILS:", 360, yInfo);
      doc.fillColor("#334155").fontSize(8).font("Helvetica").text("Payment Date:", 360, yInfo + 12);
      doc.fillColor("#0F172A").font("Helvetica-Bold").text(new Date(data.paymentDate).toLocaleDateString("en-IN"), 450, yInfo + 12);
      doc.fillColor("#334155").font("Helvetica").text("Payment Method:", 360, yInfo + 24);
      doc.fillColor("#0F172A").font("Helvetica-Bold").text(data.paymentMethod, 450, yInfo + 24);
      doc.fillColor("#334155").font("Helvetica").text("Payment Ref #:", 360, yInfo + 36);
      doc.fillColor("#0F172A").font("Helvetica-Bold").text(data.paymentReference || "N/A", 450, yInfo + 36);
      doc.fillColor("#334155").font("Helvetica").text("Invoice Ref #:", 360, yInfo + 48);
      doc.fillColor("#0F172A").font("Helvetica-Bold").text(data.invoiceNumber, 450, yInfo + 48);

      // Amount Summary Box
      const yBox = yInfo + 80;
      doc.rect(40, yBox, 515, 90).fill("#F0FDF4").strokeColor("#BBF7D0").lineWidth(1).stroke();

      doc.fillColor("#166534").fontSize(12).font("Helvetica-Bold").text("AMOUNT RECEIVED", 60, yBox + 15);
      doc.fontSize(22).font("Helvetica-Bold").text(`INR ${data.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 60, yBox + 32);

      doc.fillColor("#475569").fontSize(9).font("Helvetica").text(`Remaining Invoice Balance: INR ${data.remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 60, yBox + 62);

      if (data.notes) {
        doc.fillColor("#64748B").fontSize(8).font("Helvetica-Bold").text("NOTES / MEMO:", 40, yBox + 110);
        doc.fillColor("#334155").font("Helvetica").fontSize(8).text(data.notes, 40, yBox + 122);
      }

      doc.fillColor("#94A3B8").fontSize(8).font("Helvetica").text("This document acknowledges payment received into Ledgerly Accounts.", 40, 780, { align: "center" });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
