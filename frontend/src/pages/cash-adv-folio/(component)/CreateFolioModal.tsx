import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import CustomDatePicker from "@/components/ui/DatePicker";
import { folioApi, type FolioBranch } from "@/lib/api";

interface Option {
  value: string;
  label: string;
}

export interface FolioFormValues {
  branchId: number;
  folioNo: string;
  amount: string;
  bankPayment: string;
  date: string;
  remark: string;
  folioType: "Normal" | "Other";
}

interface CreateFolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: FolioFormValues) => Promise<void>;
  branches: FolioBranch[];
}

const FOLIO_TYPE_OPTIONS: Option[] = [
  { value: "Normal", label: "Normal" },
  { value: "Other", label: "Other" },
];

const localDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialValues = (): FolioFormValues => ({
  branchId: 0,
  folioNo: "",
  amount: "",
  bankPayment: "",
  date: localDateValue(new Date()),
  remark: "",
  folioType: "Normal",
});

const inputClass =
  "h-9 w-full rounded border border-[#C5CFDB] bg-white px-3 text-[13px] text-[#17222E] outline-none transition focus:border-[#0F2A47] focus:ring-2 focus:ring-[#0F2A47]/10";
const labelClass = "mb-1 block text-[13px] font-semibold text-[#3B4957]";
const dropdownButtonClass = "!h-9 !rounded !border-[#C5CFDB] !text-[13px]";

const CreateFolioModal: React.FC<CreateFolioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  branches,
}) => {
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<FolioFormValues>(initialValues);
  const [date, setDate] = useState<Date | null>(() => new Date());
  const [loadingFolioNo, setLoadingFolioNo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setValues(initialValues());
    setDate(new Date());
    setFieldErrors({});
    setLoadingFolioNo(true);

    const fetchNextNumber = async () => {
      try {
        const response = await folioApi.getNextFolioNumber();
        const folioNo = response?.data?.folio_no;
        if (typeof folioNo !== "string" || folioNo === "") {
          throw new Error("Folio number was not returned");
        }
        if (active) setValues((previous) => ({ ...previous, folioNo }));
      } catch (error) {
        console.error("Error generating folio number:", error);
        if (active) toast.error("Failed to generate folio number");
      } finally {
        if (active) setLoadingFolioNo(false);
      }
    };

    void fetchNextNumber();
    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, saving]);

  if (!mounted || typeof document === "undefined" || !isOpen) return null;

  const branchOptions: Option[] = branches.map((branch) => ({
    value: String(branch.id),
    label: branch.name,
  }));
  const selectedBranch =
    branchOptions.find((option) => option.value === String(values.branchId)) || null;
  const selectedFolioType =
    FOLIO_TYPE_OPTIONS.find((option) => option.value === values.folioType) || null;

  const set = <K extends keyof FolioFormValues>(
    key: K,
    value: FolioFormValues[K],
  ) => setValues((previous) => ({ ...previous, [key]: value }));

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!values.branchId) errors.branchId = "Branch is required";
    if (!/^[0-9]{1,6}$/.test(values.folioNo)) {
      errors.folioNo = "Enter a folio number with up to 6 digits";
    }
    if (!values.date) errors.date = "Date is required";
    if (!values.folioType) errors.folioType = "Folio type is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill the required fields");
      return;
    }

    try {
      setSaving(true);
      await onSave(values);
    } catch (error) {
      if (axios.isAxiosError<{ errors?: Record<string, string>; message?: string }>(error)) {
        const responseErrors = error.response?.data?.errors;
        if (responseErrors?.folio_no) {
          setFieldErrors((previous) => ({
            ...previous,
            folioNo: responseErrors.folio_no,
          }));
        }
        if (!error.response || error.response.status >= 500) {
          console.error("Error creating folio:", error);
        }
        toast.error(
          responseErrors?.folio_no ||
            error.response?.data?.message ||
            "Failed to create folio",
        );
      } else {
        console.error("Error creating folio:", error);
        toast.error("Failed to create folio");
      }
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    !saving &&
    !loadingFolioNo &&
    values.branchId > 0 &&
    /^[0-9]{1,6}$/.test(values.folioNo) &&
    values.date !== "";

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
            <label className={labelClass}>Branch <span className="text-red-500">*</span></label>
            <SearchableDropdown
              options={branchOptions}
              value={selectedBranch}
              onChange={(option) => {
                const branch = branches.find(
                  (item) => String(item.id) === option?.value,
                );
                setValues((previous) => ({
                  ...previous,
                  branchId: branch?.id || 0,
                  remark: branch?.head || "",
                }));
                setFieldErrors((previous) => ({ ...previous, branchId: "" }));
              }}
              placeholder="Select branch"
              searchPlaceholder="Search branch..."
              labelKey="value"
              displayKey="label"
              className="w-full"
              buttonClassName={dropdownButtonClass}
            />
            {branches.length === 0 ? (
              <span className="mt-1 block text-xs text-red-600">
                No branch is present. Please create a branch first.
              </span>
            ) : (
              fieldErrors.branchId && (
                <span className="mt-1 block text-xs text-red-600">{fieldErrors.branchId}</span>
              )
            )}
          </div>

          <div>
            <label className={labelClass}>Folio No <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              inputMode="numeric"
              disabled={loadingFolioNo}
              value={loadingFolioNo ? "Generating..." : values.folioNo}
              onChange={(event) => {
                const folioNo = event.target.value;
                if (!/^[0-9]*$/.test(folioNo)) {
                  setFieldErrors((previous) => ({
                    ...previous,
                    folioNo: "Folio number must contain digits only",
                  }));
                  return;
                }
                if (folioNo.length > 6) {
                  setFieldErrors((previous) => ({
                    ...previous,
                    folioNo: "Folio number must be six digits or fewer",
                  }));
                  return;
                }
                set("folioNo", folioNo);
                setFieldErrors((previous) => ({ ...previous, folioNo: "" }));
              }}
              placeholder="Enter up to 6 digits"
              className={inputClass}
            />
            {fieldErrors.folioNo && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.folioNo}</span>
            )}
          </div>

          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.amount}
              onChange={(event) => set("amount", event.target.value)}
              placeholder="Enter Amount"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bank Payment</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.bankPayment}
              onChange={(event) => set("bankPayment", event.target.value)}
              placeholder="Bank Payment"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Date <span className="text-red-500">*</span></label>
            <CustomDatePicker
              value={date}
              onChange={(selected) => {
                setDate(selected);
                set("date", selected ? localDateValue(selected) : "");
                setFieldErrors((previous) => ({ ...previous, date: "" }));
              }}
              placeholder="DD/MM/YYYY"
              className="!h-9 !w-full !px-3 !py-0 !text-[13px] !border-[#C5CFDB]"
            />
            {fieldErrors.date && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.date}</span>
            )}
          </div>

          <div>
            <label className={labelClass}>Folio Type <span className="text-red-500">*</span></label>
            <SearchableDropdown
              options={FOLIO_TYPE_OPTIONS}
              value={selectedFolioType}
              onChange={(option) => {
                if (option?.value === "Normal" || option?.value === "Other") {
                  set("folioType", option.value);
                }
                setFieldErrors((previous) => ({ ...previous, folioType: "" }));
              }}
              placeholder="Select type"
              searchPlaceholder="Search type..."
              labelKey="value"
              displayKey="label"
              className="w-full"
              buttonClassName={dropdownButtonClass}
            />
            {fieldErrors.folioType && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.folioType}</span>
            )}
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Remark</label>
            <input
              type="text"
              value={values.remark}
              onChange={(event) => set("remark", event.target.value)}
              placeholder="Enter Remark"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#D5DDE6] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-9 rounded border border-[#C5CFDB] bg-white px-4 text-sm font-medium text-[#0F2A47] transition-colors hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="h-9 rounded bg-[#2563EB] px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CreateFolioModal;
