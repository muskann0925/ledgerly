import PDFDocument from "pdfkit";

export interface StatementTransactionItem {
  date: Date | string;
  type: "INVOICE" | "PAYMENT" | "CREDIT_NOTE";
  referenceNumber: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface StatementPdfData {
  statementNumber: string;
  startDate: Date | string;
  endDate: Date | string;
  openingBalance: number;
  closingBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  totalCredits: number;
  outstandingBalance: number;
  client: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  transactions: StatementTransactionItem[];
}

export const generateStatementPdfBuffer = (data: StatementPdfData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const formatDate = (date: Date | string) =>
        new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

      const formatCurrency = (amt: number) =>
        `INR ${amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // Top Banner
      doc.rect(0, 0, 600, 10).fill("#0F172A");

      // Company Header
      doc.fillColor("#0F172A").fontSize(20).font("Helvetica-Bold").text("LEDGERLY BILLING", 40, 25);
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Enterprise Financial Operations", 40, 48);

      // Title & Statement Number
      doc.fillColor("#0F172A").fontSize(16).font("Helvetica-Bold").text("ACCOUNT STATEMENT", 360, 25, { align: "right" });
      doc.fillColor("#64748B").fontSize(8).font("Helvetica-Bold").text(`STATEMENT #: ${data.statementNumber}`, 360, 44, { align: "right" });
      doc.text(`PERIOD: ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`, 360, 56, { align: "right" });

      doc.moveTo(40, 75).lineTo(555, 75).strokeColor("#E2E8F0").lineWidth(1).stroke();

      // Client Info & Summary Box
      const yInfo = 88;
      doc.fillColor("#64748B").fontSize(8).font("Helvetica-Bold").text("STATEMENT FOR:", 40, yInfo);
      doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text(data.client.companyName, 40, yInfo + 12);
      doc.fillColor("#334155").fontSize(8).font("Helvetica").text(`Contact: ${data.client.contactPerson}`, 40, yInfo + 25);
      doc.text(`Email: ${data.client.email} | Phone: ${data.client.phone}`, 40, yInfo + 35);

      // Card Box
      doc.rect(340, yInfo, 215, 50).fill("#F8FAFC").strokeColor("#E2E8F0").lineWidth(1).stroke();
      doc.fillColor("#475569").fontSize(8).font("Helvetica").text("Opening Balance:", 350, yInfo + 8);
      doc.fillColor("#0F172A").font("Helvetica-Bold").text(formatCurrency(data.openingBalance), 450, yInfo + 8, { width: 95, align: "right" });

      doc.fillColor("#475569").font("Helvetica").text("Closing Balance:", 350, yInfo + 28);
      doc.fillColor("#4F46E5").font("Helvetica-Bold").text(formatCurrency(data.closingBalance), 450, yInfo + 28, { width: 95, align: "right" });

      // Ledger Table Header
      let yTable = yInfo + 68;
      doc.rect(40, yTable, 515, 20).fill("#F1F5F9");
      doc.fillColor("#334155").fontSize(8).font("Helvetica-Bold");
      doc.text("DATE", 48, yTable + 5);
      doc.text("TYPE", 110, yTable + 5);
      doc.text("REF #", 175, yTable + 5);
      doc.text("DEBIT (+)", 310, yTable + 5, { width: 70, align: "right" });
      doc.text("CREDIT (-)", 385, yTable + 5, { width: 70, align: "right" });
      doc.text("BALANCE", 460, yTable + 5, { width: 85, align: "right" });

      yTable += 24;

      doc.font("Helvetica").fontSize(8).fillColor("#1E293B");
      if (data.transactions.length === 0) {
        doc.text("No transactions recorded during this period.", 48, yTable);
        yTable += 20;
      } else {
        data.transactions.forEach((tx) => {
          if (yTable > 700) {
            doc.addPage();
            yTable = 40;
          }

          doc.text(formatDate(tx.date), 48, yTable);
          doc.text(tx.type, 110, yTable);
          doc.text(tx.referenceNumber, 175, yTable, { width: 130 });
          doc.text(tx.debit > 0 ? formatCurrency(tx.debit) : "-", 310, yTable, { width: 70, align: "right" });
          doc.text(tx.credit > 0 ? formatCurrency(tx.credit) : "-", 385, yTable, { width: 70, align: "right" });
          doc.text(formatCurrency(tx.runningBalance), 460, yTable, { width: 85, align: "right" });

          yTable += 18;
          doc.moveTo(40, yTable - 3).lineTo(555, yTable - 3).strokeColor("#F8FAFC").lineWidth(0.5).stroke();
        });
      }

      yTable += 10;

      // Final Summary
      if (yTable > 680) {
        doc.addPage();
        yTable = 40;
      }

      doc.rect(260, yTable, 295, 75).fill("#F8FAFC").strokeColor("#CBD5E1").lineWidth(1).stroke();
      let ySum = yTable + 8;

      const drawStatRow = (lbl: string, val: string, bold: boolean = false) => {
        doc.font(bold ? "Helvetica-Bold" : "Helvetica")
          .fillColor(bold ? "#0F172A" : "#475569")
          .fontSize(8)
          .text(lbl, 270, ySum);
        doc.text(val, 430, ySum, { width: 115, align: "right" });
        ySum += 16;
      };

      drawStatRow("Total Invoiced (Billed):", formatCurrency(data.totalInvoiced));
      drawStatRow("Total Payments Received:", formatCurrency(data.totalPaid));
      drawStatRow("Total Credits / Adjustments:", formatCurrency(data.totalCredits));
      drawStatRow("OUTSTANDING BALANCE:", formatCurrency(data.outstandingBalance), true);

      doc.fillColor("#94A3B8").fontSize(8).font("Helvetica").text("Statement generated automatically by Ledgerly Billing Engine.", 40, 780, { align: "center" });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
