import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import PageHeader from "./(component)/PageHeader";
import DriverInfoSection from "./(component)/DriverInfoSection";
// import DocumentsSection from "./(component)/DocumentsSection";
import FormActions from "./(component)/FormActions";
import { DriverFormData } from "@/types/driver-entry/types";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const initialFormData: DriverFormData = {
  driverName: "",
  phoneNumber: "",
  experienceYears: "",
  driverPhoto: null,
  licenceImage: null,
};

const DriverEntryPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);

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
      toast.error("Please enter the driver name");
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

      await apiService.createDriver(payload);
      toast.success("Driver saved successfully");
      router.push("/drivers");
    } catch (error: any) {
      console.error("Error saving driver:", error);
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
  };

  return (
    <>
      <Head>
        <title>Driver Entry | Pratik Transport</title>
        <meta name="description" content="Driver entry" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <PageHeader />

          <form onSubmit={handleSubmit} className="space-y-4">
            <DriverInfoSection {...sectionProps} />
            {/* <DocumentsSection {...sectionProps} /> */}
            <FormActions saving={saving} onReset={handleReset} />
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(DriverEntryPage);
