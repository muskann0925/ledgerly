import React from "react";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "../theme-provider";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster: React.FC<ToasterProps> = ({ ...props }) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        style: {
          borderRadius: "1rem",
          padding: "0.875rem 1rem",
          fontSize: "0.8125rem",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-[#111827] group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-200 dark:group-[.toaster]:border-slate-800 group-[.toaster]:shadow-xl font-sans",
          description:
            "group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400 text-xs mt-0.5",
          actionButton:
            "group-[.toast]:bg-[#F97316] group-[.toast]:text-white font-semibold rounded-xl text-xs px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-slate-100 dark:group-[.toast]:bg-slate-800 group-[.toast]:text-slate-600 dark:group-[.toast]:text-slate-300 rounded-xl text-xs px-3 py-1.5",
          success:
            "group-[.toaster]:border-emerald-200 dark:group-[.toaster]:border-emerald-900/40 group-[.toast]:text-slate-900 dark:group-[.toast]:text-slate-100",
          error:
            "group-[.toaster]:border-red-200 dark:group-[.toaster]:border-red-900/40 group-[.toast]:text-slate-900 dark:group-[.toast]:text-slate-100",
          info:
            "group-[.toaster]:border-orange-200 dark:group-[.toaster]:border-orange-900/40 group-[.toast]:text-slate-900 dark:group-[.toast]:text-slate-100",
          warning:
            "group-[.toaster]:border-amber-200 dark:group-[.toaster]:border-amber-900/40 group-[.toast]:text-slate-900 dark:group-[.toast]:text-slate-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
