import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import usePermission from "../../hook/usePermission";
import AccessDenied from "../../components/AccessDenied";
import apiService from "../../services/api";
import PageHeader from "./(component)/PageHeader";
import CompanyInfoSection from "./(component)/CompanyInfoSection";
import AddressSection from "./(component)/AddressSection";
import ContactPersonSection from "./(component)/ContactPersonSection";
import RemarksSection from "./(component)/RemarksSection";
import FormActions from "./(component)/FormActions";
import { CompanyFormData }  from "@/types/company-details/types";;

const CompanyDetailsPage = () => {
  const { isCadmin } = usePermission();
  const [loading, setLoading] = useState(false);
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
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await apiService.getCompanyDetails();
        const company = res?.data?.data || res?.data;
        if (company) {
          setFormData({
            name: company.name || "",
            email: company.email || "",
            phoneNumber: company.phone_number || "",
            vatNumber: company.vat_number || "",
            address: company.address || "",
            address2: company.address_2 || "",
            postCode: company.post_code || "",
            region: company.region || "",
            city: company.city || "",
            country: company.country || "",
            language: company.language || "nl",
            currency: company.currency || "",
            contactName: company.contact_name || "",
            contactEmail: company.contact_email || "",
            contactPhone: company.contact_phone || "",
            remark: company.remark || "",
          });
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
        toast.error("Failed to fetch company details");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

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
      return;
    }

    try {
      setSaving(true);
      await apiService.updateCompanyDetails({
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
      });
      toast.success("Company details updated successfully");
    } catch (error: any) {
      console.error("Error updating company details:", error);
      toast.error(error?.response?.data?.message || "Failed to update company details");
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

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading company details...</p>
      </main>
    );
  }

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
    onClearError: handleClearError,
  };

  return (
    <>
      <Head>
        <title>Company Details | Pratik Transport</title>
        <meta name="description" content="Company details" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <CompanyInfoSection {...sectionProps} />
            <AddressSection {...sectionProps} />
            <ContactPersonSection {...sectionProps} />
            <RemarksSection {...sectionProps} />
            <FormActions saving={saving} />
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(CompanyDetailsPage);
