import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail?: string;
  recipientName?: string;
  documentTitle: string;
  onSend: (email: string, subject: string, message: string) => Promise<void>;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  recipientEmail = "",
  recipientName = "",
  documentTitle,
  onSend,
}) => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(recipientEmail);
      setSubject(`Document: ${documentTitle} from Ledgerly`);
      setMessage(
        `Dear ${recipientName || "Valued Customer"},\n\nPlease find attached your ${documentTitle}.\n\nThank you for doing business with us!\n\nBest regards,\nLedgerly Billing Team`
      );
    }
  }, [isOpen, recipientEmail, recipientName, documentTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Recipient email address is required");
      return;
    }

    setIsSending(true);
    try {
      await onSend(email, subject, message);
      onClose();
    } catch {
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1 text-left mb-4">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#F97316]" />
            <span>Email {documentTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Recipient Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs border-slate-200 dark:border-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending}
              className="rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center gap-1.5"
            >
              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send Email</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
