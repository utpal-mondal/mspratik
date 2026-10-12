import { useState } from "react";
import { toast } from "react-toastify";
import { Save } from "lucide-react";
import RightDrawer from "@/components/ui/RightDrawer";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import apiService from "@/services/api";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "deactive", label: "Deactive" },
];

interface AddCargoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AddCargoDrawer: React.FC<AddCargoDrawerProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [cargoName, setCargoName] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setCargoName("");
    setStatus("active");
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const name = cargoName.trim();
    if (!name) {
      setError("Cargo name is required");
      return;
    }
    if (name.length < 2) {
      setError("Cargo name must be at least 2 characters");
      return;
    }
    if (name.length > 50) {
      setError("Cargo name must be less than 50 characters");
      return;
    }

    try {
      setSaving(true);
      await apiService.createCargo({ cargo_name: name, status });
      toast.success("Cargo saved successfully");
      handleClose();
      onCreated();
    } catch (err: any) {
      console.error("Error saving cargo:", err);
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors?.cargo_name) {
        setError(String(apiErrors.cargo_name));
      }
      toast.error(err?.response?.data?.message || "Failed to save cargo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RightDrawer isOpen={isOpen} onClose={handleClose} title="Add Cargo" width="max-w-md">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col min-h-full text-[#17222E]"
        style={{ fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Helvetica, sans-serif" }}
      >
        <div className="flex-1 px-5 py-4">
          <label className="block text-[13px] font-medium text-[#3B4957] mb-1.5">
            Cargo Name <span className="text-[#A12B2B]">*</span>
          </label>
          <input
            type="text"
            value={cargoName}
            onChange={(e) => {
              setCargoName(e.target.value);
              if (error) setError("");
            }}
            className={`w-full h-10 px-3 border rounded text-[13px] capitalize focus:outline-none focus:ring-2 transition-colors ${
              error
                ? "border-red-500 focus:ring-red-500/20"
                : "border-[#C5CFDB] focus:ring-[#0F2A47]/20 focus:border-[#0F2A47]"
            }`}
            placeholder="Enter Cargo name"
            maxLength={50}
            autoFocus
          />
          {error && <p className="mt-1 text-xs text-[#A12B2B]">{error}</p>}

          <div className="mt-2">
            <label className="block text-[13px] font-medium text-[#3B4957] mb-1.5">
              Status
            </label>
            <SearchableDropdown
              options={statusOptions}
              value={statusOptions.find((o) => o.value === status) || null}
              onChange={(option) => setStatus(option ? option.value : "active")}
              placeholder="Select status"
              searchPlaceholder="Search status..."
              labelKey="value"
              displayKey="label"
              allowClear={false}
              className="w-full"
              buttonClassName="text-[13px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#D5DDE6]">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="h-10 px-4 bg-white text-[#0F2A47] border border-[#C5CFDB] rounded font-medium text-[13px] cursor-pointer transition-colors hover:bg-[#F1F4F8] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 h-10 px-4 bg-blue-700 text-white border border-blue-400 rounded font-medium text-[13px] cursor-pointer transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={13} />
            {saving ? "Saving..." : "Save Cargo"}
          </button>
        </div>
      </form>
    </RightDrawer>
  );
};

export default AddCargoDrawer;
