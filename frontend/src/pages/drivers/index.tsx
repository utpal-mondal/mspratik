import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import Pagination from "../../components/ui/Pagination";
import { useDebounce } from "../../hook/useDebounce";
import PageHeader from "./(component)/PageHeader";
import FilterSection from "./(component)/FilterSection";
import DriverTable from "./(component)/DriverTable";
import DeleteDriverModal from "./(component)/DeleteDriverModal";
import { DriverRecord } from "@/types/drivers/types";

const DriversPage = () => {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DriverRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);

  const getDrivers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllDrivers({
        page,
        limit,
        query: debouncedQuery || undefined,
      });
      setDrivers(res?.data?.data || []);
      setTotal(res?.data?.meta?.total || 0);
      setTotalPages(res?.data?.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDrivers();
  }, [page, limit, debouncedQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteDriver(deleteTarget.id);
      setDrivers(drivers.filter((d) => d.id !== deleteTarget.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      toast.success("Driver deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Failed to delete driver");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Drivers | Pratik Transport</title>
        <meta name="description" content="Driver list" />
      </Head>

      <main className="flex-1 p-2 md:p-3">
        <PageHeader total={total} />

        <FilterSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
        />

        <DriverTable
          drivers={drivers}
          loading={loading}
          onDelete={setDeleteTarget}
        />

        <Pagination
          currentPage={page}
          total={total}
          perPage={limit}
          onPageChange={setPage}
        />
      </main>

      <DeleteDriverModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        driverName={deleteTarget?.driver_name}
        isDeleting={deleting}
      />
    </>
  );
};

export default withAuth(DriversPage);
