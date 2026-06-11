"use client";

import type { ReactNode, InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  inputClassName?: string;
}

export default function FormField({
  label,
  error,
  hint,
  icon,
  rightElement,
  className = "",
  inputClassName = "",
  ...inputProps
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}
      </label>

      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orbit-blue transition-colors">
            {icon}
          </div>
        )}

        <input
          {...inputProps}
          className={`w-full bg-orbit-darker border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all duration-200 outline-none
            ${icon ? "pl-11" : ""}
            ${rightElement ? "pr-14" : ""}
            ${
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-zinc-700/50 focus:border-orbit-blue focus:ring-2 focus:ring-orbit-blue/20 hover:border-zinc-600"
            }
            ${inputClassName}
          `}
        />

        {rightElement && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-red-400 font-medium animate-fade-in">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-zinc-500">{hint}</p>
      )}
    </div>
  );
}
