import { useEffect, useState } from "react";
import axios from "axios";
import { Save } from "lucide-react";
import { toast } from "react-toastify";
import RightDrawer from "@/components/ui/RightDrawer";
import {
  branchApi,
  type BranchData,
  type BranchInput,
  type BranchTextField,
} from "@/lib/api";
import useBranchGeocode from "@/hook/useBranchGeocode";
import BranchInfoSection from "./BranchInfoSection";

const initialFormData: BranchInput = {
  name: "",
  head: "",
  address: "",
  phone_number: "",
  email: "",
  latitude: null,
  longitude: null,
};

const getFormData = (branch: BranchData | null): BranchInput =>
  branch
    ? {
        name: branch.name || "",
        head: branch.head || "",
        address: branch.address || "",
        phone_number: branch.phone_number || "",
        email: branch.email || "",
        latitude: branch.latitude ?? null,
        longitude: branch.longitude ?? null,
      }
    : { ...initialFormData };

interface CreateBranchDrawerProps {
  isOpen: boolean;
  branch: BranchData | null;
  onClose: () => void;
  onSaved: () => void;
}

const CreateBranchDrawer: React.FC<CreateBranchDrawerProps> = ({
  isOpen,
  branch,
  onClose,
  onSaved,
}) => {
  const [formData, setFormData] = useState<BranchInput>({ ...initialFormData });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { lookup, cancel, clear, status, message } = useBranchGeocode();

  useEffect(() => {
    if (!isOpen) {
      clear();
      return;
    }
    setFormData(getFormData(branch));
    setFieldErrors({});
    clear();
  }, [isOpen, branch, clear]);

  useEffect(() => {
    const address = formData.address.trim();
    if (!isOpen || !address) return;

    const timeout = window.setTimeout(() => {
      void lookup(address).then((coordinates) => {
        if (!coordinates) return;
        setFormData((previous) =>
          previous.address.trim() === address
            ? { ...previous, ...coordinates }
            : previous,
        );
      });
    }, 750);

    return () => {
      window.clearTimeout(timeout);
      cancel();
    };
  }, [formData.address, isOpen, lookup, cancel]);

  const handleChange = (field: BranchTextField, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "address" ? { latitude: null, longitude: null } : {}),
    }));
    setFieldErrors((previous) => ({ ...previous, [field]: "" }));
    if (field === "address") clear();
  };

  const handleReset = () => {
    setFormData(getFormData(branch));
    setFieldErrors({});
    clear();
  };

  const waitingForCoordinates =
    formData.address.trim() !== "" &&
    (formData.latitude == null || formData.longitude == null) &&
    status === "idle";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Branch name is required";
    if (!formData.head.trim()) errors.head = "Branch head is required";
    if (!formData.address.trim()) errors.address = "Branch address is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill the required fields");
      return;
    }

    try {
      setSaving(true);
      const input: BranchInput = {
        ...formData,
        name: formData.name.trim(),
        head: formData.head.trim(),
        address: formData.address.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
      };
      if (branch) {
        await branchApi.updateBranch(branch.id, input);
        toast.success("Branch updated successfully");
      } else {
        await branchApi.createBranch(input);
        toast.success("Branch created successfully");
      }
      onSaved();
    } catch (error) {
      console.error("Error saving branch:", error);
      if (axios.isAxiosError<{ errors?: Record<string, string>; message?: string }>(error)) {
        if (error.response?.data?.errors) {
          setFieldErrors(error.response.data.errors);
        }
        toast.error(
          error.response?.data?.message ||
            `Failed to ${branch ? "update" : "create"} branch`,
        );
      } else {
        toast.error(`Failed to ${branch ? "update" : "create"} branch`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={branch ? "Edit Branch" : "Add Branch"}
      width="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-2 p-2">
        <BranchInfoSection
          formData={formData}
          fieldErrors={fieldErrors}
          onChange={handleChange}
          geocodeStatus={status}
          geocodeMessage={message}
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
            disabled={saving || status === "loading" || waitingForCoordinates}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {saving
              ? "Saving..."
              : status === "loading" || waitingForCoordinates
                ? "Finding location..."
                : branch
                  ? "Update Branch"
                  : "Save Branch"}
          </button>
        </div>
      </form>
    </RightDrawer>
  );
};

export default CreateBranchDrawer;
