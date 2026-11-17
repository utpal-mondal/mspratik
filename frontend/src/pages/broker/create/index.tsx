import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import CreatePageHeader from "../(component)/CreatePageHeader";
import BrokerDetailsSection from "../(component)/BrokerDetailsSection";
import TaxDetailsSection from "../(component)/TaxDetailsSection";
import BankDetailsSection from "../(component)/BankDetailsSection";
import BrokerSettingsSection from "../(component)/BrokerSettingsSection";
import FormActions from "../(component)/FormActions";
import { BrokerFormData } from "@/types/broker-entry/types";
import { scrollToFirstError } from "@/utils/scrollToError";

const initialFormData: BrokerFormData = {
  brokerName: "",
  contactNo: "",
  emailId: "",
  contactPerson: "",
  address1: "",
  address2: "",
  address3: "",
  openingBalance: "",
  gstnNo: "",
  panNo: "",
  shortForm: "",
  bankerName: "",
  bankId: "",
  branchName: "",
  accountNo: "",
  ifscCode: "",
  brokerType: "normal",
  ownerBillType: "normal",
  adharNo: "",
  qtyRound: "not_applicable",
};

const BrokerEntryPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<BrokerFormData>(initialFormData);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.brokerName.trim()) {
      errors.brokerName = "Broker name is required";
    } else if (formData.brokerName.trim().length < 2) {
      errors.brokerName = "Broker name must be at least 2 characters";
    } else if (formData.brokerName.length > 50) {
      errors.brokerName = "Broker name must be less than 50 characters";
    }

    // if (formData.contactNo) {
    //   const phone = formData.contactNo.replace(/[\s-]/g, "");
    //   if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    //     errors.contactNo = "Enter a valid contact number";
    //   }
    // }

    // if (formData.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
    //   errors.emailId = "Enter a valid email address";
    // }

    // if (formData.gstnNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(formData.gstnNo)) {
    //   errors.gstnNo = "Enter a valid GSTN number";
    // }

    // if (formData.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.panNo)) {
    //   errors.panNo = "Enter a valid PAN number";
    // }

    // if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
    //   errors.ifscCode = "Enter a valid IFSC code";
    // }

    // if (formData.adharNo && !/^[0-9]{12}$/.test(formData.adharNo)) {
    //   errors.adharNo = "Enter a valid 12-digit Adhar number";
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
      await apiService.createBroker({
        broker_name: formData.brokerName.trim(),
        contact_no: formData.contactNo,
        email_id: formData.emailId,
        contact_person: formData.contactPerson,
        address_1: formData.address1,
        address_2: formData.address2,
        address_3: formData.address3,
        opening_balance: formData.openingBalance,
        gstn_no: formData.gstnNo,
        pan_no: formData.panNo,
        short_form: formData.shortForm,
        banker_name: formData.bankerName,
        bank_id: formData.bankId,
        branch_name: formData.branchName,
        account_no: formData.accountNo,
        ifsc_code: formData.ifscCode,
        broker_type: formData.brokerType,
        owner_bill_type: formData.ownerBillType,
        adhar_no: formData.adharNo,
        qty_round: formData.qtyRound,
      });
      toast.success("Broker saved successfully");
      router.push("/broker");
    } catch (error: any) {
      console.error("Error saving broker:", error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const keyMap: { [key: string]: string } = {
          broker_name: "brokerName",
          contact_no: "contactNo",
          email_id: "emailId",
          contact_person: "contactPerson",
          address_1: "address1",
          address_2: "address2",
          address_3: "address3",
          opening_balance: "openingBalance",
          gstn_no: "gstnNo",
          pan_no: "panNo",
          short_form: "shortForm",
          banker_name: "bankerName",
          bank_id: "bankId",
          branch_name: "branchName",
          account_no: "accountNo",
          ifsc_code: "ifscCode",
          broker_type: "brokerType",
          owner_bill_type: "ownerBillType",
          adhar_no: "adharNo",
          qty_round: "qtyRound",
        };
        const mapped: { [key: string]: string } = {};
        for (const [key, msg] of Object.entries(apiErrors)) {
          mapped[keyMap[key] || key] = String(msg);
        }
        setFieldErrors(mapped);
        scrollToFirstError();
      }
      toast.error(error?.response?.data?.message || "Failed to save broker");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof BrokerFormData, value: string) => {
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
        <title>Broker Entry | Pratik Transport</title>
        <meta name="description" content="Broker entry" />
      </Head>

      <div className="min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]">
        <div className="mx-auto flex flex-col gap-7">
          <CreatePageHeader />

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <BrokerDetailsSection {...sectionProps} />
            <TaxDetailsSection {...sectionProps} />
            <BankDetailsSection {...sectionProps} />
            <BrokerSettingsSection {...sectionProps} />
            <FormActions saving={saving} />
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(BrokerEntryPage);
