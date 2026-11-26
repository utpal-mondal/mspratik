import { useEffect, useState } from "react";
import axios from "axios";
import { Save } from "lucide-react";
import { toast } from "react-toastify";
import RightDrawer from "@/components/ui/RightDrawer";
import apiService, {
  type ConsignorPayload,
  type ConsignorRecord,
} from "@/services/api";
import ConsignorInfoSection from "./ConsignorInfoSection";

interface ConsignorFormDrawerProps {
  isOpen: boolean;
  consignor: ConsignorRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

const emptyFormData: ConsignorPayload = {
  name: "",
  address: "",
  email: "",
  phone_number: "",
};

const getFormData = (consignor: ConsignorRecord | null): ConsignorPayload =>
  consignor
    ? {
        name: consignor.name || "",
        address: consignor.address || "",
        email: consignor.email || "",
        phone_number: consignor.phone_number || "",
      }
    : { ...emptyFormData };

const ConsignorFormDrawer: React.FC<ConsignorFormDrawerProps> = ({
  isOpen,
  consignor,
  onClose,
  onSaved,
}) => {
  const [formData, setFormData] = useState<ConsignorPayload>({ ...emptyFormData });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(getFormData(consignor));
    setFieldErrors({});
  }, [isOpen, consignor]);

  const handleChange = (field: keyof ConsignorPayload, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const handleReset = () => {
    setFormData(getFormData(consignor));
    setFieldErrors({});
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Consignor name is required";
    if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
      errors.phone_number = "Mobile number must be exactly 10 digits";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please check the required fields");
      return;
    }

    const payload: ConsignorPayload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      email: formData.email.trim(),
      phone_number: formData.phone_number.trim(),
    };

    try {
      setSaving(true);
      if (consignor) {
        await apiService.updateConsignor(consignor.id, payload);
        toast.success("Consignor updated successfully");
      } else {
        await apiService.createConsignor(payload);
        toast.success("Consignor created successfully");
      }
      onSaved();
    } catch (error) {
      console.error("Error saving consignor:", error);
      if (axios.isAxiosError<{ errors?: Record<string, string>; message?: string }>(error)) {
        if (error.response?.data?.errors) {
          setFieldErrors(error.response.data.errors);
        }
        toast.error(
          error.response?.data?.message ||
            `Failed to ${consignor ? "update" : "create"} consignor`,
        );
      } else {
        toast.error(`Failed to ${consignor ? "update" : "create"} consignor`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={consignor ? "Edit Consignor" : "Add Consignor"}
      width="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-2 p-2">
        <ConsignorInfoSection
          formData={formData}
          fieldErrors={fieldErrors}
          onChange={handleChange}
        />
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : consignor ? "Update Consignor" : "Save Consignor"}
          </button>
        </div>
      </form>
    </RightDrawer>
  );
};

export default ConsignorFormDrawer;
