import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import apiService, {
  type FirmPayload,
  type FirmRecord,
} from "@/services/api";
import FirmInfoSection, { type FirmTextField } from "./FirmInfoSection";
import FirmFormActions from "./FirmFormActions";

interface FirmFormProps {
  mode: "create" | "edit";
  firm: FirmRecord | null;
  onCancel: () => void;
  onSaved: () => void;
}

const emptyFirm: FirmPayload = {
  name: "",
  address_1: "",
  address_2: "",
  pan_no: "",
  gstn_no: "",
  cash_in_hand: null,
  short_form: "",
  tan_no: "",
  starting_session: "",
};

const toFormData = (firm: FirmRecord | null): FirmPayload =>
  firm
    ? {
        name: firm.name || "",
        address_1: firm.address_1 || "",
        address_2: firm.address_2 || "",
        pan_no: firm.pan_no || "",
        gstn_no: firm.gstn_no || "",
        cash_in_hand: firm.cash_in_hand ?? null,
        short_form: firm.short_form || "",
        tan_no: firm.tan_no || "",
        starting_session: firm.starting_session || "",
      }
    : { ...emptyFirm };

const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const gstnPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const tanPattern = /^[A-Z]{4}[0-9]{5}[A-Z]$/;
const sessionPattern = /^([0-9]{4})-([0-9]{2})$/;

const FirmForm: React.FC<FirmFormProps> = ({ mode, firm, onCancel, onSaved }) => {
  const [formData, setFormData] = useState<FirmPayload>(() => toFormData(firm));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(toFormData(firm));
    setFieldErrors({});
  }, [firm]);

  const clearError = (field: string) => {
    setFieldErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const handleTextChange = (field: FirmTextField, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    clearError(field);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Firm name is required";
    }
    if (!panPattern.test(formData.pan_no.trim().toUpperCase())) {
      errors.pan_no = "Enter a valid PAN number";
    }
    if (!gstnPattern.test(formData.gstn_no.trim().toUpperCase())) {
      errors.gstn_no = "Enter a valid GSTN number";
    }
    if (!tanPattern.test(formData.tan_no.trim().toUpperCase())) {
      errors.tan_no = "Enter a valid TAN number";
    }
    if (formData.cash_in_hand != null &&
      (!Number.isFinite(formData.cash_in_hand) || formData.cash_in_hand < 0)) {
      errors.cash_in_hand = "Opening cash must be a non-negative amount";
    }
    if (formData.starting_session && formData.starting_session !== "ALL") {
      const match = sessionPattern.exec(formData.starting_session);
      if (!match ||
        Number(match[2]) !== (Number(match[1]) + 1) % 100) {
        errors.starting_session = "Select a valid starting session";
      }
    }
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please check the required fields");
      return;
    }
    if (mode === "edit" && !firm) {
      toast.error("Firm details are missing");
      return;
    }

    const payload: FirmPayload = {
      ...formData,
      name: formData.name.trim(),
      address_1: formData.address_1.trim(),
      address_2: formData.address_2.trim(),
      pan_no: formData.pan_no.trim().toUpperCase(),
      gstn_no: formData.gstn_no.trim().toUpperCase(),
      short_form: formData.short_form.trim(),
      tan_no: formData.tan_no.trim().toUpperCase(),
      starting_session: formData.starting_session.trim().toUpperCase(),
    };

    try {
      setSaving(true);
      if (mode === "edit" && firm) {
        await apiService.updateFirm(firm.id, payload);
        toast.success("Firm updated successfully");
      } else {
        await apiService.createFirm(payload);
        toast.success("Firm created successfully");
      }
      onSaved();
    } catch (error) {
      console.error("Error saving firm:", error);
      if (axios.isAxiosError<{ errors?: Record<string, string>; message?: string }>(error)) {
        if (error.response?.data?.errors) {
          setFieldErrors(error.response.data.errors);
        }
        toast.error(
          error.response?.data?.message ||
            `Failed to ${mode === "edit" ? "update" : "create"} firm`,
        );
      } else {
        toast.error(`Failed to ${mode === "edit" ? "update" : "create"} firm`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/firm"
            className="-ml-2 mb-1 flex h-7 w-fit items-center gap-1 rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1]"
          >
            Firm
          </Link>
          <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
            {mode === "edit" ? "Edit Firm" : "Create Firm"}
          </h1>
        </div>
      </div>
      <FirmInfoSection
        formData={formData}
        fieldErrors={fieldErrors}
        onTextChange={handleTextChange}
        onCashInHandChange={(value) => {
          setFormData((previous) => ({ ...previous, cash_in_hand: value }));
          clearError("cash_in_hand");
        }}
        onStartingSessionChange={(value) => {
          setFormData((previous) => ({ ...previous, starting_session: value }));
          clearError("starting_session");
        }}
      />
      <FirmFormActions saving={saving} mode={mode} onCancel={onCancel} />
    </form>
  );
};

export default FirmForm;
