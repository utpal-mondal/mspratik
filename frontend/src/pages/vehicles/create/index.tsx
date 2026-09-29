import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import PageHeader from "./(component)/PageHeader";
import VehicleInfoSection from "./(component)/VehicleInfoSection";

import DocumentsSection from "./(component)/DocumentsSection";
import FormActions from "./(component)/FormActions";
import { VehicleFormData } from "@/types/vehicle-entry/types";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const initialFormData: VehicleFormData = {
  vehicleNumber: "",
  ownerName: "",
  ownerPhone: "",
  vehicleType: "self",
  numberOfWheels: "",
  registrationExpiryDate: "",
  rcNumber: "",
  permitNumber: "",
  insuranceNumber: "",
  pucNumber: "",
  vehicleImage: null,
  rcBookImage: null,
};

const VehicleEntryPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    const normalizedNumber = formData.vehicleNumber.replace(/[\s-]/g, "").toUpperCase();
    if (!formData.vehicleNumber.trim()) {
      errors.vehicleNumber = "Vehicle number is required";
    } else if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(normalizedNumber)) {
      errors.vehicleNumber = "Enter a valid vehicle number (e.g. MH12AB1234)";
    }

    if (formData.ownerName && formData.ownerName.length > 50) {
      errors.ownerName = "Owner name must be less than 50 characters";
    }

    if (formData.ownerPhone) {
      const phone = formData.ownerPhone.replace(/[\s-]/g, "");
      if (!/^\+?[0-9]{7,15}$/.test(phone)) {
        errors.ownerPhone = "Enter a valid phone number";
      }
    }

    if (formData.numberOfWheels) {
      const wheels = Number(formData.numberOfWheels);
      if (!Number.isInteger(wheels) || wheels < 2 || wheels > 20) {
        errors.numberOfWheels = "Enter a valid number of wheels (2-20)";
      }
    }

    if (formData.registrationExpiryDate) {
      const expiry = new Date(formData.registrationExpiryDate);
      if (isNaN(expiry.getTime())) {
        errors.registrationExpiryDate = "Enter a valid date";
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
      payload.append("vehicle_number", formData.vehicleNumber.replace(/[\s-]/g, "").toUpperCase());
      payload.append("owner_name", formData.ownerName);
      payload.append("owner_phone", formData.ownerPhone);
      payload.append("vehicle_type", formData.vehicleType);
      payload.append("number_of_wheels", formData.numberOfWheels);
      payload.append("registration_expiry_date", formData.registrationExpiryDate);
      payload.append("rc_number", formData.rcNumber);
      payload.append("permit_number", formData.permitNumber);
      payload.append("insurance_number", formData.insuranceNumber);
      payload.append("puc_number", formData.pucNumber);
      if (formData.vehicleImage) payload.append("vehicle_image", formData.vehicleImage);
      if (formData.rcBookImage) payload.append("rc_book_image", formData.rcBookImage);

      await apiService.createVehicle(payload); // will use s3 for img's in future, for now store null fot the img's in db
      toast.success("Vehicle saved successfully");
      router.push("/vehicles");
    } catch (error: any) {
      console.error("Error saving vehicle:", error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const keyMap: { [key: string]: string } = {
          vehicle_number: "vehicleNumber",
          owner_name: "ownerName",
          owner_phone: "ownerPhone",
          vehicle_type: "vehicleType",
          number_of_wheels: "numberOfWheels",
          registration_expiry_date: "registrationExpiryDate",
          rc_number: "rcNumber",
          permit_number: "permitNumber",
          insurance_number: "insuranceNumber",
          puc_number: "pucNumber",
        };
        const mapped: { [key: string]: string } = {};
        for (const [key, msg] of Object.entries(apiErrors)) {
          mapped[keyMap[key] || key] = String(msg);
        }
        setFieldErrors(mapped);
      }
      toast.error(error?.response?.data?.message || "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof VehicleFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field: "vehicleImage" | "rcBookImage", file: File | null) => {
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
        <title>Vehicle Entry | Pratik Transport</title>
        <meta name="description" content="Vehicle entry" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <PageHeader />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                <VehicleInfoSection {...sectionProps} />
                <DocumentsSection {...sectionProps} />
              </div>
            </div>
            <FormActions saving={saving} onReset={handleReset} />
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(VehicleEntryPage);
