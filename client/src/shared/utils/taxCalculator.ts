export interface ActiveTax {
  id: string;
  name: string;
  code: string;
  type: string;
  category?: string | null;
  rate: number;
  valueType: "PERCENTAGE" | "FIXED";
  calculationType: "ADD" | "DEDUCT";
  country?: string | null;
  state?: string | null;
  isActive: boolean;
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

export interface ClientLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  taxIds?: string[];
  appliedTaxes?: AppliedTaxSnapshot[];
}

export interface CalculatedClientLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  appliedTaxes: AppliedTaxSnapshot[];
  total: number;
}

export interface TaxBreakdownSummary {
  taxId: string;
  taxName: string;
  taxCode: string;
  taxRate: number;
  calculationType: "ADD" | "DEDUCT";
  totalAmount: number;
}

export interface ClientInvoiceCalculation {
  items: CalculatedClientLineItem[];
  subtotal: number;
  totalAdditiveTax: number;
  totalDeductionTax: number;
  grandTotal: number;
  netPayable: number;
  taxBreakdown: TaxBreakdownSummary[];
}

/**
 * Calculates live invoice totals and line item tax amounts in the client UI.
 */
export function calculateClientInvoiceTaxes(
  items: ClientLineItemInput[],
  availableTaxes: ActiveTax[]
): ClientInvoiceCalculation {
  const taxMap = new Map<string, ActiveTax>();
  availableTaxes.forEach((t) => taxMap.set(t.id, t));

  let subtotal = 0;
  let totalAdditiveTax = 0;
  let totalDeductionTax = 0;
  const breakdownMap = new Map<string, TaxBreakdownSummary>();

  const calculatedItems: CalculatedClientLineItem[] = items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const lineAmount = Math.round(qty * price * 100) / 100;
    subtotal += lineAmount;

    let snapshots: AppliedTaxSnapshot[] = [];

    if (item.taxIds && item.taxIds.length > 0) {
      const uniqueTaxIds = Array.from(new Set(item.taxIds));
      snapshots = uniqueTaxIds
        .map((taxId) => {
          const taxDef = taxMap.get(taxId);
          if (!taxDef || taxDef.isActive === false) return null;

          let taxAmount = 0;
          if (taxDef.valueType === "PERCENTAGE") {
            taxAmount = Math.round(((lineAmount * taxDef.rate) / 100) * 100) / 100;
          } else {
            taxAmount = Math.round(taxDef.rate * qty * 100) / 100;
          }

          return {
            taxId: taxDef.id,
            taxName: taxDef.name,
            taxCode: taxDef.code,
            taxRate: taxDef.rate,
            type: taxDef.valueType,
            calculationType: taxDef.calculationType,
            taxAmount,
          };
        })
        .filter((s): s is AppliedTaxSnapshot => s !== null);
    } else if (item.appliedTaxes && item.appliedTaxes.length > 0) {
      snapshots = item.appliedTaxes;
    }

    snapshots.forEach((snap) => {
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
      appliedTaxes: snapshots,
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
export function getSuggestedTaxes(
  availableTaxes: ActiveTax[],
  companyState: string = "Karnataka",
  clientState?: string | null
): ActiveTax[] {
  if (!availableTaxes || availableTaxes.length === 0) return [];

  const cleanComp = (companyState || "").trim().toLowerCase();
  const cleanClient = (clientState || "").trim().toLowerCase();

  const isIntraState = !cleanClient || cleanComp === cleanClient;

  if (isIntraState) {
    // Suggest CGST + SGST
    return availableTaxes.filter(
      (t) =>
        t.isActive &&
        (t.type === "CGST" || t.type === "SGST" || t.code.includes("CGST") || t.code.includes("SGST"))
    );
  } else {
    // Suggest IGST
    return availableTaxes.filter(
      (t) => t.isActive && (t.type === "IGST" || t.code.includes("IGST"))
    );
  }
}
