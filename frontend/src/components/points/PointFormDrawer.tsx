import { useEffect, useState } from "react";
import axios from "axios";
import { Save } from "lucide-react";
import { toast } from "react-toastify";
import RightDrawer from "@/components/ui/RightDrawer";
import {
  pointApi,
  type PointData,
  type PointInput,
  type PointResource,
} from "@/lib/api";

interface PointFormDrawerProps {
  resource: PointResource;
  title: string;
  isOpen: boolean;
  point: PointData | null;
  onClose: () => void;
  onSaved: () => void;
}

const initialForm: PointInput = {
  name: "",
  contact_person: "",
  contact_person_mobile_no: "",
};

const PointFormDrawer = ({
  resource,
  title,
  isOpen,
  point,
  onClose,
  onSaved,
}: PointFormDrawerProps) => {
  const [formData, setFormData] = useState<PointInput>({ ...initialForm });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const singular = title.endsWith("s") ? title.slice(0, -1) : title;

  useEffect(() => {
    if (!isOpen) return;
    setFormData(
      point
        ? {
            name: point.name,
            contact_person: point.contact_person || "",
            contact_person_mobile_no: point.contact_person_mobile_no || "",
          }
        : { ...initialForm },
    );
    setFieldErrors({});
  }, [isOpen, point]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (
      formData.contact_person_mobile_no !== "" &&
      !/^[0-9]{10}$/.test(formData.contact_person_mobile_no)
    ) {
      errors.contact_person_mobile_no = "Enter exactly 10 digits";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please check the required fields");
      return;
    }

    const input: PointInput = {
      name: formData.name.trim(),
      contact_person: formData.contact_person.trim(),
      contact_person_mobile_no: formData.contact_person_mobile_no,
    };
    try {
      setSaving(true);
      if (point) {
        await pointApi.updatePoint(resource, point.id, input);
        toast.success(`${singular} updated successfully`);
      } else {
        await pointApi.createPoint(resource, input);
        toast.success(`${singular} created successfully`);
      }
      onSaved();
    } catch (error) {
      console.error(`Error saving ${title.toLowerCase()}:`, error);
      if (axios.isAxiosError<{ errors?: Record<string, string>; message?: string }>(error)) {
        if (error.response?.data?.errors) setFieldErrors(error.response.data.errors);
        toast.error(
          error.response?.data?.message ||
            `Failed to ${point ? "update" : "create"} ${singular.toLowerCase()}`,
        );
      } else {
        toast.error(`Failed to save ${singular.toLowerCase()}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(
      point
        ? {
            name: point.name,
            contact_person: point.contact_person || "",
            contact_person_mobile_no: point.contact_person_mobile_no || "",
          }
        : { ...initialForm },
    );
    setFieldErrors({});
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${point ? "Edit" : "Add"} ${singular}`}
      width="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {([
          ["name", "Name"],
          ["contact_person", "Contact person"],
          ["contact_person_mobile_no", "Contact person mobile no"],
        ] as const).map(([field, label]) => (
          <label key={field} className="block text-sm font-medium text-gray-700">
            {label}{field === "name" && <span className="text-red-500"> *</span>}
            <input
              type={field === "contact_person_mobile_no" ? "tel" : "text"}
              required={field === "name"}
              inputMode={field === "contact_person_mobile_no" ? "numeric" : undefined}
              value={formData[field]}
              onChange={(event) => {
                if (field === "contact_person_mobile_no") {
                  if (!/^[0-9]*$/.test(event.target.value)) {
                    setFieldErrors((previous) => ({
                      ...previous,
                      [field]: "Only digits are allowed",
                    }));
                    return;
                  }
                  if (event.target.value.length > 10) {
                    setFieldErrors((previous) => ({
                      ...previous,
                      [field]: "Maximum 10 digits allowed",
                    }));
                    return;
                  }
                }
                setFormData((previous) => ({ ...previous, [field]: event.target.value }));
                setFieldErrors((previous) => ({ ...previous, [field]: "" }));
              }}
              className="mt-1 h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            {fieldErrors[field] && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors[field]}</span>
            )}
          </label>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : point ? `Update ${singular}` : `Save ${singular}`}
          </button>
        </div>
      </form>
    </RightDrawer>
  );
};

export default PointFormDrawer;
