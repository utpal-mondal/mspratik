import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import Pagination from "../../components/ui/Pagination";
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

  const handleResetFilters = () => {
    setSearchQuery("");
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

  return (
    <>
      <Head>
        <title>Pumps | Pratik Transport</title>
        <meta name="description" content="Pump list" />
      </Head>

      <main className="flex-1 p-3 md:p-4">
        <PageHeader total={total} />

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <FilterSection
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onReset={handleResetFilters}
          />

          <PumpTable
            pumps={pumps}
            loading={loading}
            page={page}
            limit={limit}
            onDelete={setDeleteTarget}
          />

          <Pagination
            currentPage={page}
            total={total}
            perPage={limit}
            onPageChange={setPage}
          />
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
