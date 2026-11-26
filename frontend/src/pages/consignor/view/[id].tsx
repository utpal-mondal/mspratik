import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import AccessDenied from "../../../components/AccessDenied";
import usePermission from "../../../hook/usePermission";
import apiService, { type ConsignorRecord } from "../../../services/api";
import ConsignorDetailsSection from "../(component)/ConsignorDetailsSection";
import ConsignorFormDrawer from "../(component)/ConsignorFormDrawer";

const ConsignorViewPage = () => {
  const router = useRouter();
  const { isCadmin } = usePermission();
  const [consignor, setConsignor] = useState<ConsignorRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const rawId = router.query.id;
    const consignorId = typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(consignorId) || consignorId <= 0) {
      toast.error("Consignor ID is required");
      void router.replace("/consignor");
      return;
    }

    let active = true;
    const fetchConsignor = async () => {
      try {
        setLoading(true);
        const response = await apiService.getConsignor(consignorId);
        const record = response?.data?.data as ConsignorRecord | undefined;
        if (!record) throw new Error("Consignor details were not returned");
        if (active) setConsignor(record);
      } catch (error) {
        console.error("Error fetching consignor:", error);
        if (active) {
          toast.error("Failed to fetch consignor details");
          void router.push("/consignor");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchConsignor();
    return () => {
      active = false;
    };
  }, [router.isReady, router.query.id]);

  const handleSaved = async () => {
    setEditOpen(false);
    if (!consignor) return;
    try {
      const response = await apiService.getConsignor(consignor.id);
      const updatedConsignor = response?.data?.data as ConsignorRecord | undefined;
      if (!updatedConsignor) {
        throw new Error("Updated consignor details were not returned");
      }
      setConsignor(updatedConsignor);
    } catch (error) {
      console.error("Error refreshing consignor details:", error);
      toast.error("Consignor saved, but failed to refresh its details");
    }
  };

  if (!isCadmin()) return <AccessDenied />;

  return (
    <>
      <Head>
        <title>View Consignor | Pratik Transport</title>
        <meta name="description" content="Consignor details" />
      </Head>
      <main className="min-h-screen bg-[#F2F5F9] px-6 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/consignor"
                className="-ml-2 flex h-7 w-fit items-center gap-1 self-start rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1]"
              >
                <ChevronLeft size={14} />
                Consignors
              </Link>
              <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
                View Consignor
              </h1>
            </div>
            {consignor && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#5B6A7A]">Loading consignor details...</p>
            </div>
          ) : consignor ? (
            <ConsignorDetailsSection consignor={consignor} />
          ) : null}
        </div>
      </main>
      <ConsignorFormDrawer
        isOpen={editOpen}
        consignor={consignor}
        onClose={() => setEditOpen(false)}
        onSaved={() => void handleSaved()}
      />
    </>
  );
};

export default withAuth(ConsignorViewPage);
