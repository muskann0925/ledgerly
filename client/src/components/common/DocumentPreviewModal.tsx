import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Download, Printer, Mail, Loader2 } from "lucide-react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfBlob: Blob | null;
  isLoading?: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfBlob,
  isLoading = false,
  onDownload,
  onPrint,
  onEmail,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfBlob]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-0 flex flex-col overflow-hidden rounded-2xl shadow-2xl">
        {/* Top Action Bar */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{title}</span>
          </DialogTitle>

          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDownload}
                disabled={isLoading || !pdfUrl}
                className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download PDF
              </Button>
            )}

            {onPrint && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPrint}
                disabled={isLoading || !pdfUrl}
                className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print
              </Button>
            )}

            {onEmail && (
              <Button
                size="sm"
                onClick={onEmail}
                disabled={isLoading}
                className="rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white mr-8"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Email Document
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 relative flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
              <span className="text-xs font-semibold">Generating Document PDF...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white"
              title={title}
            />
          ) : (
            <div className="text-xs text-slate-400 font-medium">No PDF document payload available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
