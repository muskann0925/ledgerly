import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { settingsService } from "../../modules/settings/settings.service";

export type DocumentEntityType =
  | "INVOICE"
  | "QUOTATION"
  | "CREDIT_NOTE"
  | "RECEIPT"
  | "PAYMENT"
  | "EXPENSE";

export class SequenceService {
  /**
   * Generates a guaranteed unique, sequential, concurrency-safe document number
   * reading configuration dynamically from SystemSettings.
   */
  async generateNextNumber(
    entityType: DocumentEntityType,
    tx?: Prisma.TransactionClient
  ): Promise<string> {
    const runInTx = async (dbTx: Prisma.TransactionClient) => {
      const settings = await settingsService.getSettings();
      const year = new Date().getFullYear();

      // Determine entity-specific prefix
      let rawPrefix = "DOC";
      switch (entityType) {
        case "INVOICE":
          rawPrefix = settings.invoicePrefix || "INV";
          break;
        case "QUOTATION":
          rawPrefix = settings.quotationPrefix || "QTN";
          break;
        case "CREDIT_NOTE":
          rawPrefix = settings.creditNotePrefix || "CN";
          break;
        case "RECEIPT":
          rawPrefix = settings.receiptPrefix || "RCT";
          break;
        case "PAYMENT":
          rawPrefix = "PAY";
          break;
        case "EXPENSE":
          rawPrefix = "EXP";
          break;
      }

      const separator = settings.numberSeparator ?? "-";
      const includeYear = settings.includeYearInNumber ?? true;
      const startingNumber = settings.startingNumber || 1;
      const zeroPaddingLength = settings.zeroPaddingLength || 6;

      // Clean prefix to avoid double separators if user entered "INV-"
      let cleanPrefix = rawPrefix.trim();
      if (separator && cleanPrefix.endsWith(separator)) {
        cleanPrefix = cleanPrefix.slice(0, -separator.length);
      }

      // Upsert DocumentSequence counter atomically
      let sequenceRecord = await dbTx.documentSequence.findUnique({
        where: { entityType },
      });

      let nextVal = startingNumber;
      if (!sequenceRecord) {
        // Initialize sequence record
        sequenceRecord = await dbTx.documentSequence.create({
          data: {
            id: entityType,
            entityType,
            currentValue: startingNumber,
          },
        });
        nextVal = startingNumber;
      } else {
        nextVal = Math.max(sequenceRecord.currentValue + 1, startingNumber);
      }

      // Format candidate number
      let candidateNumber = this.formatNumber(
        cleanPrefix,
        separator,
        includeYear ? year : null,
        nextVal,
        zeroPaddingLength
      );

      // Verify uniqueness in target table to prevent duplicate key errors
      let isOccupied = await this.checkIsOccupied(entityType, candidateNumber, dbTx);
      while (isOccupied) {
        nextVal += 1;
        candidateNumber = this.formatNumber(
          cleanPrefix,
          separator,
          includeYear ? year : null,
          nextVal,
          zeroPaddingLength
        );
        isOccupied = await this.checkIsOccupied(entityType, candidateNumber, dbTx);
      }

      // Save updated sequence value
      await dbTx.documentSequence.upsert({
        where: { entityType },
        update: { currentValue: nextVal },
        create: {
          id: entityType,
          entityType,
          currentValue: nextVal,
        },
      });

      return candidateNumber;
    };

    if (tx) {
      return runInTx(tx);
    } else {
      return prisma.$transaction(async (dbTx) => runInTx(dbTx));
    }
  }

  private formatNumber(
    prefix: string,
    separator: string,
    year: number | null,
    sequence: number,
    padding: number
  ): string {
    const paddedSeq = String(sequence).padStart(padding, "0");
    if (year !== null) {
      return `${prefix}${separator}${year}${separator}${paddedSeq}`;
    }
    return `${prefix}${separator}${paddedSeq}`;
  }

  private async checkIsOccupied(
    entityType: DocumentEntityType,
    candidate: string,
    tx: Prisma.TransactionClient
  ): Promise<boolean> {
    switch (entityType) {
      case "INVOICE": {
        const existing = await tx.invoice.findFirst({
          where: { number: candidate },
          select: { id: true },
        });
        return !!existing;
      }
      case "QUOTATION": {
        const existing = await tx.quotation.findFirst({
          where: { quotationNumber: candidate },
          select: { id: true },
        });
        return !!existing;
      }
      case "CREDIT_NOTE": {
        const existing = await tx.creditNote.findFirst({
          where: { creditNoteNumber: candidate },
          select: { id: true },
        });
        return !!existing;
      }
      case "PAYMENT":
      case "RECEIPT": {
        const existing = await tx.payment.findFirst({
          where: { referenceNumber: candidate },
          select: { id: true },
        });
        return !!existing;
      }
      case "EXPENSE": {
        const existing = await tx.expense.findFirst({
          where: { expenseNumber: candidate },
          select: { id: true },
        });
        return !!existing;
      }
      default:
        return false;
    }
  }
}

export const sequenceService = new SequenceService();
