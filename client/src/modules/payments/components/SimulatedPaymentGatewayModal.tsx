import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  User,
  Sparkles,
  QrCode,
  ArrowRight,
  Check,
} from "lucide-react";
import type { PaymentMethod, PaymentStatus } from "../types/payment.types";

export interface GatewayInvoiceTarget {
  id: string;
  number: string;
  clientName: string;
  amount: number;
  currency?: string;
}

interface SimulatedPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: GatewayInvoiceTarget | null;
  onSubmitPayment: (params: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    referenceNumber: string;
    notes?: string;
    failureReason?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const SimulatedPaymentGatewayModal: React.FC<
  SimulatedPaymentGatewayModalProps
> = ({ isOpen, onClose, invoice, onSubmitPayment, isLoading = false }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI");
  const [upiId, setUpiId] = useState("sandbox@okicici");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("889");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [transactionRef, setTransactionRef] = useState("");
  const [step, setStep] = useState<"SELECT" | "PROCESSING" | "DEV_SIMULATION">(
    "SELECT"
  );
  const [timerSeconds, setTimerSeconds] = useState(720);

  useEffect(() => {
    if (isOpen) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      setTransactionRef(`TXN-${dateStr}-${randomHex}`);
      setStep("SELECT");
      setSelectedMethod("UPI");
      setUpiId("sandbox@okicici");
      setTimerSeconds(720);
      if (invoice?.clientName) {
        setCardName(invoice.clientName);
      }
    }
  }, [isOpen, invoice]);

  useEffect(() => {
    if (!isOpen || step !== "SELECT") return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step]);

  if (!invoice) return null;

  const currency = invoice.currency || "INR";
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(invoice.amount);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleProceedClick = () => {
    setStep("PROCESSING");
    setTimeout(() => {
      setStep("DEV_SIMULATION");
    }, 2500);
  };

  const handleOutcomeSelect = async (status: PaymentStatus) => {
    let failureReason: string | undefined = undefined;
    if (status === "FAILED") {
      failureReason = "Transaction declined by card network / bank";
    }
    await onSubmitPayment({
      invoiceId: invoice.id,
      amount: invoice.amount,
      paymentMethod: selectedMethod,
      status,
      referenceNumber: transactionRef,
      notes: `Razorpay Checkout Ref #${transactionRef}`,
      failureReason,
    });
    onClose();
  };

  const methodsList: {
    id: PaymentMethod;
    label: string;
    badge?: string;
    icons: React.ReactNode;
  }[] = [
    {
      id: "UPI",
      label: "UPI / QR",
      badge: "Instant",
      icons: (
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="w-2 h-2 rounded-full bg-[#F97316]" />
        </div>
      ),
    },
    {
      id: "CREDIT_CARD",
      label: "Cards",
      badge: "Credit/Debit",
      icons: (
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
          <span>VISA</span>
          <span>MC</span>
        </div>
      ),
    },
    {
      id: "BANK_TRANSFER",
      label: "Netbanking",
      icons: (
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
          <span>HDFC</span>
          <span>SBI</span>
        </div>
      ),
    },
    {
      id: "CHEQUE",
      label: "Bank Transfer",
      icons: <Building className="w-3.5 h-3.5 text-slate-400" />,
    },
    {
      id: "CASH",
      label: "Cash Settlement",
      icons: <QrCode className="w-3.5 h-3.5 text-slate-400" />,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent hideCloseButton={false} className="max-w-4xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-[#090D16] border-slate-200 dark:border-slate-800 shadow-2xl transition-all select-none border-0">
        <div className="flex flex-col md:flex-row min-h-[520px]">
          {/* LEFT SIDEBAR: Current Theme Dark/Orange Branding */}
          <div className="w-full md:w-[310px] bg-slate-900 dark:bg-[#111827] text-white p-6 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-slate-800">
            {/* Background Accent Blur */}
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#F97316]/10 blur-xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Brand Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center font-black text-white text-sm shadow-md shadow-orange-500/20">
                    L
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight text-white">
                      Ledgerly Billing
                    </h2>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Razorpay Trusted Business</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-800/80 dark:bg-slate-950/70 border border-slate-700/60 space-y-1.5 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Price Summary
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  {formattedAmount}
                </div>
                <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-between border-t border-slate-700/60">
                  <span>Invoice #{invoice.number}</span>
                  <span className="font-mono text-[10px] font-semibold text-slate-300">{transactionRef.slice(-6)}</span>
                </div>
              </div>

              {/* Payer Chip */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <User className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                  <span className="truncate font-medium">{invoice.clientName}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">Client</span>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-6 relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span className="flex items-center gap-1 font-semibold">
                Secured by <span className="font-extrabold text-white">Razorpay</span>
              </span>
              <span className="text-[10px] font-mono">256-Bit SSL</span>
            </div>
          </div>

          {/* RIGHT MAIN CONTAINER: Payment Options & Interactive View */}
          <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#090D16] min-w-0">
            {/* Modal Top Header Bar */}
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#090D16]">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Payment Options</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Select method below</span>
              </h3>
            </div>

            {/* Content Switcher */}
            {step === "SELECT" && (
              <div className="flex-1 flex flex-col md:flex-row min-w-0">
                {/* Middle Options Sidebar */}
                <div className="w-full md:w-48 bg-slate-50/50 dark:bg-[#0D1322] border-r border-slate-200 dark:border-slate-800 p-2 space-y-1 shrink-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                    Methods
                  </span>

                  {methodsList.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#F97316]/10 dark:bg-[#F97316]/20 border-l-4 border-[#F97316] text-[#F97316] dark:text-[#F97316] font-extrabold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span>{method.label}</span>
                        {method.icons}
                      </button>
                    );
                  })}
                </div>

                {/* Right Interactive Payment View */}
                <div className="flex-1 p-5 sm:p-6 space-y-5 bg-white dark:bg-[#090D16] flex flex-col justify-between min-w-0 overflow-hidden">
                  {/* VIEW 1: UPI / QR Code View */}
                  {selectedMethod === "UPI" && (
                    <div className="space-y-4 w-full overflow-hidden">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-emerald-500" />
                          <span>UPI QR Code</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {formatTimer(timerSeconds)}
                        </span>
                      </div>

                      {/* Responsive Non-Clipping QR Box & Badges */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-full overflow-hidden">
                        {/* Authentic SVG QR Code Graphic */}
                        <div className="w-28 h-28 p-2 rounded-xl bg-white shadow-xs border border-slate-200 flex flex-col items-center justify-center shrink-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                            {/* Position Detection Patterns */}
                            <path d="M 5,5 H 35 V 35 H 5 Z M 10,10 V 30 H 30 V 10 Z M 15,15 H 25 V 25 H 15 Z" />
                            <path d="M 65,5 H 95 V 35 H 65 Z M 70,10 V 30 H 90 V 10 Z M 75,15 H 85 V 25 H 75 Z" />
                            <path d="M 5,65 H 35 V 95 H 5 Z M 10,70 V 90 H 30 V 70 Z M 15,75 H 25 V 85 H 15 Z" />
                            {/* Matrix Data Simulation */}
                            <rect x="42" y="10" width="6" height="6" />
                            <rect x="52" y="10" width="6" height="6" />
                            <rect x="42" y="22" width="6" height="6" />
                            <rect x="52" y="28" width="6" height="6" />
                            <rect x="10" y="42" width="6" height="6" />
                            <rect x="22" y="42" width="6" height="6" />
                            <rect x="28" y="52" width="6" height="6" />
                            <rect x="42" y="42" width="16" height="16" />
                            <rect x="65" y="42" width="6" height="6" />
                            <rect x="78" y="42" width="6" height="6" />
                            <rect x="85" y="52" width="6" height="6" />
                            <rect x="42" y="65" width="6" height="6" />
                            <rect x="52" y="78" width="6" height="6" />
                            <rect x="65" y="65" width="12" height="12" />
                            <rect x="82" y="65" width="12" height="12" />
                            <rect x="65" y="82" width="12" height="12" />
                            <rect x="82" y="82" width="12" height="12" />
                          </svg>
                          <span className="text-[8px] font-black text-[#F97316] uppercase tracking-widest mt-1">
                            LEDGERLY
                          </span>
                        </div>

                        {/* Supported Apps Badges */}
                        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            SCAN WITH ANY APP
                          </span>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-500/20">
                              GPay
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] border border-purple-500/20">
                              PhonePe
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] border border-blue-500/20">
                              Paytm
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] border border-amber-500/20">
                              BHIM
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400 leading-tight">
                            Scan code to pay exact invoice amount of <span className="font-bold text-slate-700 dark:text-slate-200">{formattedAmount}</span>.
                          </p>
                        </div>
                      </div>

                      {/* UPI ID Input */}
                      <div className="space-y-1 pt-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          UPI ID / VPA
                        </label>
                        <Input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. username@upi"
                          className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: Cards View */}
                  {selectedMethod === "CREDIT_CARD" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#F97316]" />
                          <span>Card Details</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">VISA / MasterCard / RuPay</span>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Card Number
                          </label>
                          <Input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="h-10 text-xs rounded-xl font-mono text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              Expiry Date
                            </label>
                            <Input
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="h-10 text-xs rounded-xl font-mono text-center text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              CVV Code
                            </label>
                            <Input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="•••"
                              className="h-10 text-xs rounded-xl font-mono text-center text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Name on Card
                          </label>
                          <Input
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Cardholder Name"
                            className="h-10 text-xs rounded-xl text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIEW 3: Netbanking View (High-contrast dark/light mode buttons) */}
                  {selectedMethod === "BANK_TRANSFER" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-[#F97316]" />
                          <span>Select Netbanking Bank</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Bank", "Punjab National Bank"].map((bank) => {
                          const isSel = selectedBank === bank;
                          return (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => setSelectedBank(bank)}
                              className={`p-3 rounded-xl border text-center transition-all text-xs font-bold flex items-center justify-center gap-1.5 ${
                                isSel
                                  ? "bg-[#F97316]/10 dark:bg-[#F97316]/20 border-[#F97316] text-[#F97316] dark:text-[#F97316] ring-1 ring-[#F97316] shadow-xs"
                                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <span>{bank}</span>
                              {isSel && <Check className="w-3.5 h-3.5 text-[#F97316]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* VIEW 4: Bank Transfer / Cash View */}
                  {(selectedMethod === "CHEQUE" || selectedMethod === "CASH") && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-[#F97316]" />
                          <span>Virtual Bank Transfer / Cash</span>
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Virtual Account:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">LDGR9988776655</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">IFSC Code:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">LDGR0000001</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Bank Name:</span>
                          <span className="font-bold text-slate-900 dark:text-white">Ledgerly Virtual Bank</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* High-Contrast Action Button */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      onClick={handleProceedClick}
                      className="w-full h-11 bg-[#F97316] hover:bg-orange-600 dark:bg-[#F97316] dark:hover:bg-orange-600 text-white rounded-xl font-extrabold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Pay {formattedAmount}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Processing Payment Delay */}
            {step === "PROCESSING" && (
              <div className="py-20 text-center space-y-4 select-none flex-1 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-center text-[#F97316]">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Contacting Bank Gateway...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Authenticating credentials with bank security node.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: Developer Simulation Actions */}
            {step === "DEV_SIMULATION" && (
              <div className="p-8 space-y-5 select-none flex-1 flex flex-col justify-center bg-white dark:bg-[#090D16]">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Developer Gateway Sandbox Simulation</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select mock gateway outcome to complete transaction response:
                  </p>
                </div>

                <div className="space-y-3 max-w-md mx-auto w-full">
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleOutcomeSelect("SUCCESS")}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold justify-between px-5 shadow-md shadow-emerald-500/20"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Payment Successful (Authorized)
                    </span>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </Button>

                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleOutcomeSelect("FAILED")}
                    variant="outline"
                    className="w-full h-12 border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold justify-between px-5"
                  >
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Payment Failed (Card Declined)
                    </span>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </Button>

                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleOutcomeSelect("PENDING")}
                    variant="outline"
                    className="w-full h-12 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 rounded-xl text-xs font-bold justify-between px-5"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Payment Pending (Bank Webhook Delay)
                    </span>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
