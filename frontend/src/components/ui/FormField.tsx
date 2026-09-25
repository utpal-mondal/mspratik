import { ChangeEvent, ReactNode } from "react";
import clsx from "clsx";

interface Option {
  label: string;
  value: string | number;
}

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: "text" | "number" | "email" | "password" | "textarea" | "select";
  value: string | number;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;

  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;

  options?: Option[];

  className?: string;
  labelClassName?: string;
  inputClassName?: string;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  error?: string;
}
const baseInputStyle =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus-visible:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed";

const FormField = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  options = [],
  className = "",
  labelClassName = "",
  inputClassName = "",
  startAdornment,
  endAdornment,
  error,
}: FormFieldProps) => {
  return (
    <div className={clsx("space-y-2", className)}>
      <label
        htmlFor={id}
        className={clsx(
          "block text-sm font-medium text-slate-700",
          labelClassName,
        )}
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* Input with adornments */}
      {(type === "text" ||
        type === "number" ||
        type === "email" ||
        type === "password") && (
        <div className="flex overflow-hidden rounded-lg border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          {startAdornment && (
            <div className="flex items-center border-r bg-slate-50 px-3 text-slate-500">
              {startAdornment}
            </div>
          )}

          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={clsx(
              "flex-1 border-0 bg-white px-3 py-2.5 text-sm focus:ring-0 focus-visible:outline-none",
              inputClassName,
            )}
          />

          {endAdornment && (
            <div className="flex items-center border-l bg-slate-50 px-3 text-slate-500">
              {endAdornment}
            </div>
          )}
        </div>
      )}

      {/* Textarea */}
      {type === "textarea" && (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={clsx(baseInputStyle, inputClassName)}
        />
      )}

      {/* Select */}
      {type === "select" && (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={clsx(baseInputStyle, inputClassName)}
        >
          <option value="">Select {label}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
