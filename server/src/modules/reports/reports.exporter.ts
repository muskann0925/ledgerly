import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import type {
  FullRevenueReport,
  FullInvoiceReport,
  FullTaxReport,
  ProfitAndLossReport,
  ClientPerformanceReport,
} from "./reports.types";

export class ReportsExporter {
  /**
   * Generate PDF Document Buffer using PDFKit
   */
  async generatePdfReport(
    reportType: string,
    data: any
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header Banner
      doc
        .fillColor("#F97316")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("LEDGERLY SAAS BILLING", 40, 40);

      doc
        .fillColor("#64748B")
        .fontSize(10)
        .font("Helvetica")
        .text(`Financial & Analytical Report: ${reportType.toUpperCase()}`, 40, 65);

      doc
        .fontSize(9)
        .text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 40, 80);

      doc.moveDown(2);
      doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(40, 95).lineTo(550, 95).stroke();

      let y = 110;

      if (reportType === "revenue") {
        const revData = data as FullRevenueReport;
        doc.fillColor("#0F172A").fontSize(14).font("Helvetica-Bold").text("Revenue Summary", 40, y);
        y += 20;

        doc.fontSize(10).font("Helvetica").text(`Total Revenue: INR ${revData.summary.totalRevenue.toLocaleString()}`, 40, y);
        y += 15;
        doc.text(`Paid Revenue: INR ${revData.summary.paidAmount.toLocaleString()}`, 40, y);
        y += 15;
        doc.text(`Outstanding Revenue: INR ${revData.summary.outstandingAmount.toLocaleString()}`, 40, y);
        y += 25;

        // Revenue Table Header
        doc.fillColor("#1E293B").font("Helvetica-Bold").text("Client Name", 40, y);
        doc.text("Invoices", 250, y);
        doc.text("Paid (INR)", 350, y);
        doc.text("Outstanding (INR)", 450, y);
        y += 15;

        doc.font("Helvetica").fontSize(9);
        revData.byClient.slice(0, 15).forEach((client) => {
          if (y > 750) {
            doc.addPage();
            y = 40;
          }
          doc.text(client.clientName.substring(0, 28), 40, y);
          doc.text(String(client.invoiceCount), 250, y);
          doc.text(client.paidRevenue.toLocaleString(), 350, y);
          doc.text(client.outstandingRevenue.toLocaleString(), 450, y);
          y += 15;
        });
      } else if (reportType === "tax") {
        const taxData = data as FullTaxReport;
        doc.fillColor("#0F172A").fontSize(14).font("Helvetica-Bold").text("Tax Summary & Net Liability", 40, y);
        y += 20;

        doc.fontSize(10).font("Helvetica").text(`Tax Collected (Sales): INR ${taxData.summary.taxCollected.toLocaleString()}`, 40, y);
        y += 15;
        doc.text(`Tax Paid (Expenses): INR ${taxData.summary.taxPaid.toLocaleString()}`, 40, y);
        y += 15;
        doc.font("Helvetica-Bold").text(`Net Tax Liability: INR ${taxData.summary.netTaxLiability.toLocaleString()}`, 40, y);
        y += 25;

        doc.font("Helvetica-Bold").text("Tax Rate Slab", 40, y);
        doc.text("Taxable Subtotal (INR)", 200, y);
        doc.text("Tax Collected (INR)", 400, y);
        y += 15;

        doc.font("Helvetica").fontSize(9);
        taxData.taxByRate.forEach((slab) => {
          doc.text(`${slab.taxRate}% Slab`, 40, y);
          doc.text(slab.taxableInvoiceSubtotal.toLocaleString(), 200, y);
          doc.text(slab.taxCollected.toLocaleString(), 400, y);
          y += 15;
        });
      } else {
        doc.fillColor("#0F172A").fontSize(12).font("Helvetica").text("Report Summary", 40, y);
        y += 20;
        doc.fontSize(10).text(JSON.stringify(data, null, 2).substring(0, 500), 40, y);
      }

      doc.end();
    });
  }

  /**
   * Generate Excel Document (.xlsx) Buffer using ExcelJS
   */
  async generateExcelReport(
    reportType: string,
    data: any
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Ledgerly Billing System";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(reportType.toUpperCase());

    // Title Row
    sheet.mergeCells("A1:E1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `LEDGERLY FINANCIAL REPORT - ${reportType.toUpperCase()}`;
    titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF97316" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    sheet.addRow([]); // Blank line

    if (reportType === "revenue") {
      const revData = data as FullRevenueReport;

      // Summary Block
      sheet.addRow(["Total Revenue", revData.summary.totalRevenue]);
      sheet.addRow(["Paid Revenue", revData.summary.paidAmount]);
      sheet.addRow(["Outstanding Revenue", revData.summary.outstandingAmount]);
      sheet.addRow(["Total Invoices", revData.summary.totalInvoices]);
      sheet.addRow([]);

      // Header Row
      const headerRow = sheet.addRow([
        "Client ID",
        "Client Name",
        "Total Billed (INR)",
        "Paid Amount (INR)",
        "Outstanding (INR)",
        "Invoice Count",
      ]);

      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
      });

      revData.byClient.forEach((client) => {
        sheet.addRow([
          client.clientId,
          client.clientName,
          client.totalRevenue,
          client.paidRevenue,
          client.outstandingRevenue,
          client.invoiceCount,
        ]);
      });
    } else if (reportType === "tax") {
      const taxData = data as FullTaxReport;

      sheet.addRow(["Tax Collected (Sales)", taxData.summary.taxCollected]);
      sheet.addRow(["Tax Paid (Expenses)", taxData.summary.taxPaid]);
      sheet.addRow(["Net Tax Liability", taxData.summary.netTaxLiability]);
      sheet.addRow([]);

      const headerRow = sheet.addRow(["Tax Rate (%)", "Taxable Subtotal (INR)", "Tax Collected (INR)", "Invoice Count"]);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
      });

      taxData.taxByRate.forEach((slab) => {
        sheet.addRow([slab.taxRate, slab.taxableInvoiceSubtotal, slab.taxCollected, slab.invoiceCount]);
      });
    } else {
      sheet.addRow(["Report Output", JSON.stringify(data)]);
    }

    // Auto-fit Column Widths
    sheet.columns.forEach((column) => {
      let maxLen = 15;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 10;
        if (len > maxLen) maxLen = len;
      });
      column.width = Math.min(maxLen + 3, 50);
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  /**
   * Generate CSV String
   */
  generateCsvReport(reportType: string, data: any): string {
    if (reportType === "revenue") {
      const revData = data as FullRevenueReport;
      const rows = [
        ["Client Name", "Total Revenue (INR)", "Paid Amount (INR)", "Outstanding (INR)", "Invoice Count"],
        ...revData.byClient.map((c) => [
          `"${c.clientName.replace(/"/g, '""')}"`,
          c.totalRevenue,
          c.paidRevenue,
          c.outstandingRevenue,
          c.invoiceCount,
        ]),
      ];
      return rows.map((r) => r.join(",")).join("\n");
    } else if (reportType === "tax") {
      const taxData = data as FullTaxReport;
      const rows = [
        ["Tax Rate Slab", "Taxable Subtotal (INR)", "Tax Collected (INR)", "Invoice Count"],
        ...taxData.taxByRate.map((s) => [`"${s.taxRate}%"`, s.taxableInvoiceSubtotal, s.taxCollected, s.invoiceCount]),
      ];
      return rows.map((r) => r.join(",")).join("\n");
    }

    return "Summary," + JSON.stringify(data);
  }
}
