import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiService from "../../../services/api";
import RightDrawer from "../../../components/ui/RightDrawer";
import DriverInfoSection from "../create/(component)/DriverInfoSection";
import FormActions from "../update/(component)/FormActions";
import { DriverFormData } from "@/types/driver-entry/types";
import { DriverRecord } from "@/types/drivers/types";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const initialFormData: DriverFormData = {
  driverName: "",
  phoneNumber: "",
  experienceYears: "",
  driverPhoto: null,
  licenceImage: null,
};

interface EditDriverDrawerProps {
  driver: DriverRecord | null;
  onClose: () => void;
  onUpdated: () => void;
}

const EditDriverDrawer: React.FC<EditDriverDrawerProps> = ({
  driver,
  onClose,
  onUpdated,
}) => {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);

  useEffect(() => {
    if (driver) {
      setFormData({
        driverName: driver.driver_name || "",
        phoneNumber: driver.phone_number || "",
        experienceYears:
          driver.experience_years != null ? String(driver.experience_years) : "",
        driverPhoto: null,
        licenceImage: null,
      });
      setFieldErrors({});
    }
  }, [driver]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.driverName.trim()) {
      errors.driverName = "Driver name is required";
    } else if (formData.driverName.trim().length < 2) {
      errors.driverName = "Driver name must be at least 2 characters";
    } else if (formData.driverName.length > 50) {
      errors.driverName = "Driver name must be less than 50 characters";
    }

    if (formData.phoneNumber) {
      const phone = formData.phoneNumber.replace(/[\s-]/g, "");
      if (!/^\+?[0-9]{7,15}$/.test(phone)) {
        errors.phoneNumber = "Enter a valid phone number";
      }
    }

    if (formData.experienceYears) {
      const years = Number(formData.experienceYears);
      if (!Number.isInteger(years) || years < 0 || years > 60) {
        errors.experienceYears = "Enter valid years of experience (0-60)";
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;

    setFieldErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("driver_name", formData.driverName.trim());
      payload.append("phone_number", formData.phoneNumber);
      payload.append("experience_years", formData.experienceYears);
      if (formData.driverPhoto) payload.append("driver_photo", formData.driverPhoto);
      if (formData.licenceImage) payload.append("licence_image", formData.licenceImage);

      await apiService.updateDriver(driver.id, payload);
      toast.success("Driver updated successfully");
      onUpdated();
    } catch (error: any) {
      console.error("Error updating driver:", error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const keyMap: { [key: string]: string } = {
          driver_name: "driverName",
          phone_number: "phoneNumber",
          experience_years: "experienceYears",
        };
        const mapped: { [key: string]: string } = {};
        for (const [key, msg] of Object.entries(apiErrors)) {
          mapped[keyMap[key] || key] = String(msg);
        }
        setFieldErrors(mapped);
      }
      toast.error(error?.response?.data?.message || "Failed to update driver");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof DriverFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field: "driverPhoto" | "licenceImage", file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFieldErrors({ ...fieldErrors, [field]: "Only image files are allowed" });
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setFieldErrors({ ...fieldErrors, [field]: "Image must be less than 5MB" });
        return;
      }
    }
    setFormData({ ...formData, [field]: file });
  };

  const handleClearError = (field: string) => {
    setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
      fieldErrors[field]
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-blue-500"
    }`;

  const sectionProps = {
    formData,
    fieldErrors,
    inputClass,
    onChange: handleChange,
    onFileChange: handleFileChange,
    onClearError: handleClearError,
    stacked: true,
  };

  return (
    <RightDrawer isOpen={!!driver} onClose={onClose} title="Edit Driver">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <DriverInfoSection {...sectionProps} />
        <FormActions saving={saving} onCancel={onClose} />
      </form>
    </RightDrawer>
  );
};

export default EditDriverDrawer;
