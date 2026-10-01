import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiService from "../../../services/api";
import RightDrawer from "../../../components/ui/RightDrawer";
import DriverInfoSection from "../create/(component)/DriverInfoSection";
import FormActions from "../create/(component)/FormActions";
import { DriverFormData } from "@/types/driver-entry/types";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const initialFormData: DriverFormData = {
  driverName: "",
  phoneNumber: "",
  experienceYears: "",
  licenceNumber: "",
  driverPhoto: null,
  licenceImage: null,
};

interface CreateDriverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateDriverDrawer: React.FC<CreateDriverDrawerProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setFieldErrors({});
    }
  }, [isOpen]);

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

  const validateImage = (file: File): string => {
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return "Image must be less than 5MB";
    }
    return "";
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
      const payload = new FormData();
      payload.append("driver_name", formData.driverName.trim());
      payload.append("phone_number", formData.phoneNumber);
      payload.append("experience_years", formData.experienceYears);
      payload.append("licence_number", formData.licenceNumber);
      if (formData.driverPhoto) payload.append("driver_photo", formData.driverPhoto);
      if (formData.licenceImage) payload.append("licence_image", formData.licenceImage);

      await apiService.createDriver(payload);
      toast.success("Driver saved successfully");
      onCreated();
    } catch (error: any) {
      console.error("Error saving driver:", error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const keyMap: { [key: string]: string } = {
          driver_name: "driverName",
          phone_number: "phoneNumber",
          experience_years: "experienceYears",
          licence_number: "licenceNumber",
        };
        const mapped: { [key: string]: string } = {};
        for (const [key, msg] of Object.entries(apiErrors)) {
          mapped[keyMap[key] || key] = String(msg);
        }
        setFieldErrors(mapped);
      }
      toast.error(error?.response?.data?.message || "Failed to save driver");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof DriverFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field: "driverPhoto" | "licenceImage", file: File | null) => {
    if (file) {
      const error = validateImage(file);
      if (error) {
        setFieldErrors({ ...fieldErrors, [field]: error });
        return;
      }
    }
    setFormData({ ...formData, [field]: file });
  };

  const handleClearError = (field: string) => {
    setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setFieldErrors({});
  };

  const inputClass = (field: string) =>
    `w-[20rem] px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-xs ${
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
    <RightDrawer isOpen={isOpen} onClose={onClose} title="Add Driver">
      <form onSubmit={handleSubmit} className="p-2 space-y-2">
        <DriverInfoSection {...sectionProps} />
        <FormActions saving={saving} onReset={handleReset} />
      </form>
    </RightDrawer>
  );
};

export default CreateDriverDrawer;
