import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SystemSettings } from "../types/settings.types";
import {
  useUpdateEmailMutation,
  useResetSectionMutation,
  useTestEmailMutation,
} from "../hooks/useSettings";
import { Mail, RotateCcw, Save, ShieldAlert, Send, Loader2, CheckCircle2 } from "lucide-react";

const emailSchema = z.object({
  senderName: z.string().min(2, "Sender name required"),
  senderEmail: z.string().email("Invalid sender email format"),
  replyToEmail: z.string().email("Invalid reply-to email format").nullable().or(z.literal("")),
  emailSignature: z.string().nullable().optional(),
  defaultEmailFooter: z.string().nullable().optional(),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface EmailTabProps {
  settings: SystemSettings;
  canEdit: boolean;
}

export const EmailTab: React.FC<EmailTabProps> = ({ settings, canEdit }) => {
  const updateEmailMutation = useUpdateEmailMutation();
  const resetSectionMutation = useResetSectionMutation();
  const testEmailMutation = useTestEmailMutation();

  const [testEmailAddress, setTestEmailAddress] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      senderName: settings.senderName,
      senderEmail: settings.senderEmail,
      replyToEmail: settings.replyToEmail || "",
      emailSignature: settings.emailSignature || "",
      defaultEmailFooter: settings.defaultEmailFooter || "",
    },
  });

  useEffect(() => {
    reset({
      senderName: settings.senderName,
      senderEmail: settings.senderEmail,
      replyToEmail: settings.replyToEmail || "",
      emailSignature: settings.emailSignature || "",
      defaultEmailFooter: settings.defaultEmailFooter || "",
    });
    setTestEmailAddress(settings.senderEmail || "");
  }, [settings, reset]);

  const onSubmit = (data: EmailFormValues) => {
    updateEmailMutation.mutate(data);
  };

  const handleResetSection = () => {
    resetSectionMutation.mutate("email");
  };

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    testEmailMutation.mutate(testEmailAddress);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F97316]" />
              <span>Email Communication Preferences</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure outgoing billing emails, sender identity, reply-to addresses, and signatures.
            </p>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetSection}
                disabled={resetSectionMutation.isPending}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="submit"
                disabled={!isDirty || updateEmailMutation.isPending}
                className="px-4 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 disabled:opacity-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>

        {/* Security Info Banner */}
        <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Secure Delivery Infrastructure</span>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
              API/SMTP gateway credentials are fully encrypted on the server side and are never exposed over public APIs or client settings.
            </p>
          </div>
        </div>

        {/* Sender Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sender Display Name *
            </label>
            <input
              type="text"
              {...register("senderName")}
              disabled={!canEdit}
              placeholder="e.g. Ledgerly Billing Team"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            {errors.senderName && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.senderName.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sender Email Address *
            </label>
            <input
              type="email"
              {...register("senderEmail")}
              disabled={!canEdit}
              placeholder="billing@yourdomain.com"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            {errors.senderEmail && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.senderEmail.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reply-To Email Address
            </label>
            <input
              type="email"
              {...register("replyToEmail")}
              disabled={!canEdit}
              placeholder="support@yourdomain.com"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        {/* Signatures & Footers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Email Signature
            </label>
            <textarea
              rows={4}
              {...register("emailSignature")}
              disabled={!canEdit}
              placeholder="Best regards,\nAccounts Receivable Team"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Document / Email Footer
            </label>
            <textarea
              rows={4}
              {...register("defaultEmailFooter")}
              disabled={!canEdit}
              placeholder="Thank you for your business. For invoice inquiries, contact us directly."
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>
      </form>

      {/* SMTP Test Delivery Section */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Test SMTP Email Connection</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Send a test email to verify that your SMTP server (`smtp.martechadda.com:465`) is active and ready to deliver billing communications.
            </p>
          </div>

          <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="recipient@example.com"
              required
              disabled={testEmailMutation.isPending}
              className="w-full sm:w-80 text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <button
              type="submit"
              disabled={testEmailMutation.isPending}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {testEmailMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send Test Email</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
