import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import UpdatePageHeader from "../(component)/UpdatePageHeader";
import ClientDetailsSection from "../(component)/ClientDetailsSection";
import TaxDetailsSection from "../(component)/TaxDetailsSection";
import UpdateFormActions from "../(component)/UpdateFormActions";
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

const UpdateClientPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      toast.error("Missing client id");
      router.push("/client");
      return;
    }

    const fetchClient = async () => {
      try {
        setLoading(true);
        const res = await apiService.getClient(Number(id));
        const client = res?.data?.data || res?.data;
        if (client) {
          setFormData({
            clientName: client.client_name || "",
            contactNo: client.contact_no || "",
            emailId: client.email_id || "",
            contactPerson: client.contact_person || "",
            address1: client.address_1 || "",
            gstnNo: client.gstn_no || "",
            panNo: client.pan_no || "",
          });
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast.error("Failed to fetch client details");
        router.push("/client");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [router.isReady, id]);

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
      await apiService.updateClient(Number(id), {
        client_name: formData.clientName.trim(),
        contact_no: formData.contactNo,
        email_id: formData.emailId,
        contact_person: formData.contactPerson,
        address_1: formData.address1,
        gstn_no: formData.gstnNo,
        pan_no: formData.panNo,
      });
      toast.success("Client updated successfully");
      router.push("/client");
    } catch (error: any) {
      console.error("Error updating client:", error);
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
      toast.error(error?.response?.data?.message || "Failed to update client");
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
        <title>Update Client | Pratik Transport</title>
        <meta name="description" content="Update client" />
      
      </Head>

      <div
        className="min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]"
      
      >
        <div className="mx-auto flex flex-col gap-7">
          <UpdatePageHeader />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-[#5B6A7A]">Loading client details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)] divide-y divide-[#D5DDE6]">
                <ClientDetailsSection {...sectionProps} />
                <TaxDetailsSection {...sectionProps} />
              </div>
              <UpdateFormActions saving={saving} />
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(UpdateClientPage);
