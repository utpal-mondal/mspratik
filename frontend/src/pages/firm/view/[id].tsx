import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import AccessDenied from "../../../components/AccessDenied";
import usePermission from "../../../hook/usePermission";
import apiService, { type FirmRecord } from "../../../services/api";
import FirmDetailsSection from "../(component)/FirmDetailsSection";

const FirmViewPage = () => {
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
        <title>View Firm | Pratik Transport</title>
        <meta name="description" content="Firm details" />
      </Head>
      <main className="min-h-screen bg-[#F2F5F9] px-6 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/firm"
                className="-ml-2 flex h-7 w-fit items-center gap-1 self-start rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1]"
              >
                <ChevronLeft size={14} />
                Firms
              </Link>
              <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
                View Firm
              </h1>
            </div>
            {firm && (
              <button
                type="button"
                onClick={() => void router.push(`/firm/update?id=${firm.id}`)}
                className="inline-flex items-center gap-1.5 rounded bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#5B6A7A]">Loading firm details...</p>
            </div>
          ) : firm ? (
            <FirmDetailsSection firm={firm} />
          ) : null}
        </div>
      </main>
    </>
  );
};

export default withAuth(FirmViewPage);
