import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all duration-200 ease-premium focus:border-gold-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(212,169,79,0.14)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all duration-200 ease-premium focus:border-gold-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(212,169,79,0.14)]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
