export interface TaxDefinition {
  id: string;
  name: string;
  code: string;
  type: string; // GST, CGST, SGST, IGST, TDS, VAT, CUSTOM
  category?: string | null;
  rate: number;
  valueType: "PERCENTAGE" | "FIXED";
  calculationType: "ADD" | "DEDUCT";
  country?: string | null;
  state?: string | null;
  isActive?: boolean;
}

export interface AppliedTaxSnapshot {
  taxId: string;
  taxName: string;
  taxCode: string;
  taxRate: number;
  type: "PERCENTAGE" | "FIXED";
  calculationType: "ADD" | "DEDUCT";
  taxAmount: number;
}

export interface TaxCalculationLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  taxIds?: string[];
  appliedTaxes?: AppliedTaxSnapshot[];
}

export interface CalculatedLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  appliedTaxes: AppliedTaxSnapshot[];
  total: number;
}

export interface TotalTaxBreakdownItem {
  taxId: string;
  taxName: string;
  taxCode: string;
  taxRate: number;
  calculationType: "ADD" | "DEDUCT";
  totalAmount: number;
}

export interface InvoiceTaxCalculationSummary {
  items: CalculatedLineItem[];
  subtotal: number;
  totalAdditiveTax: number;
  totalDeductionTax: number;
  grandTotal: number;
  netPayable: number;
  taxBreakdown: TotalTaxBreakdownItem[];
}

/**
 * Single source of truth calculation logic for Invoices & Line Items.
 * Calculates line amounts, applied tax snapshots, subtotal, totalAdditiveTax,
 * totalDeductionTax, grandTotal, and netPayable.
 */
export function calculateInvoiceTaxes(
  items: TaxCalculationLineItemInput[],
  taxMap: Map<string, TaxDefinition>
): InvoiceTaxCalculationSummary {
  let subtotal = 0;
  let totalAdditiveTax = 0;
  let totalDeductionTax = 0;
  const breakdownMap = new Map<string, TotalTaxBreakdownItem>();

  const calculatedItems: CalculatedLineItem[] = items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const lineAmount = Math.round(qty * price * 100) / 100;
    subtotal += lineAmount;

    let appliedTaxesSnapshots: AppliedTaxSnapshot[] = [];

    if (item.taxIds && item.taxIds.length > 0) {
      // De-duplicate tax IDs per line item
      const uniqueTaxIds = Array.from(new Set(item.taxIds));
      appliedTaxesSnapshots = uniqueTaxIds
        .map((taxId) => {
          const taxDef = taxMap.get(taxId);
          if (!taxDef || taxDef.isActive === false) return null;

          let taxAmount = 0;
          if (taxDef.valueType === "PERCENTAGE") {
            taxAmount = Math.round(((lineAmount * taxDef.rate) / 100) * 100) / 100;
          } else {
            taxAmount = Math.round(taxDef.rate * qty * 100) / 100;
          }

          const snapshot: AppliedTaxSnapshot = {
            taxId: taxDef.id,
            taxName: taxDef.name,
            taxCode: taxDef.code,
            taxRate: taxDef.rate,
            type: taxDef.valueType,
            calculationType: taxDef.calculationType,
            taxAmount,
          };

          return snapshot;
        })
        .filter((s): s is AppliedTaxSnapshot => s !== null);
    } else if (item.appliedTaxes && item.appliedTaxes.length > 0) {
      // Historical or pre-calculated snapshots passed directly
      appliedTaxesSnapshots = item.appliedTaxes;
    }

    // Accumulate taxes for this line item
    appliedTaxesSnapshots.forEach((snap) => {
      if (snap.calculationType === "DEDUCT") {
        totalDeductionTax += snap.taxAmount;
      } else {
        totalAdditiveTax += snap.taxAmount;
      }

      const existing = breakdownMap.get(snap.taxId);
      if (existing) {
        existing.totalAmount = Math.round((existing.totalAmount + snap.taxAmount) * 100) / 100;
      } else {
        breakdownMap.set(snap.taxId, {
          taxId: snap.taxId,
          taxName: snap.taxName,
          taxCode: snap.taxCode,
          taxRate: snap.taxRate,
          calculationType: snap.calculationType,
          totalAmount: snap.taxAmount,
        });
      }
    });

    return {
      description: item.description,
      quantity: qty,
      unitPrice: price,
      lineAmount,
      appliedTaxes: appliedTaxesSnapshots,
      total: lineAmount,
    };
  });

  subtotal = Math.round(subtotal * 100) / 100;
  totalAdditiveTax = Math.round(totalAdditiveTax * 100) / 100;
  totalDeductionTax = Math.round(totalDeductionTax * 100) / 100;
  const grandTotal = Math.round((subtotal + totalAdditiveTax) * 100) / 100;
  const netPayable = Math.max(0, Math.round((grandTotal - totalDeductionTax) * 100) / 100);

  return {
    items: calculatedItems,
    subtotal,
    totalAdditiveTax,
    totalDeductionTax,
    grandTotal,
    netPayable,
    taxBreakdown: Array.from(breakdownMap.values()),
  };
}

/**
 * Smart tax suggestion logic based on Company State vs Client State
 */
export function getSuggestedTaxCodes(companyState?: string | null, clientState?: string | null): string[] {
  if (!clientState || !companyState) {
    return ["CGST", "SGST"]; // Default fallback
  }

  const cleanCompanyState = companyState.trim().toLowerCase();
  const cleanClientState = clientState.trim().toLowerCase();

  if (cleanCompanyState === cleanClientState) {
    return ["CGST", "SGST"];
  } else {
    return ["IGST"];
  }
}
