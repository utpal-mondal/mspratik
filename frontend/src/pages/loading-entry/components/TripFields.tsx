import type { ReactNode } from "react";
import type { TripLookup } from "../types";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "number" | "date";
  placeholder?: string;
  readOnly?: boolean;
  options?: TripLookup[];
  error?: string;
}

const inputClass =
  "h-9 w-full rounded border border-[#C5CFDB] bg-white px-3 text-[13px] text-[#17222E] outline-none focus:border-[#0F2A47] focus:ring-2 focus:ring-[#0F2A47]/10 disabled:bg-[#F1F4F8] disabled:text-[#64748B]";

export const TripField = ({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
  readOnly = false,
  options,
  error,
}: FieldProps) => (
  <div className="min-w-0">
    <label className="mb-1 block text-[13px] font-semibold text-[#3B4957]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {options ? (
      <select
        value={value}
        required={required}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "any" : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} ${readOnly ? "bg-[#F1F4F8]" : ""}`}
      />
    )}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </div>
);

export const TripSelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
}) => (
  <div className="min-w-0">
    <label className="mb-1 block text-[13px] font-semibold text-[#3B4957]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </div>
);

export const TripSection = ({
  title,
  children,
  columns = 4,
}: {
  title: string;
  children: ReactNode;
  columns?: 4 | 5;
}) => (
  <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
    <h2 className="border-b border-[#D5DDE6] bg-[#F8FAFC] px-5 py-3 text-sm font-semibold text-[#0F2A47]">
      {title}
    </h2>
    <div className={`grid gap-4 p-5 sm:grid-cols-2 ${columns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
      {children}
    </div>
  </section>
);
