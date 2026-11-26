import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import AccessDenied from "../../../components/AccessDenied";
import usePermission from "../../../hook/usePermission";
import { branchApi, type BranchInput, type BranchTextField } from "../../../lib/api";
import useBranchGeocode from "../../../hook/useBranchGeocode";
import UpdatePageHeader from "../(component)/UpdatePageHeader";
import BranchInfoSection from "../(component)/BranchInfoSection";
import FormActions from "../(component)/FormActions";

const emptyBranch: BranchInput = {
  name: "",
  head: "",
  address: "",
  phone_number: "",
  email: "",
  latitude: null,
  longitude: null,
};

const BranchUpdatePage = () => {
  const router = useRouter();
  const { isCadmin } = usePermission();
  const [branchId, setBranchId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BranchInput>({ ...emptyBranch });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { lookup, cancel, clear, status, message } = useBranchGeocode();

  useEffect(() => {
    if (!router.isReady) return;
    const rawId = router.query.id;
    const id = typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(id) || id <= 0) {
      toast.error("Branch ID is required");
      void router.replace("/branches");
      return;
    }

    let active = true;
    const fetchBranch = async () => {
      try {
        setLoading(true);
        const response = await branchApi.getBranch(id);
        const branch = response?.data;
        if (!branch) throw new Error("Branch details were not returned");
        if (active) {
          setBranchId(id);
          setFormData({
            name: branch.name || "",
            head: branch.head || "",
            address: branch.address || "",
            phone_number: branch.phone_number || "",
            email: branch.email || "",
            latitude: branch.latitude ?? null,
            longitude: branch.longitude ?? null,
          });
        }
      } catch (error) {
        console.error("Error fetching branch:", error);
        if (active) {
          toast.error("Failed to fetch branch details");
          void router.push("/branches");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchBranch();
    return () => {
      active = false;
    };
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    const address = formData.address.trim();
    if (!address || (formData.latitude != null && formData.longitude != null)) return;

    const timeout = window.setTimeout(() => {
      void lookup(address).then((coordinates) => {
        if (!coordinates) return;
        setFormData((previous) =>
          previous.address.trim() === address
            ? { ...previous, ...coordinates }
            : previous,
        );
      });
    }, 750);

    return () => {
      window.clearTimeout(timeout);
      cancel();
    };
  }, [formData.address, formData.latitude, formData.longitude, lookup, cancel]);

  const handleChange = (field: BranchTextField, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "address" ? { latitude: null, longitude: null } : {}),
    }));
    setFieldErrors((previous) => ({ ...previous, [field]: "" }));
    if (field === "address") clear();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Branch name is required";
    if (!formData.head.trim()) errors.head = "Branch head is required";
    if (!formData.address.trim()) errors.address = "Branch address is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill the required fields");
      return;
    }
    if (branchId == null) {
      toast.error("Branch ID is missing");
      return;
    }

    try {
      setSaving(true);
      await branchApi.updateBranch(branchId, {
        ...formData,
        name: formData.name.trim(),
        head: formData.head.trim(),
        address: formData.address.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
      });
      toast.success("Branch updated successfully");
      void router.push("/branches");
    } catch (error) {
      console.error("Error updating branch:", error);
      if (axios.isAxiosError<{ errors?: Record<string, string>; message?: string }>(error)) {
        if (error.response?.data?.errors) {
          setFieldErrors(error.response.data.errors);
        }
        toast.error(error.response?.data?.message || "Failed to update branch");
      } else {
        toast.error("Failed to update branch");
      }
    } finally {
      setSaving(false);
    }
  };

  const waitingForCoordinates =
    formData.address.trim() !== "" &&
    (formData.latitude == null || formData.longitude == null) &&
    status === "idle";

  if (!isCadmin()) return <AccessDenied />;

  return (
    <>
      <Head>
        <title>Update Branch | Pratik Transport</title>
        <meta name="description" content="Update branch details" />
      </Head>
      <main className="min-h-screen bg-[#F2F5F9] px-6 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#5B6A7A]">Loading branch details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <UpdatePageHeader />
              <BranchInfoSection
                formData={formData}
                fieldErrors={fieldErrors}
                onChange={handleChange}
                geocodeStatus={status}
                geocodeMessage={message}
              />
              <FormActions
                saving={saving}
                busy={status === "loading" || waitingForCoordinates}
                secondaryLabel="Cancel"
                submitLabel="Update Branch"
                onSecondary={() => void router.push("/branches")}
              />
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default withAuth(BranchUpdatePage);
