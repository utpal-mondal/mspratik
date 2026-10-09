import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Save } from "lucide-react";
import apiService from "../../../services/api";
import RightDrawer from "../../../components/ui/RightDrawer";
import ProductInfoSection, { ProductFormData } from "./ProductInfoSection";

const initialFormData: ProductFormData = {
  name: "",
  price: "",
};

interface CreateProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateProductDrawer: React.FC<CreateProductDrawerProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setFieldErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Product name must be at least 2 characters";
    }

    if (formData.price) {
      const price = Number(formData.price);
      if (isNaN(price) || price < 0) {
        errors.price = "Enter a valid price";
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      setSaving(true);
      await apiService.createProduct({
        name: formData.name.trim(),
        price: formData.price,
      });
      toast.success("Product saved successfully");
      onCreated();
    } catch (error: any) {
      console.error("Error saving product:", error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const mapped: { [key: string]: string } = {};
        for (const [key, msg] of Object.entries(apiErrors)) {
          mapped[key] = String(msg);
        }
        setFieldErrors(mapped);
      }
      toast.error(error?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleClearError = (field: string) => {
    setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setFieldErrors({});
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
      fieldErrors[field]
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-blue-500"
    }`;

  return (
    <RightDrawer isOpen={isOpen} onClose={onClose} title="Add Product">
      <form onSubmit={handleSubmit} className="p-2 space-y-2">
        <ProductInfoSection
          formData={formData}
          fieldErrors={fieldErrors}
          inputClass={inputClass}
          onChange={handleChange}
          onClearError={handleClearError}
        />
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </RightDrawer>
  );
};

export default CreateProductDrawer;
