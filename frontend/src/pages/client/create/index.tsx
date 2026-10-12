import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import CreatePageHeader from "../(component)/CreatePageHeader";
import ClientDetailsSection from "../(component)/ClientDetailsSection";
import TaxDetailsSection from "../(component)/TaxDetailsSection";
import FormActions from "../(component)/FormActions";
import { ClientFormData } from "@/types/client-entry/types";

const initialFormData: ClientFormData = {
  clientName: "",
  contactNo: "",
  emailId: "",
  contactPerson: "",
  address1: "",
  gstnNo: "",
  panNo: "",
};

const ClientEntryPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.clientName.trim()) {
      errors.clientName = "Client name is required";
    } else if (formData.clientName.trim().length < 2) {
      errors.clientName = "Client name must be at least 2 characters";
    } else if (formData.clientName.length > 50) {
      errors.clientName = "Client name must be less than 50 characters";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      toast.error("Please fill the required fields");
      return;
    }

    try {
      setSaving(true);
      await apiService.createClient({
        client_name: formData.clientName.trim(),
        contact_no: formData.contactNo,
        email_id: formData.emailId,
        contact_person: formData.contactPerson,
        address_1: formData.address1,
        gstn_no: formData.gstnNo,
        pan_no: formData.panNo,
      });
      toast.success("Client saved successfully");
      router.push("/client");
    } catch (error: any) {
      console.error("Error saving client:", error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const keyMap: { [key: string]: string } = {
          client_name: "clientName",
          contact_no: "contactNo",
          email_id: "emailId",
          contact_person: "contactPerson",
          address_1: "address1",
          gstn_no: "gstnNo",
          pan_no: "panNo",
        };
        const mapped: { [key: string]: string } = {};
        for (const [key, msg] of Object.entries(apiErrors)) {
          mapped[keyMap[key] || key] = String(msg);
        }
        setFieldErrors(mapped);
      }
      toast.error(error?.response?.data?.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string) => {
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
        <title>Client Entry | Pratik Transport</title>
        <meta name="description" content="Client entry" />
      
      </Head>

      <div
        className="min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]"
       
      >
        <div className=" mx-auto flex flex-col gap-7">
          <CreatePageHeader />

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)] divide-y divide-[#D5DDE6]">
              <ClientDetailsSection {...sectionProps} />
              <TaxDetailsSection {...sectionProps} />
            </div>
            <FormActions saving={saving} onReset={handleReset} />
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(ClientEntryPage);
