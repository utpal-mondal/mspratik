"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimeRangePickerProps {
  startTime?: string;
  endTime?: string;
  onChange?: (value: {
    startTime: string;
    endTime: string;
  }) => void;
}

export default function TimeRangePicker({
  startTime = "00:00",
  endTime = "23:59",
  onChange,
}: TimeRangePickerProps) {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  const [openPicker, setOpenPicker] = useState<"start" | "end" | null>(null);

  // Keep internal state in sync when parent props change.
  useEffect(() => {
    setStart(startTime);
  }, [startTime]);

  useEffect(() => {
    setEnd(endTime);
  }, [endTime]);

  const normalizeTime = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    let hh = parseInt(digits.slice(0, 2), 10) || 0;
    let mm = parseInt(digits.slice(2, 4), 10) || 0;

    if (hh > 23) hh = 23;
    if (mm > 59) mm = 59;

    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const updateTime = (
    type: "start" | "end",
    hour: number,
    minute: number
  ) => {
    const value = `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}`;

    if (type === "start") {
      setStart(value);
      onChange?.({
        startTime: value,
        endTime: end,
      });
    } else {
      setEnd(value);
      onChange?.({
        startTime: start,
        endTime: value,
      });
    }
  };

  const getTimeParts = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);

    return {
      hour: hour || 0,
      minute: minute || 0,
    };
  };

  return (
    <div className="relative w-full">
      <label className="mb-1 block text-[13px] font-medium text-slate-700">
        Time Range
      </label>

      <div className="relative flex h-9 w-full overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-[#30227d]">
        {/* Start Time */}
        <div className="relative w-1/2">
          <input
            type="text"
            value={start}
            onClick={() =>
              setOpenPicker(openPicker === "start" ? null : "start")
            }
            onChange={(e) => {
              setStart(e.target.value);
            }}
            onBlur={(e) => {
              const normalized = normalizeTime(e.target.value);
              setStart(normalized);
              onChange?.({
                startTime: normalized,
                endTime: end,
              });
            }}
            placeholder="00:00"
            className={`h-full w-full cursor-pointer border bg-white px-3 text-[14px] text-slate-700 outline-none placeholder:text-slate-400 ${
              openPicker === "start"
                ? "border-[#30227d]"
                : "border-transparent"
            }`}
          />

          {openPicker === "start" && (
            <TimeDropdown
              type="start"
              value={start}
              onChange={updateTime}
            />
          )}
        </div>

        {/* End Time */}
        <div className="relative w-1/2">
          <input
            type="text"
            value={end}
            onClick={() =>
              setOpenPicker(openPicker === "end" ? null : "end")
            }
            onChange={(e) => {
              setEnd(e.target.value);
            }}
            onBlur={(e) => {
              const normalized = normalizeTime(e.target.value);
              setEnd(normalized);
              onChange?.({
                startTime: start,
                endTime: normalized,
              });
            }}
            placeholder="23:59"
            className={`h-full w-full cursor-pointer border bg-white px-3 text-[14px] text-slate-700 outline-none placeholder:text-slate-400 ${
              openPicker === "end" ? "border-[#30227d]" : "border-transparent"
            }`}
          />

          {openPicker === "end" && (
            <TimeDropdown
              type="end"
              value={end}
              onChange={updateTime}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TimeDropdownProps {
  type: "start" | "end";
  value: string;
  onChange: (
    type: "start" | "end",
    hour: number,
    minute: number
  ) => void;
}

function TimeDropdown({
  type,
  value,
  onChange,
}: TimeDropdownProps) {
  const { hour, minute } = (() => {
    const [h, m] = value.split(":").map(Number);

    return {
      hour: h || 0,
      minute: m || 0,
    };
  })();

  const changeHour = (direction: number) => {
    let newHour = hour + direction;

    if (newHour > 23) newHour = 0;
    if (newHour < 0) newHour = 23;

    onChange(type, newHour, minute);
  };

  const changeMinute = (direction: number) => {
    let newMinute = minute + direction;

    if (newMinute > 59) newMinute = 0;
    if (newMinute < 0) newMinute = 59;

    onChange(type, hour, newMinute);
  };

  return (
    <div className="absolute left-0 top-[42px] z-50 w-[180px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-md">
      <div className="relative flex h-[130px] items-center justify-center">
        {/* Hour column */}
        <div className="flex w-[60px] flex-col items-center">
          <button
            type="button"
            onClick={() => changeHour(1)}
            className="py-1 text-[#3890c9] hover:text-blue-700"
          >
            <ChevronUp size={18} strokeWidth={2.5} />
          </button>

          <div className="text-[15px] font-medium text-slate-700">
            {String(hour).padStart(2, "0")}
          </div>

          <button
            type="button"
            onClick={() => changeHour(-1)}
            className="py-1 text-[#3890c9] hover:text-blue-700"
          >
            <ChevronDown size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Colon */}
        <div className="pb-0.5 text-[14px] text-slate-500">:</div>

        {/* Minute column */}
        <div className="flex w-[60px] flex-col items-center">
          <button
            type="button"
            onClick={() => changeMinute(1)}
            className="py-1 text-[#3890c9] hover:text-blue-700"
          >
            <ChevronUp size={18} strokeWidth={2.5} />
          </button>

          <div className="text-[15px] font-medium text-slate-700">
            {String(minute).padStart(2, "0")}
          </div>

          <button
            type="button"
            onClick={() => changeMinute(-1)}
            className="py-1 text-[#3890c9] hover:text-blue-700"
          >
            <ChevronDown size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
