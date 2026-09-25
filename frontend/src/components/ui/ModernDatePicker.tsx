import { useRef } from "react";
import { Calendar } from "lucide-react";

type ModernDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
};

export default function ModernDatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  className = "",
}: ModernDatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className="relative cursor-pointer"
        onClick={() => inputRef.current?.showPicker?.()}
      >
        <Calendar
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:shadow-md transition-all"
        />
      </div>
    </div>
  );
}
