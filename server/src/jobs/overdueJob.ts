import { prisma } from "../lib/prisma";
import { notificationService } from "../modules/notifications/notification.service";
import { notificationRepository } from "../modules/notifications/notification.repository";
import { NotificationType, InvoiceStatus } from "@prisma/client";

/**
 * Checks for unpaid invoices past their due date, updates their status to OVERDUE,
 * and emits an INVOICE_OVERDUE notification once without duplication.
 */
export async function runOverdueCheck() {
  try {
    const now = new Date();

    // Find invoices past due date that are not in terminal states (PAID, CANCELLED, REFUNDED)
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        isDeleted: false,
        dueDate: { lt: now },
        status: {
          notIn: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED, InvoiceStatus.REFUNDED],
        },
      },
      include: {
        client: true,
      },
    });

    for (const invoice of overdueInvoices) {
      // 1. Update status to OVERDUE if not already set
      if (invoice.status !== InvoiceStatus.OVERDUE) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.OVERDUE },
        });
      }

      // 2. Check if INVOICE_OVERDUE notification has already been created for this invoice
      const alreadyNotified = await notificationRepository.existsOverdueNotification(invoice.id);
      if (!alreadyNotified) {
        const clientName = invoice.client?.companyName || invoice.client?.contactPerson || "Client";
        const formattedAmount = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: invoice.currency || "INR",
        }).format(invoice.balanceDue || invoice.grandTotal);

        await notificationService.notifyUsersForEvent(
          NotificationType.INVOICE_OVERDUE,
          `Invoice Overdue: ${invoice.number}`,
          `Invoice ${invoice.number} for ${clientName} (${formattedAmount}) is overdue since ${new Date(invoice.dueDate).toLocaleDateString()}.`,
          "Invoice",
          invoice.id,
          {
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            clientName,
            balanceDue: invoice.balanceDue || invoice.grandTotal,
            dueDate: invoice.dueDate,
          }
        );
      }
    }
  } catch (error) {
    console.error("Error running overdue invoices job:", error);
  }
}

/**
 * Starts the overdue background checker.
 * Runs immediately on startup and then periodically (e.g. every 1 hour).
 */
export function startOverdueJob(intervalMs = 60 * 60 * 1000) {
  // Run on startup after a small delay
  setTimeout(() => {
    runOverdueCheck();
  }, 5000);

  // Set recurring interval
  setInterval(() => {
    runOverdueCheck();
  }, intervalMs);
}
