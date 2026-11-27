import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import DateRangePicker, { type DateRange } from "@/components/ui/DateRangePicker";

interface Option {
  value: string;
  label: string;
}

export interface FolioFormValues {
  branch: string;
  folioNo: string;
  amount: string;
  bankPayment: string;
  dateRange: DateRange;
  remark: string;
  folioType: string;
}

interface CreateFolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: FolioFormValues) => void;
  branchOptions?: string[];
}

const FOLIO_TYPE_OPTIONS: Option[] = [
  { value: "Normal", label: "Normal" },
  { value: "Other", label: "Other" },
];

const last30Days = (): DateRange => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 29);
  return { startDate, endDate };
};

const inputClass =
  "h-9 w-full rounded border border-[#C5CFDB] bg-white px-3 text-[13px] text-[#17222E] outline-none transition focus:border-[#0F2A47] focus:ring-2 focus:ring-[#0F2A47]/10";

const labelClass = "mb-1 block text-[13px] font-semibold text-[#3B4957]";
const dropdownButtonClass = "!h-9 !rounded !border-[#C5CFDB] !text-[13px]";

const initialValues = (): Omit<FolioFormValues, "dateRange"> & { dateRange: DateRange | null } => ({
  branch: "",
  folioNo: "",
  amount: "",
  bankPayment: "",
  dateRange: null,
  remark: "",
  folioType: "Normal",
});

const CreateFolioModal: React.FC<CreateFolioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  branchOptions = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState(initialValues);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setValues({ ...initialValues(), dateRange: last30Days() });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || typeof document === "undefined" || !isOpen) return null;

  const branchOpts: Option[] = branchOptions.map((item) => ({
    value: item,
    label: item,
  }));
  const selectedBranch = branchOpts.find((o) => o.value === values.branch) || null;
  const selectedFolioType =
    FOLIO_TYPE_OPTIONS.find((o) => o.value === values.folioType) || null;

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!values.dateRange) return;
    onSave({
      branch: values.branch,
      folioNo: values.folioNo.trim(),
      amount: values.amount.trim(),
      bankPayment: values.bankPayment.trim(),
      dateRange: values.dateRange,
      remark: values.remark.trim(),
      folioType: values.folioType,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D5DDE6] px-4 py-3">
          <h3 className="text-base font-semibold text-[#0F2A47]">Create Folio</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Branch</label>
            <SearchableDropdown
              options={branchOpts}
              value={selectedBranch}
              onChange={(option) => set("branch", option ? option.value : "")}
              placeholder="Select branch"
              searchPlaceholder="Search branch..."
              labelKey="value"
              displayKey="label"
              className="w-full"
              buttonClassName={dropdownButtonClass}
            />
          </div>

          <div>
            <label className={labelClass}>Folio No</label>
            <input
              type="text"
              value={values.folioNo}
              onChange={(e) => set("folioNo", e.target.value)}
              placeholder="Enter Folio No"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="text"
              inputMode="numeric"
              value={values.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="Enter Amount"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bank Payment</label>
            <input
              type="text"
              value={values.bankPayment}
              onChange={(e) => set("bankPayment", e.target.value)}
              placeholder="Bank Payment"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Date</label>
            <DateRangePicker
              value={values.dateRange}
              onChange={(range) => set("dateRange", range)}
              className="w-full"
              height={36}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Remark</label>
            <input
              type="text"
              value={values.remark}
              onChange={(e) => set("remark", e.target.value)}
              placeholder="Enter Remark"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Folio Type</label>
            <SearchableDropdown
              options={FOLIO_TYPE_OPTIONS}
              value={selectedFolioType}
              onChange={(option) => set("folioType", option ? option.value : "")}
              placeholder="Select type"
              searchPlaceholder="Search type..."
              labelKey="value"
              displayKey="label"
              className="w-full"
              buttonClassName={dropdownButtonClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#D5DDE6] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded border border-[#C5CFDB] bg-white px-4 text-sm font-medium text-[#0F2A47] transition-colors hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!values.dateRange}
            className="h-9 rounded bg-[#2563EB] px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateFolioModal;
