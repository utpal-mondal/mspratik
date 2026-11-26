import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import AccessDenied from "../../../components/AccessDenied";
import usePermission from "../../../hook/usePermission";
import apiService, { type FirmRecord } from "../../../services/api";
import FirmForm from "../(component)/FirmForm";

const UpdateFirmPage = () => {
  const router = useRouter();
  const { isCadmin } = usePermission();
  const [firm, setFirm] = useState<FirmRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    const rawId = router.query.id;
    const firmId = typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(firmId) || firmId <= 0) {
      toast.error("Firm ID is required");
      void router.replace("/firm");
      return;
    }

    let active = true;
    const fetchFirm = async () => {
      try {
        setLoading(true);
        const response = await apiService.getFirm(firmId);
        const record = response?.data?.data as FirmRecord | undefined;
        if (!record) throw new Error("Firm details were not returned");
        if (active) setFirm(record);
      } catch (error) {
        console.error("Error fetching firm:", error);
        if (active) {
          toast.error("Failed to fetch firm details");
          void router.push("/firm");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchFirm();
    return () => {
      active = false;
    };
  }, [router.isReady, router.query.id]);

  if (!isCadmin()) return <AccessDenied />;

  return (
    <>
      <Head>
        <title>Update Firm | Pratik Transport</title>
        <meta name="description" content="Update firm details" />
      </Head>
      <main className="min-h-screen bg-[#F2F5F9] px-6 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#5B6A7A]">Loading firm details...</p>
            </div>
          ) : firm ? (
            <FirmForm
              key={firm.id}
              mode="edit"
              firm={firm}
              onCancel={() => void router.push("/firm")}
              onSaved={() => void router.push("/firm")}
            />
          ) : null}
        </div>
      </main>
    </>
  );
};

export default withAuth(UpdateFirmPage);
