import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import DeleteModal from "../../components/DeleteModal";
import { useDebounce } from "../../hook/useDebounce";
import PageHeader from "./(component)/PageHeader";
import FilterSection from "./(component)/FilterSection";
import PumpTable from "./(component)/PumpTable";
import { PumpRecord } from "@/types/pumps/types";

const PumpsPage = () => {
  const [pumps, setPumps] = useState<PumpRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PumpRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);

  const getPumps = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllPumps({
        page,
        limit,
        query: debouncedQuery || undefined,
      });
      setPumps(res?.data?.data || []);
      setTotal(res?.data?.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching pumps:", error);
      toast.error("Failed to fetch pumps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPumps();
  }, [page, limit, debouncedQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deletePump(deleteTarget.id);
      setPumps(pumps.filter((p) => p.id !== deleteTarget.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      toast.success("Pump deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting pump:", error);
      toast.error("Failed to delete pump");
    } finally {
      setDeleting(false);
    }
  };

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page * limit >= total;

  const pagerBtn =
    "h-10 px-4 bg-white border border-[#D5DDE6] rounded text-[13px] font-medium transition-colors";

  return (
    <>
      <Head>
        <title>Pumps | Pratik Transport</title>
        <meta name="description" content="Pump list" />
      </Head>

      <main className="flex-1 min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]">
        <div className="mx-auto flex flex-col gap-7">
          <PageHeader total={total} />

          <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <FilterSection
              title="Pump list"
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />

            <PumpTable
              pumps={pumps}
              loading={loading}
              page={page}
              limit={limit}
              onDelete={setDeleteTarget}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-[#D5DDE6] bg-white">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {start}–{end} of {total} pumps
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={prevDisabled}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className={`${pagerBtn} ${
                    prevDisabled
                      ? "text-[#7B8896] cursor-not-allowed"
                      : "text-[#0F2A47] cursor-pointer hover:bg-[#F1F4F8]"
                  }`}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={nextDisabled}
                  onClick={() => setPage((p) => p + 1)}
                  className={`${pagerBtn} ${
                    nextDisabled
                      ? "text-[#7B8896] cursor-not-allowed"
                      : "text-[#0F2A47] cursor-pointer hover:bg-[#F1F4F8]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Pump"
        message={`Are you sure you want to delete "${deleteTarget?.pump_name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default withAuth(PumpsPage);
