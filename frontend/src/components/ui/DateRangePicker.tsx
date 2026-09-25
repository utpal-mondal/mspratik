'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  addMonths,
  endOfMonth,
  formatRange,
  isAfterDay,
  isBeforeDay,
  isBetweenDay,
  isSameDay,
  isSameMonth,
  monthMatrix,
  monthNames,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
  weekdayLabels,
} from '@/utils/dateRangeUtils';

type DraftRange = {
  startDate: Date;
  endDate: Date | null;
};

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type DateRangePreset = {
  label: string;
  range: () => DateRange;
};

export type DateRangePickerProps = {
  /** Controlled value. Omit for uncontrolled use. */
  value?: DateRange | null;
  /** Initial value when uncontrolled. Defaults to the last 30 days. */
  defaultValue?: DateRange;
  onChange?: (range: DateRange | null) => void;
  /** Pass `false` to hide the shortcut list, or your own list to replace it. */
  presets?: DateRangePreset[] | false;
  minDate?: Date;
  maxDate?: Date;
  /** Token pattern: YYYY MMMM MMM MM M DD D. */
  format?: string;
  /** Pick one day instead of a range. */
  singleDate?: boolean;
  /** Commit the moment a range is complete, hiding Apply / Cancel. */
  autoApply?: boolean;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  align?: 'left' | 'right';
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Trigger button height in pixels. Defaults to 40. */
  height?: number;
  id?: string;
  name?: string;
};

/* Recomputed on every open so "Today" is always actually today. */
export const defaultPresets: DateRangePreset[] = [
  {
    label: 'Today',
    range: () => ({ startDate: new Date(), endDate: new Date() }),
  },
  {
    label: 'Yesterday',
    range: () => ({
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 1),
    }),
  },
  {
    label: 'Last 7 days',
    range: () => ({ startDate: subDays(new Date(), 6), endDate: new Date() }),
  },
  {
    label: 'Last 30 days',
    range: () => ({ startDate: subDays(new Date(), 29), endDate: new Date() }),
  },
  {
    label: 'This month',
    range: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Last month',
    range: () => {
      const prev = subMonths(new Date(), 1);
      return { startDate: startOfMonth(prev), endDate: endOfMonth(prev) };
    },
  },
  {
    label: 'This Year',
    range: () => {
      const year = new Date().getFullYear();
      return {
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31, 23, 59, 59),
      };
    },
  },
  {
    label: 'Custom Range',
    range: () => ({ startDate: new Date(), endDate: new Date() }),
  },
];

export default function DateRangePicker({
  value,
  defaultValue,
  onChange,
  presets = defaultPresets,
  minDate,
  maxDate,
  format = 'MMMM D, YYYY',
  singleDate = false,
  autoApply = false,
  weekStartsOn = 0,
  align = 'left',
  disabled = false,
  placeholder = 'Select dates',
  className = '',
  height = 40,
  id,
  name,
}: DateRangePickerProps) {
  const fallbackId = useId();
  const panelId = `${id ?? fallbackId}-panel`;

  const [uncontrolled, setUncontrolled] = useState<DateRange | null>(
    () =>
      defaultValue ?? {
        startDate: subDays(new Date(), 29),
        endDate: new Date(),
      },
  );
  const selected = value !== undefined ? value : uncontrolled;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftRange>(
    () => selected ?? { startDate: subDays(new Date(), 29), endDate: new Date() },
  );
  const [hovered, setHovered] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    startOfMonth((selected ?? { startDate: subDays(new Date(), 29), endDate: new Date() }).startDate),
  );
  const [isCustomRange, setIsCustomRange] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const commit = useCallback(
    (range: DateRange | null) => {
      if (value === undefined) setUncontrolled(range);
      onChange?.(range);
    },
    [onChange, value],
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    commit(null);
    closePanel(false);
  };

  const openPanel = () => {
    if (disabled) return;
    const fallback = selected ?? { startDate: subDays(new Date(), 29), endDate: new Date() };
    setDraft(fallback);
    setHovered(null);
    setViewMonth(startOfMonth(fallback.startDate));
    /* Reopen in custom mode when the selected range doesn't match a preset. */
    const matchesPreset = Array.isArray(presets) && presets.some((preset) => {
      if (preset.label === 'Custom Range') return false;
      const range = preset.range();
      return (
        !!selected &&
        isSameDay(range.startDate, selected.startDate) &&
        isSameDay(range.endDate, selected.endDate)
      );
    });
    setIsCustomRange(!!selected && !matchesPreset);
    setOpen(true);
  };

  const closePanel = useCallback(
    (returnFocus = true) => {
      setOpen(false);
      setHovered(null);
      if (returnFocus) triggerRef.current?.focus();
    },
    [],
  );

  /* Close on outside click and on Escape. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closePanel(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closePanel]);

  const isDisabledDay = useCallback(
    (day: Date) =>
      (minDate ? isBeforeDay(day, minDate) : false) ||
      (maxDate ? isAfterDay(day, maxDate) : false),
    [minDate, maxDate],
  );

  const selectDay = (day: Date) => {
    if (isDisabledDay(day)) return;

    if (singleDate) {
      const next = { startDate: startOfDay(day), endDate: startOfDay(day) };
      setDraft(next);
      commit(next);
      closePanel();
      return;
    }

    const rangeIsComplete = draft.endDate !== null;

    if (rangeIsComplete) {
      setDraft({ startDate: startOfDay(day), endDate: null });
      return;
    }

    /* Allow picking the earlier date second — swap so the range stays ordered. */
    const next = isBeforeDay(day, draft.startDate)
      ? { startDate: startOfDay(day), endDate: draft.startDate }
      : { startDate: draft.startDate, endDate: startOfDay(day) };
    setDraft(next);
    if (autoApply) {
      commit(next);
      closePanel();
    }
  };

  const applyPreset = (preset: DateRangePreset) => {
    if (preset.label === 'Custom Range') {
      setIsCustomRange(true);
      setDraft({ startDate: startOfDay(new Date()), endDate: null });
      setViewMonth(startOfMonth(new Date()));
      return;
    }

    const range = preset.range();
    setDraft(range);
    setViewMonth(startOfMonth(range.startDate));
    setIsCustomRange(false);
    commit(range);
    closePanel();
  };

  const apply = () => {
    const range = {
      startDate: draft.startDate,
      endDate: draft.endDate ?? draft.startDate,
    };
    commit(range);
    setIsCustomRange(false);
    closePanel();
  };

  const activePresetLabel = useMemo(() => {
    if (!presets || isCustomRange || !selected) return null;
    const match = presets.find((preset) => {
      if (preset.label === 'Custom Range') return false;
      const range = preset.range();
      return (
        isSameDay(range.startDate, selected.startDate) &&
        isSameDay(range.endDate, selected.endDate)
      );
    });
    return match?.label ?? null;
  }, [presets, selected, isCustomRange]);

  const label = selected
    ? singleDate
      ? formatRange({ ...selected, endDate: selected.startDate }, format)
      : formatRange(selected, format)
    : placeholder;

  /* Preview the range while the user is mid-selection, in either direction. */
  const previewStart =
    hovered && draft.endDate === null && isBeforeDay(hovered, draft.startDate)
      ? hovered
      : draft.startDate;
  const previewEnd =
    draft.endDate ??
    (hovered
      ? isBeforeDay(hovered, draft.startDate)
        ? draft.startDate
        : hovered
      : null);

  const months = singleDate ? [viewMonth] : [viewMonth, addMonths(viewMonth, 1)];

  return (
    <div ref={rootRef} className={`relative inline-block w-full ${className}`}>
      {name && selected && (
        <>
          <input
            type="hidden"
            name={`${name}_start`}
            value={selected.startDate.toISOString().slice(0, 10)}
          />
          <input
            type="hidden"
            name={`${name}_end`}
            value={selected.endDate.toISOString().slice(0, 10)}
          />
        </>
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? closePanel() : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-xs text-slate-900 shadow-sm transition hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        style={{ height }}
      >
        <CalendarIcon className="shrink-0 h-3 w-3 text-slate-500" />
        <span className={`flex-1 truncate text-[13px] ${!selected ? 'text-slate-400' : ''}`}>{label}</span>
        {activePresetLabel && (
          <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 sm:inline">
            {activePresetLabel}
          </span>
        )}
        {selected && (
          <svg
            onClick={handleClear}
            className="shrink-0 h-3.5 w-3.5 cursor-pointer text-slate-400 transition hover:text-slate-600"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        )}
        <CaretIcon
          className={`shrink-0 h-2.5 w-2.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''
            }`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose a date range"
          className={`absolute z-50 mt-2 flex w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-max sm:flex-row ${align === 'right' ? 'right-0' : isCustomRange ? '-left-[0px] xs:-left-[180px] sm:-left-[257px] md:-left-[175px] lg:-left-[220px]' : 'left-0'
            }`}
        >
          {presets && presets.length > 0 && (
            <ul className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 p-1.5 sm:w-32 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r">
              {presets.map((preset) => {
                const isActive = activePresetLabel === preset.label;
                const isCustomRangeOption = preset.label === 'Custom Range';
                const showCheckmark = isCustomRangeOption && isCustomRange;
                return (
                  <li key={preset.label}>
                    <button
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`w-full whitespace-nowrap rounded-md px-2 py-1 text-left text-[12px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive
                        ? 'bg-indigo-50 font-medium text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{preset.label}</span>
                        {showCheckmark && (
                          <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {isCustomRange && (
            <div className="p-2">
              <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
                {months.map((month, index) => (
                  <MonthGrid
                    key={month.toISOString()}
                    month={month}
                    weekStartsOn={weekStartsOn}
                    draftStart={previewStart}
                    draftEnd={previewEnd}
                    hasEnd={draft.endDate !== null}
                    isDisabledDay={isDisabledDay}
                    onSelect={selectDay}
                    onHover={setHovered}
                    showPrev={index === 0}
                    showNext={index === months.length - 1}
                    onPrev={() => setViewMonth(subMonths(viewMonth, 1))}
                    onNext={() => setViewMonth(addMonths(viewMonth, 1))}
                    onJump={(next) =>
                      setViewMonth(index === 0 ? next : subMonths(next, 1))
                    }
                  />
                ))}
              </div>

              {!autoApply && !singleDate && (
                <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] text-slate-500">
                    {draft.endDate
                      ? formatRange({ ...draft, endDate: draft.endDate }, format)
                      : 'Pick an end date'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomRange(false);
                        closePanel();
                      }}
                      className="rounded-md px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={apply}
                      disabled={!draft.endDate}
                      className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

type MonthGridProps = {
  month: Date;
  weekStartsOn: 0 | 1;
  draftStart: Date;
  draftEnd: Date | null;
  hasEnd: boolean;
  isDisabledDay: (day: Date) => boolean;
  onSelect: (day: Date) => void;
  onHover: (day: Date | null) => void;
  showPrev: boolean;
  showNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJump: (month: Date) => void;
};

function MonthGrid({
  month,
  weekStartsOn,
  draftStart,
  draftEnd,
  hasEnd,
  isDisabledDay,
  onSelect,
  onHover,
  showPrev,
  showNext,
  onPrev,
  onNext,
  onJump,
}: MonthGridProps) {
  const days = useMemo(
    () => monthMatrix(month, weekStartsOn),
    [month, weekStartsOn],
  );
  const labels = useMemo(() => weekdayLabels(weekStartsOn), [weekStartsOn]);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-0.5">
        <NavButton
          direction="prev"
          hidden={!showPrev}
          onClick={onPrev}
          label="Previous month"
        />

        <div className="flex items-center gap-1">
          <select
            aria-label="Month"
            value={month.getMonth()}
            onChange={(event) =>
              onJump(new Date(month.getFullYear(), Number(event.target.value), 1))
            }
            className="cursor-pointer rounded-md border-0 bg-transparent py-0.5 text-xs font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {monthNames.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            value={month.getFullYear()}
            onChange={(event) =>
              onJump(new Date(Number(event.target.value), month.getMonth(), 1))
            }
            className="cursor-pointer rounded-md border-0 bg-transparent py-0.5 text-xs font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <NavButton
          direction="next"
          hidden={!showNext}
          onClick={onNext}
          label="Next month"
        />
      </div>

      <div className="grid grid-cols-7 text-center">
        {labels.map((label) => (
          <div
            key={label}
            className="pb-1 font-medium uppercase tracking-wide text-[10px] text-slate-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7" onMouseLeave={() => onHover(null)}>
        {days.map((day) => {
          const outside = !isSameMonth(day, month);
          const disabled = isDisabledDay(day);
          const isStart = isSameDay(day, draftStart);
          const isEnd = draftEnd ? isSameDay(day, draftEnd) : false;
          const inRange =
            draftEnd && isBetweenDay(day, draftStart, draftEnd)
              ? true
              : false;
          const isEdge = isStart || isEnd;
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={[
                'py-0.5',
                inRange ? 'bg-indigo-50' : '',
                isStart && draftEnd && !isEnd ? 'rounded-l-full bg-indigo-50' : '',
                isEnd && !isStart ? 'rounded-r-full bg-indigo-50' : '',
              ].join(' ')}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(day)}
                onMouseEnter={() => onHover(day)}
                aria-label={day.toDateString()}
                aria-pressed={isEdge}
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  disabled
                    ? 'cursor-not-allowed text-slate-300'
                    : 'cursor-pointer',
                  isEdge
                    ? 'bg-indigo-600 font-semibold text-white hover:bg-indigo-700'
                    : disabled
                      ? ''
                      : outside
                        ? 'text-slate-300 hover:bg-slate-100'
                        : 'text-slate-700 hover:bg-slate-100',
                  !isEdge && isToday && !disabled
                    ? 'font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200'
                    : '',
                ].join(' ')}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  direction,
  hidden,
  onClick,
  label,
}: {
  direction: 'prev' | 'next';
  hidden: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${hidden ? 'invisible' : ''
        }`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3"
        aria-hidden="true"
      >
        {direction === 'prev' ? (
          <path d="M12.5 4 7 10l5.5 6" />
        ) : (
          <path d="M7.5 4 13 10l-5.5 6" />
        )}
      </svg>
    </button>
  );
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.75" y="4.25" width="14.5" height="13" rx="2" />
      <path d="M2.75 8.25h14.5M6.5 2.75v3M13.5 2.75v3" />
    </svg>
  );
}

function CaretIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 13 4 6h12l-6 7Z" />
    </svg>
  );
}