import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import usePermission from "../../../hook/usePermission";
import AccessDenied from "../../../components/AccessDenied";
import apiService from "../../../services/api";
import FormPageHeader from "../(component)/FormPageHeader";
import CompanyInfoSection from "../(component)/CompanyInfoSection";
import AddressSection from "../(component)/AddressSection";
import ContactPersonSection from "../(component)/ContactPersonSection";
import RemarksSection from "../(component)/RemarksSection";
import FormActions from "../(component)/FormActions";
import { CompanyFormData } from "@/types/company-details/types";
import { scrollToFirstError } from "@/utils/scrollToError";

const CreateCompanyPage = () => {
  const router = useRouter();
  const { isCadmin } = usePermission();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    phoneNumber: "",
    vatNumber: "",
    address: "",
    address2: "",
    postCode: "",
    region: "",
    city: "",
    country: "",
    language: "nl",
    currency: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    remark: "",
    locationApi: "",
  });

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Company name is required";
    } else if (formData.name.length > 30) {
      errors.name = "Company name must be less than 30 characters";
    }

    if (formData.email && formData.email.length > 50) {
      errors.email = "Email must be less than 50 characters";
    }

    if (formData.phoneNumber && formData.phoneNumber.length > 20) {
      errors.phoneNumber = "Phone number must be less than 20 characters";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      scrollToFirstError();
      return;
    }

    try {
      setSaving(true);
      await apiService.createCompany({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phoneNumber,
        vat_number: formData.vatNumber,
        address: formData.address,
        address_2: formData.address2,
        post_code: formData.postCode,
        region: formData.region,
        city: formData.city,
        country: formData.country,
        language: formData.language,
        currency: formData.currency,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        remark: formData.remark,
        location_api: formData.locationApi,
      });
      toast.success("Company created successfully");
      router.push("/company-details");
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create company"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleClearError = (field: string) => {
    setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  if (!isCadmin()) {
    return <AccessDenied />;
  }

  const inputClass = (field: string) =>
    `w-full h-10 px-3 border rounded text-[13px] focus:outline-none focus:ring-2 transition-colors ${
      fieldErrors[field]
        ? "border-red-500 focus:ring-red-500/20"
        : "border-[#C5CFDB] focus:ring-[#0F2A47]/20 focus:border-[#0F2A47]"
    }`;

  const sectionProps = {
    formData,
    fieldErrors,
    inputClass,
    onChange: handleChange,
    onClearError: handleClearError,
  };

  return (
    <>
      <Head>
        <title>Add Company | Pratik Transport</title>
        <meta name="description" content="Add company" />
      </Head>

      <div className="min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]">
        <div className="mx-auto flex flex-col gap-7">
          <FormPageHeader
            title="Create Company"
            description="Add a new company with its details."
          />

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <CompanyInfoSection {...sectionProps} />
            <AddressSection {...sectionProps} />
            <ContactPersonSection {...sectionProps} />
            <RemarksSection {...sectionProps} />
            <FormActions
              saving={saving}
              cancelHref="/company-details"
              submitLabel="Save Company"
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(CreateCompanyPage);
