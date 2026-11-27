import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import { folioApi, type FolioData } from "../../../lib/api";

const formatINR = (value: number | null) =>
  value == null
    ? "-"
    : value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const formatDisplayDate = (value: string) => {
  const dateOnly = value.slice(0, 10);
  const date = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const FolioDetail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <h2 className="text-sm font-bold text-[#3B4957]">{label}</h2>
    <p className="mt-1 whitespace-pre-wrap text-[14px] text-[#17222E]">{value}</p>
  </div>
);

const FolioViewPage = () => {
  const router = useRouter();
  const [folio, setFolio] = useState<FolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    const rawId = router.query.id;
    const folioId = typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(folioId) || folioId <= 0) {
      toast.error("Folio ID is required");
      void router.replace("/cash-adv-folio");
      return;
    }

    let active = true;
    const fetchFolio = async () => {
      try {
        setLoading(true);
        const response = await folioApi.getFolio(folioId);
        const folioData = response?.data as FolioData | undefined;
        if (!folioData) throw new Error("Folio details were not returned");
        if (active) setFolio(folioData);
      } catch (error) {
        console.error("Error fetching folio:", error);
        if (active) {
          toast.error("Failed to fetch folio details");
          void router.push("/cash-adv-folio");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchFolio();
    return () => {
      active = false;
    };
  }, [router.isReady, router.query.id]);

  return (
    <>
      <Head>
        <title>View Folio | Pratik Transport</title>
        <meta name="description" content="View folio details" />
      </Head>
      <main className="min-h-screen bg-[#F2F5F9] px-6 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Link
              href="/cash-adv-folio"
              className="-ml-2 flex h-7 w-fit items-center gap-1 self-start rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1]"
            >
              <ChevronLeft size={14} />
              Cash Adv. Folio
            </Link>
            <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
              View Folio
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#5B6A7A]">Loading folio details...</p>
            </div>
          ) : folio ? (
            <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
              <div className="grid gap-5 px-5 py-4 sm:grid-cols-2">
                <FolioDetail label="Folio No" value={folio.folio_no} />
                <FolioDetail label="Folio Date" value={formatDisplayDate(folio.date)} />
                <FolioDetail label="Branch" value={folio.branch.name} />
                <FolioDetail label="Folio Type" value={folio.folio_type} />
                <FolioDetail label="Amount" value={formatINR(folio.amount)} />
                <FolioDetail label="Bank Amount" value={formatINR(folio.bank_payment)} />
                <FolioDetail label="Remark" value={folio.remark || "-"} />
                <FolioDetail label="No Of Trips" value="0" />
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
};

export default withAuth(FolioViewPage);
