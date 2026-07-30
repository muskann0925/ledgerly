import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF5400]/20 focus:border-[#FF5400] transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#111827_inset] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:white]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
