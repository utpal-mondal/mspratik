import type { ReactNode } from "react";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import CustomDatePicker from "@/components/ui/DatePicker";
import type { TripLookup } from "../types";

interface FieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  type?: "text" | "number" | "date";
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  options?: TripLookup[];
  error?: string;
}

type DropdownOption = {
  value: string;
  label: string;
};

const inputClass =
  "h-9 w-full rounded border border-[#C5CFDB] bg-white px-3 text-[13px] text-[#17222E] outline-none focus:border-[#0F2A47] focus:ring-2 focus:ring-[#0F2A47]/10 disabled:cursor-not-allowed disabled:bg-[#F1F4F8] disabled:text-[#64748B]";

const dropdownButtonClass =
  "!h-9 !rounded !border-[#C5CFDB] !px-3 !text-[13px] !text-[#17222E]";

const toDropdownOptions = (options: TripLookup[]): DropdownOption[] =>
  options.map((option) => ({ value: String(option.id), label: option.name }));

const toStringOptions = (options: string[]): DropdownOption[] =>
  options.map((option) => ({ value: option, label: option }));

export const TripField = ({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
  readOnly = false,
  disabled = false,
  options,
  error,
}: FieldProps) => {
  const dropdownOptions = options ? toDropdownOptions(options) : null;
  const selectedOption =
    dropdownOptions?.find((option) => option.value === value) ?? null;

  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[13px] font-semibold text-[#3B4957]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {dropdownOptions ? (
        <SearchableDropdown<DropdownOption>
          options={dropdownOptions}
          value={selectedOption}
          onChange={(option) => onChange?.(option?.value ?? "")}
          placeholder={placeholder || `Select ${label.toLowerCase()}`}
          searchPlaceholder={`Search ${label.toLowerCase()}...`}
          labelKey="value"
          displayKey="label"
          disabled={disabled || readOnly}
          buttonClassName={dropdownButtonClass}
        />
      ) : (
        <input
          type={type}
          value={value}
          required={required}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "any" : undefined}
          placeholder={
            placeholder ??
            (type === "date" || readOnly
              ? undefined
              : label.startsWith("Enter")
                ? label
                : `Enter ${label}`)
          }
          readOnly={readOnly}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          className={`${inputClass} ${readOnly || disabled ? "bg-[#F1F4F8]" : ""}`}
        />
      )}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
};

const parseDateValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const TripDateField = ({
  label,
  value,
  onChange,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}) => (
  <div className="min-w-0">
    <label className="mb-1 block text-[13px] font-semibold text-[#3B4957]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <CustomDatePicker
      value={parseDateValue(value)}
      onChange={(date) => onChange(date ? formatDateValue(date) : "")}
      placeholder="DD/MM/YYYY"
      className="!h-9 !rounded !border-[#C5CFDB] !px-3 !text-[13px] !text-[#17222E]"
    />
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
}) => {
  const dropdownOptions = toStringOptions(options);
  const selectedOption =
    dropdownOptions.find((option) => option.value === value) ?? null;

  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[13px] font-semibold text-[#3B4957]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <SearchableDropdown<DropdownOption>
        options={dropdownOptions}
        value={selectedOption}
        onChange={(option) => onChange(option?.value ?? "")}
        placeholder={`Select ${label.toLowerCase()}`}
        searchPlaceholder={`Search ${label.toLowerCase()}...`}
        labelKey="value"
        displayKey="label"
        buttonClassName={dropdownButtonClass}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
};

export const TripSection = ({
  title,
  children,
  columns = 4,
}: {
  title: string;
  children: ReactNode;
  columns?: 4 | 5;
}) => (
  <section className="rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
    <h2 className="rounded-t-md border-b border-[#D5DDE6] bg-[#F8FAFC] px-5 py-3 text-sm font-semibold text-[#0F2A47]">
      {title}
    </h2>
    <div
      className={`grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 ${
        columns === 5 ? "lg:grid-cols-4 xl:grid-cols-5" : "lg:grid-cols-4"
      }`}
    >
      {children}
    </div>
  </section>
);
