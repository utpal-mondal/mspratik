"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
  id?: string;
  ariaLabel?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomDatePicker({
  id,
  ariaLabel,
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className,
}: CustomDatePickerProps) {
  return (
    <DatePicker
      id={id}
      ariaLabel={ariaLabel}
      selected={value}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      showIcon
      calendarIconClassName="right-2 top-1/2 -translate-y-1/2 text-[#6B7690]"
      wrapperClassName="w-full"
      className={`border rounded-lg px-4 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-blue-500 !pl-2.5 !pr-10 ${className ?? ""}`}
    />
  );
}
