import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import Pagination from "../../components/ui/Pagination";
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

  return (
    <>
      <Head>
        <title>Vessal | Pratik Transport</title>
        <meta name="description" content="Vessal list" />
      </Head>

      <main className="flex-1 p-3 md:p-4">
        <PageHeader total={total} onAddVessal={() => setCreateOpen(true)} />

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <VessalList
            vessals={vessals}
            loading={loading}
            page={page}
            limit={limit}
            onEdit={setEditTarget}
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
