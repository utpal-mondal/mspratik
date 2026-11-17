import { useEffect, useState } from "react";
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

const UpdateCompanyPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const companyId = Array.isArray(id) ? id[0] : id;
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
    locationApi: "",
  });

  useEffect(() => {
    if (!companyId) return;
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await apiService.getCompany(Number(companyId));
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
            locationApi: company.location_api || "",
          });
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        toast.error("Failed to fetch company details");
        router.push("/company-details");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

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
    if (!companyId) return;

    setFieldErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      await apiService.updateCompany(Number(companyId), {
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
      toast.success("Company updated successfully");
      router.push("/company-details");
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update company"
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

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading company details...</p>
      </main>
    );
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
        <title>Update Company | Pratik Transport</title>
        <meta name="description" content="Update company" />
      </Head>

      <div className="min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]">
        <div className="mx-auto flex flex-col gap-7">
          <FormPageHeader
            title="Update Company"
            description="Edit the company details."
          />

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <CompanyInfoSection {...sectionProps} />
            <AddressSection {...sectionProps} />
            <ContactPersonSection {...sectionProps} />
            <RemarksSection {...sectionProps} />
            <FormActions
              saving={saving}
              cancelHref="/company-details"
              submitLabel="Update Company"
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(UpdateCompanyPage);
