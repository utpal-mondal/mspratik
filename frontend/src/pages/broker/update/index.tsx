import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import UpdatePageHeader from "../(component)/UpdatePageHeader";
import BrokerDetailsSection from "../(component)/BrokerDetailsSection";
import TaxDetailsSection from "../(component)/TaxDetailsSection";
import BankDetailsSection from "../(component)/BankDetailsSection";
import BrokerSettingsSection from "../(component)/BrokerSettingsSection";
import UpdateFormActions from "../(component)/UpdateFormActions";
import { BrokerFormData } from "@/types/broker-entry/types";

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

const UpdateBrokerPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<BrokerFormData>(initialFormData);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      toast.error("Missing broker id");
      router.push("/broker");
      return;
    }

    const fetchBroker = async () => {
      try {
        setLoading(true);
        const res = await apiService.getBroker(Number(id));
        const broker = res?.data?.data || res?.data;
        if (broker) {
          setFormData({
            brokerName: broker.broker_name || "",
            contactNo: broker.contact_no || "",
            emailId: broker.email_id || "",
            contactPerson: broker.contact_person || "",
            address1: broker.address_1 || "",
            address2: broker.address_2 || "",
            address3: broker.address_3 || "",
            openingBalance:
              broker.opening_balance != null ? String(broker.opening_balance) : "",
            gstnNo: broker.gstn_no || "",
            panNo: broker.pan_no || "",
            shortForm: broker.short_form || "",
            bankerName: broker.banker_name || "",
            bankId: broker.bank_id != null ? String(broker.bank_id) : "",
            branchName: broker.branch_name || "",
            accountNo: broker.account_no || "",
            ifscCode: broker.ifsc_code || "",
            brokerType: broker.broker_type || "normal",
            ownerBillType: broker.owner_bill_type || "normal",
            adharNo: broker.adhar_no || "",
            qtyRound: broker.qty_round || "not_applicable",
          });
        }
      } catch (error) {
        console.error("Error fetching broker:", error);
        toast.error("Failed to fetch broker details");
        router.push("/broker");
      } finally {
        setLoading(false);
      }
    };
    fetchBroker();
  }, [router.isReady, id]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // if (!formData.brokerName.trim()) {
    //   errors.brokerName = "Broker name is required";
    // } else if (formData.brokerName.trim().length < 2) {
    //   errors.brokerName = "Broker name must be at least 2 characters";
    // } else if (formData.brokerName.length > 50) {
    //   errors.brokerName = "Broker name must be less than 50 characters";
    // }

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
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setSaving(true);
      await apiService.updateBroker(Number(id), {
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
      toast.success("Broker updated successfully");
      router.push("/broker");
    } catch (error: any) {
      console.error("Error updating broker:", error);
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
      }
      toast.error(error?.response?.data?.message || "Failed to update broker");
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
        <title>Update Broker | Pratik Transport</title>
        <meta name="description" content="Update broker" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <UpdatePageHeader />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading broker details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                  <div className="divide-y divide-gray-200">
                    <BrokerDetailsSection {...sectionProps} />
                    <TaxDetailsSection {...sectionProps} />
                  </div>
                  <div className="divide-y divide-gray-200">
                    <BankDetailsSection {...sectionProps} />
                    <BrokerSettingsSection {...sectionProps} />
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

export default withAuth(UpdateBrokerPage);
