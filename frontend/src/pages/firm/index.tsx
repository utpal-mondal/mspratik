import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Search, X } from "lucide-react";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import AccessDenied from "../../components/AccessDenied";
import usePermission from "../../hook/usePermission";
import { useDebounce } from "../../hook/useDebounce";
import apiService, { type FirmRecord } from "../../services/api";
import PageHeader from "./(component)/PageHeader";
import FirmTable from "./(component)/FirmTable";
import DeleteFirmModal from "./(component)/DeleteFirmModal";

const FirmListPage = () => {
  const router = useRouter();
  const { isCadmin } = usePermission();
  const [firms, setFirms] = useState<FirmRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<FirmRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requestId = useRef(0);
  const limit = 10;
  const debouncedQuery = useDebounce(searchQuery, 400);

  const getFirms = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    try {
      setLoading(true);
      const response = await apiService.getAllFirms(debouncedQuery);
      const rows = response?.data?.data;
      if (!Array.isArray(rows)) throw new Error("Firm list was not returned");
      if (currentRequestId === requestId.current) {
        setFirms(rows);
      }
    } catch (error) {
      if (currentRequestId === requestId.current) {
        console.error("Error fetching firms:", error);
        toast.error("Failed to fetch firms");
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, [debouncedQuery]);

  useEffect(() => {
    void getFirms();
    return () => {
      requestId.current += 1;
    };
  }, [getFirms]);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(firms.length / limit));
    if (page > lastPage) setPage(lastPage);
  }, [firms.length, page]);

  const pageFirms = firms.slice((page - 1) * limit, page * limit);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteFirm(deleteTarget.id);
      setFirms((current) => current.filter((firm) => firm.id !== deleteTarget.id));
      toast.success("Firm deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting firm:", error);
      toast.error("Failed to delete firm");
    } finally {
      setDeleting(false);
    }
  };

  const total = firms.length;
  const totalPages = Math.ceil(total / limit);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  const pagerButton =
    "h-10 rounded border border-[#D5DDE6] bg-white px-4 text-[13px] font-medium transition-colors";

  if (!isCadmin()) return <AccessDenied />;

  return (
    <>
      <Head>
        <title>Firms | Pratik Transport</title>
        <meta name="description" content="Firm list" />
      </Head>
      <main className="min-h-screen flex-1 bg-[#F2F5F9] px-6 py-10 text-[#17222E] md:px-8 md:py-12">
        <div className="mx-auto flex flex-col gap-7">
          <PageHeader total={total} onAdd={() => void router.push("/firm/create")} />
          <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5DDE6] px-6 py-4">
              <h2 className="text-base font-semibold text-[#0F2A47]">Firm list</h2>
              <div className="relative w-full max-w-[260px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search firms..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full rounded border border-[#C5CFDB] bg-white pl-9 pr-8 text-[13px] text-[#17222E] placeholder-[#7B8896] focus:border-[#0F2A47] focus:outline-none focus:ring-2 focus:ring-[#0F2A47]/20"
                />
                {searchQuery !== "" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#7B8896] transition-colors hover:text-[#3B4957]"
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <FirmTable
              firms={pageFirms}
              loading={loading}
              page={page}
              limit={limit}
              onView={(firmId) => void router.push(`/firm/view/${firmId}`)}
              onEdit={(firmId) => void router.push(`/firm/update?id=${firmId}`)}
              onDelete={setDeleteTarget}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D5DDE6] bg-white px-6 py-3.5">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {start}–{end} of {total} firms
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={prevDisabled}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  className={`${pagerButton} ${
                    prevDisabled
                      ? "cursor-not-allowed text-[#7B8896]"
                      : "cursor-pointer text-[#0F2A47] hover:bg-[#F1F4F8]"
                  }`}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={nextDisabled}
                  onClick={() => setPage((current) => current + 1)}
                  className={`${pagerButton} ${
                    nextDisabled
                      ? "cursor-not-allowed text-[#7B8896]"
                      : "cursor-pointer text-[#0F2A47] hover:bg-[#F1F4F8]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <DeleteFirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        firmName={deleteTarget?.name}
        isDeleting={deleting}
      />
    </>
  );
};

export default withAuth(FirmListPage);
