import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";

export class EmailService {
  private transporter: Transporter;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      // Fallback transporter for dev / testing mode (logs email output to console)
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  private getEmailTemplate(contentHtml: string, title: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F8F9FA;
            margin: 0;
            padding: 0;
            color: #1E293B;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #E2E8F0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          .header {
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            padding: 32px 24px;
            text-align: center;
          }
          .brand {
            color: #FFFFFF;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .brand-accent {
            color: #FF5400;
          }
          .content {
            padding: 36px 32px;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            color: #0F172A;
            margin-top: 0;
            margin-bottom: 16px;
          }
          .text {
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background-color: #FF5400;
            color: #FFFFFF !important;
            font-weight: 600;
            font-size: 15px;
            padding: 14px 28px;
            border-radius: 10px;
            text-decoration: none;
            margin: 12px 0 24px 0;
            box-shadow: 0 4px 12px rgba(255, 84, 0, 0.25);
          }
          .otp-box {
            background-color: #F1F5F9;
            border: 2px dashed #CBD5E1;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #0F172A;
            margin: 20px 0;
          }
          .notice {
            background-color: #FFF7ED;
            border-left: 4px solid #FF5400;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 13px;
            color: #9A3412;
            margin-top: 24px;
          }
          .footer {
            background-color: #F8F9FA;
            padding: 24px 32px;
            text-align: center;
            font-size: 12px;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand"><span class="brand-accent">Ledgerly</span></div>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>This is an automated security notification from Ledgerly Billing System.</p>
            <p>If you need support, contact <a href="mailto:support@ledgerly.io" style="color: #FF5400;">support@ledgerly.io</a>.</p>
            <p>&copy; ${new Date().getFullYear()}  Ledgerly. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(toEmail: string, resetUrl: string, minutesExpiry: number = 15): Promise<void> {
    const html = this.getEmailTemplate(
      `
      <h2 class="title">Password Reset Request</h2>
      <p class="text">We received a request to reset the password for your Ledgerly account (<strong>${toEmail}</strong>).</p>
      <p class="text">Click the button below to set up a new password for your account. This link is valid for <strong>${minutesExpiry} minutes</strong> and can only be used once.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
      </div>
      <p class="text" style="font-size: 13px; color: #64748B;">If the button above does not work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #FF5400; word-break: break-all;">${resetUrl}</a></p>
      <div class="notice">
        <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact support immediately. Your password will remain unchanged.
      </div>
    `,
      "Reset Your Ledgerly Password"
    );

    const info = await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: toEmail,
      subject: "Action Required: Reset Your Ledgerly Password",
      html,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[EmailService] Password Reset email sent to ${toEmail}. Message ID/Content:`, info);
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string, minutesExpiry: number = 5): Promise<void> {
    const html = this.getEmailTemplate(
      `
      <h2 class="title">Two-Factor Authentication Code</h2>
      <p class="text">Your single-use verification code to log in to your Ledgerly account is:</p>
      <div class="otp-box">${otpCode}</div>
      <p class="text">This code expires in <strong>${minutesExpiry} minutes</strong>. Enter this code on the verification screen to complete your login.</p>
      <div class="notice">
        <strong>Security Alert:</strong> Never share this code with anyone, including Ledgerly support staff.
      </div>
    `,
      "Your Ledgerly 2FA Verification Code"
    );

    const info = await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: toEmail,
      subject: `${otpCode} is your Ledgerly verification code`,
      html,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[EmailService] 2FA OTP email sent to ${toEmail}. Info:`, info);
    }
  }

  async sendPasswordChangedEmail(toEmail: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const html = this.getEmailTemplate(
      `
      <h2 class="title">Password Successfully Changed</h2>
      <p class="text">The password for your Ledgerly account (<strong>${toEmail}</strong>) was successfully updated on <strong>${new Date().toUTCString()}</strong>.</p>
      ${ipAddress ? `<p class="text" style="font-size: 13px;">Request IP: <code>${ipAddress}</code></p>` : ""}
      ${userAgent ? `<p class="text" style="font-size: 13px;">Device / Browser: <code>${userAgent}</code></p>` : ""}
      <div class="notice">
        <strong>Important:</strong> If you did NOT perform this action, your account may be compromised. Please contact support or reset your password immediately.
      </div>
    `,
      "Security Notice: Password Updated"
    );

    const info = await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: toEmail,
      subject: "Security Notification: Your Ledgerly Password Was Changed",
      html,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[EmailService] Password Changed notification email sent to ${toEmail}. Info:`, info);
    }
  }

  async send2FaStatusEmail(toEmail: string, enabled: boolean): Promise<void> {
    const html = this.getEmailTemplate(
      `
      <h2 class="title">Two-Factor Authentication ${enabled ? "Enabled" : "Disabled"}</h2>
      <p class="text">Two-Factor Authentication (2FA) for your Ledgerly account (<strong>${toEmail}</strong>) has been <strong>${enabled ? "activated" : "deactivated"}</strong>.</p>
      <div class="notice">
        <strong>Security Notice:</strong> If you did not make this change, please contact support immediately.
      </div>
    `,
      `Security Alert: 2FA ${enabled ? "Enabled" : "Disabled"}`
    );

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: toEmail,
      subject: `Security Alert: Two-Factor Authentication ${enabled ? "Enabled" : "Disabled"}`,
      html,
    });
  }

  /**
   * Generic Document Email Sender with optional PDF Attachment
   */
  async sendDocumentEmail(options: {
    toEmail: string;
    subject: string;
    messageText?: string;
    contentHtml?: string;
    pdfBuffer?: Buffer;
    fileName?: string;
  }): Promise<void> {
    const formattedMessage = (options.messageText || "")
      .split("\n")
      .map((line) => `<p class="text" style="margin-bottom: 12px;">${line || "&nbsp;"}</p>`)
      .join("");

    const bodyHtml = options.contentHtml || formattedMessage;
    const fullHtml = this.getEmailTemplate(bodyHtml, options.subject);

    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    if (options.pdfBuffer && options.fileName) {
      attachments.push({
        filename: options.fileName,
        content: options.pdfBuffer,
        contentType: "application/pdf",
      });
    }

    const info = await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.toEmail,
      subject: options.subject,
      html: fullHtml,
      attachments,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[EmailService] Document Email sent to ${options.toEmail}. Info:`, info);
    }
  }

  /**
   * Send Invoice Email with attached PDF
   */
  async sendInvoiceEmail(
    toEmail: string,
    subject: string,
    message: string,
    invoice: any,
    pdfBuffer?: Buffer
  ): Promise<void> {
    const formattedText = message
      ? message.split("\n").map((line) => `<p class="text" style="margin-bottom: 12px;">${line}</p>`).join("")
      : `<p class="text">Please find attached your invoice <strong>#${invoice.number}</strong>.</p>`;

    const detailsBox = `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="font-size: 14px; color: #64748B; margin-bottom: 6px;">Invoice Summary</div>
        <div style="font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 12px;">
          ${invoice.currency || "INR"} ${Number(invoice.netPayable || invoice.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <div style="font-size: 13px; color: #475569;">
          <strong>Invoice Number:</strong> ${invoice.number}<br>
          <strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}<br>
          <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br>
          <strong>Balance Due:</strong> ${invoice.currency || "INR"} ${Number(invoice.balanceDue ?? (invoice.netPayable || invoice.grandTotal || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      </div>
    `;

    await this.sendDocumentEmail({
      toEmail,
      subject: subject || `Invoice #${invoice.number} from  Ledgerly`,
      contentHtml: `${formattedText}${detailsBox}`,
      pdfBuffer,
      fileName: `Invoice_${invoice.number}.pdf`,
    });
  }

  /**
   * Send Quotation Email with attached PDF
   */
  async sendQuotationEmail(
    toEmail: string,
    subject: string,
    message: string,
    quotation: any,
    pdfBuffer?: Buffer
  ): Promise<void> {
    const formattedText = message
      ? message.split("\n").map((line) => `<p class="text" style="margin-bottom: 12px;">${line}</p>`).join("")
      : `<p class="text">Please find attached quotation <strong>#${quotation.quotationNumber}</strong>.</p>`;

    const detailsBox = `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="font-size: 14px; color: #64748B; margin-bottom: 6px;">Quotation Summary</div>
        <div style="font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 12px;">
          ${quotation.currency || "INR"} ${Number(quotation.netPayable || quotation.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <div style="font-size: 13px; color: #475569;">
          <strong>Quotation Number:</strong> ${quotation.quotationNumber}<br>
          <strong>Valid Until:</strong> ${new Date(quotation.expiryDate).toLocaleDateString()}
        </div>
      </div>
    `;

    await this.sendDocumentEmail({
      toEmail,
      subject: subject || `Quotation #${quotation.quotationNumber} from  Ledgerly`,
      contentHtml: `${formattedText}${detailsBox}`,
      pdfBuffer,
      fileName: `Quotation_${quotation.quotationNumber}.pdf`,
    });
  }

  /**
   * Send Payment Receipt Email with attached PDF
   */
  async sendPaymentReceiptEmail(
    toEmail: string,
    subject: string,
    message: string,
    payment: any,
    pdfBuffer?: Buffer
  ): Promise<void> {
    const receiptNum = payment.referenceNumber || payment.id.slice(-6).toUpperCase();
    const formattedText = message
      ? message.split("\n").map((line) => `<p class="text" style="margin-bottom: 12px;">${line}</p>`).join("")
      : `<p class="text">Thank you for your payment! Here is your official payment receipt for payment <strong>#${receiptNum}</strong>.</p>`;

    const detailsBox = `
      <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="font-size: 14px; color: #166534; margin-bottom: 6px;">Payment Received</div>
        <div style="font-size: 24px; font-weight: 800; color: #15803D; margin-bottom: 12px;">
          INR ${Number(payment.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <div style="font-size: 13px; color: #166534;">
          <strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}<br>
          <strong>Method:</strong> ${payment.paymentMethod}<br>
          ${payment.invoice?.number ? `<strong>Applied to Invoice:</strong> #${payment.invoice.number}<br>` : ""}
          ${payment.referenceNumber ? `<strong>Reference / Transaction ID:</strong> ${payment.referenceNumber}<br>` : ""}
        </div>
      </div>
    `;

    await this.sendDocumentEmail({
      toEmail,
      subject: subject || `Payment Receipt #${receiptNum} from  Ledgerly`,
      contentHtml: `${formattedText}${detailsBox}`,
      pdfBuffer,
      fileName: `Receipt_${receiptNum}.pdf`,
    });
  }

  /**
   * Send Client Account Statement Email with attached PDF
   */
  async sendClientStatementEmail(
    toEmail: string,
    subject: string,
    message: string,
    client: any,
    pdfBuffer?: Buffer
  ): Promise<void> {
    const formattedText = message
      ? message.split("\n").map((line) => `<p class="text" style="margin-bottom: 12px;">${line}</p>`).join("")
      : `<p class="text">Dear <strong>${client.contactPerson || client.companyName}</strong>,<br><br>Please find attached your account summary and statement of transactions.</p>`;

    await this.sendDocumentEmail({
      toEmail,
      subject: subject || `Account Statement for ${client.companyName} -  Ledgerly`,
      contentHtml: formattedText,
      pdfBuffer,
      fileName: `Statement_${client.companyName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    });
  }

  /**
   * Send Test Email from Settings Page
   */
  async sendTestEmail(toEmail: string): Promise<void> {
    const html = this.getEmailTemplate(
      `
      <h2 class="title">SMTP Configuration Test Successful 🎉</h2>
      <p class="text">Congratulations! Your email system for <strong> Ledgerly</strong> is properly configured and operational.</p>
      <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px; font-size: 13px; color: #166534; margin: 20px 0;">
        <strong>Server Host:</strong> ${env.SMTP_HOST}<br>
        <strong>Port:</strong> ${env.SMTP_PORT} (${env.SMTP_SECURE ? "SSL/TLS Secure" : "STARTTLS"})<br>
        <strong>Authenticated User:</strong> ${env.SMTP_USER}<br>
        <strong>Sent At:</strong> ${new Date().toLocaleString()}
      </div>
      <p class="text">All system emails, including invoices, quotations, receipts, and 2FA notifications, can now be dispatched to clients.</p>
    `,
      "SMTP Test Email - Ledgerly"
    );

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: toEmail,
      subject: "Test Email:  Ledgerly Email Service Operational",
      html,
    });
  }
}

export const emailService = new EmailService();
