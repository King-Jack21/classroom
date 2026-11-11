import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card-surface ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-b border-slate-100 px-4 py-3.5 sm:px-5 ${className}`} {...props} />;
}

export function CardTitle({ className = "", children }: { className?: string; children: ReactNode }) {
  return <h2 className={`text-base font-semibold text-slate-900 ${className}`}>{children}</h2>;
}

export function CardDescription({ className = "", children }: { className?: string; children: ReactNode }) {
  return <p className={`mt-1 text-sm text-slate-500 ${className}`}>{children}</p>;
}

export function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-4 py-4 sm:px-5 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-t border-slate-100 px-4 py-3.5 sm:px-5 ${className}`} {...props} />
  );
}
