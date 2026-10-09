import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import UpdatePageHeader from "../(component)/UpdatePageHeader";
import PumpDetailsSection from "../(component)/PumpDetailsSection";
import TaxDetailsSection from "../(component)/TaxDetailsSection";
import BankDetailsSection from "../(component)/BankDetailsSection";
import UpdateFormActions from "../(component)/UpdateFormActions";
import { PumpFormData } from "@/types/pump-entry/types";

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

const UpdatePumpPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<PumpFormData>(initialFormData);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      toast.error("Missing pump id");
      router.push("/pump");
      return;
    }

    const fetchPump = async () => {
      try {
        setLoading(true);
        const res = await apiService.getPump(Number(id));
        const pump = res?.data?.data || res?.data;
        if (pump) {
          setFormData({
            pumpName: pump.pump_name || "",
            contactNo: pump.contact_no || "",
            emailId: pump.email_id || "",
            contactPerson: pump.contact_person || "",
            address1: pump.address_1 || "",
            address2: pump.address_2 || "",
            address3: pump.address_3 || "",
            gstnNo: pump.gstn_no || "",
            panNo: pump.pan_no || "",
            bankerName: pump.banker_name || "",
            branchName: pump.branch_name || "",
            accountNo: pump.account_no || "",
            ifscCode: pump.ifsc_code || "",
            openingBalance:
              pump.opening_balance != null ? String(pump.opening_balance) : "",
          });
        }
      } catch (error) {
        console.error("Error fetching pump:", error);
        toast.error("Failed to fetch pump details");
        router.push("/pump");
      } finally {
        setLoading(false);
      }
    };
    fetchPump();
  }, [router.isReady, id]);

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
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setSaving(true);
      await apiService.updatePump(Number(id), {
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
      toast.success("Pump updated successfully");
      router.push("/pump");
    } catch (error: any) {
      console.error("Error updating pump:", error);
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
      }
      toast.error(error?.response?.data?.message || "Failed to update pump");
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
    `w-[27rem] px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-xs ${
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
        <title>Update Pump | Pratik Transport</title>
        <meta name="description" content="Update pump" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <UpdatePageHeader />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading pump details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                  <div className="divide-y divide-gray-200">
                    <PumpDetailsSection {...sectionProps} />
                    <TaxDetailsSection {...sectionProps} />
                  </div>
                  <div className="divide-y divide-gray-200">
                    <BankDetailsSection {...sectionProps} />
                  </div>
                </div>
              </div>
              <UpdateFormActions saving={saving} />
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(UpdatePumpPage);
