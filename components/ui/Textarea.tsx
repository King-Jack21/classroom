import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = "", rows = 3, ...props }, ref) {
    return (
      <textarea ref={ref} rows={rows} className={`input-base resize-y ${className}`} {...props} />
    );
  },
);
