import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import CreatePageHeader from "../(component)/CreatePageHeader";
import PumpDetailsSection from "../(component)/PumpDetailsSection";
import TaxDetailsSection from "../(component)/TaxDetailsSection";
import BankDetailsSection from "../(component)/BankDetailsSection";
import FormActions from "../(component)/FormActions";
import { PumpFormData } from "@/types/pump-entry/types";
import { scrollToFirstError } from "@/utils/scrollToError";

const initialFormData: PumpFormData = {
  pumpName: "",
  contactNo: "",
  emailId: "",
  contactPerson: "",
  address1: "",
  address2: "",
  address3: "",
  gstnNo: "",
  panNo: "",
  bankerName: "",
  branchName: "",
  accountNo: "",
  ifscCode: "",
  openingBalance: "",
};

const PumpEntryPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<PumpFormData>(initialFormData);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.pumpName.trim()) {
      errors.pumpName = "Pump name is required";
    }

    // if (formData.gstnNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(formData.gstnNo)) {
    //   errors.gstnNo = "Enter a valid GSTN number";
    // }

    // if (formData.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.panNo)) {
    //   errors.panNo = "Enter a valid PAN number";
    // }

    // if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
    //   errors.ifscCode = "Enter a valid IFSC code";
    // }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      scrollToFirstError();
      toast.error("Please fill the required fields");
      return;
    }

    try {
      setSaving(true);
      await apiService.createPump({
        pump_name: formData.pumpName.trim(),
        contact_no: formData.contactNo,
        email_id: formData.emailId,
        contact_person: formData.contactPerson,
        address_1: formData.address1,
        address_2: formData.address2,
        address_3: formData.address3,
        gstn_no: formData.gstnNo,
        pan_no: formData.panNo,
        banker_name: formData.bankerName,
        branch_name: formData.branchName,
        account_no: formData.accountNo,
        ifsc_code: formData.ifscCode,
        opening_balance: formData.openingBalance,
      });
      toast.success("Pump saved successfully");
      router.push("/pump");
    } catch (error: any) {
      console.error("Error saving pump:", error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const keyMap: { [key: string]: string } = {
          pump_name: "pumpName",
          contact_no: "contactNo",
          email_id: "emailId",
          contact_person: "contactPerson",
          address_1: "address1",
          address_2: "address2",
          address_3: "address3",
          gstn_no: "gstnNo",
          pan_no: "panNo",
          banker_name: "bankerName",
          branch_name: "branchName",
          account_no: "accountNo",
          ifsc_code: "ifscCode",
          opening_balance: "openingBalance",
        };
        const mapped: { [key: string]: string } = {};
        for (const [key, msg] of Object.entries(apiErrors)) {
          mapped[keyMap[key] || key] = String(msg);
        }
        setFieldErrors(mapped);
        scrollToFirstError();
      }
      toast.error(error?.response?.data?.message || "Failed to save pump");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PumpFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleClearError = (field: string) => {
    setFieldErrors({ ...fieldErrors, [field]: "" });
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
        <title>Pump Entry | Pratik Transport</title>
        <meta name="description" content="Pump entry" />
      </Head>

      <div className="min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]">
        <div className="mx-auto flex flex-col gap-7">
          <CreatePageHeader />

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <PumpDetailsSection {...sectionProps} />
            <TaxDetailsSection {...sectionProps} />
            <BankDetailsSection {...sectionProps} />
            <FormActions saving={saving} />
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(PumpEntryPage);
