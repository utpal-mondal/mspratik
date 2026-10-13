import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import DeleteModal from "../../components/DeleteModal";
import PageHeader from "./(component)/PageHeader";
import VessalList, { VessalItem } from "./(component)/VessalList";
import CreateVessalDrawer from "./(component)/CreateVessalDrawer";
import EditVessalDrawer from "./(component)/EditVessalDrawer";

const VessalPage = () => {
  const [vessals, setVessals] = useState<VessalItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VessalItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VessalItem | null>(null);

  const getVessals = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllVessals({ page, limit });
      setVessals(res?.data?.data || []);
      setTotal(res?.data?.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching vessals:", error);
      toast.error("Failed to fetch vessals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVessals();
  }, [page, limit]);

  const handleVessalCreated = () => {
    setCreateOpen(false);
    if (page === 1) {
      getVessals();
    } else {
      setPage(1);
    }
  };

  const handleVessalUpdated = () => {
    setEditTarget(null);
    getVessals();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteVessal(deleteTarget.id);
      setVessals(vessals.filter((v) => v.id !== deleteTarget.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      toast.success("Vessal deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting vessal:", error);
      toast.error("Failed to delete vessal");
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
        <title>Vessal | Pratik Transport</title>
        <meta name="description" content="Vessal list" />
      </Head>

      <main className="flex-1 min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]">
        <div className="mx-auto flex flex-col gap-7">
          <PageHeader total={total} onAddVessal={() => setCreateOpen(true)} />

          <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#D5DDE6]">
              <div className="text-base font-semibold text-[#0F2A47]">Vessal list</div>
            </div>

            <VessalList
              vessals={vessals}
              loading={loading}
              page={page}
              limit={limit}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-[#D5DDE6] bg-white">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {start}–{end} of {total} vessals
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

      <CreateVessalDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleVessalCreated}
      />

      <EditVessalDrawer
        vessal={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={handleVessalUpdated}
      />

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Vessal"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default withAuth(VessalPage);
