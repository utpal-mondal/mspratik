import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import Pagination from "../../components/ui/Pagination";
import { useDebounce } from "../../hook/useDebounce";
import PageHeader from "./(component)/PageHeader";
import FilterSection from "./(component)/FilterSection";
import VehicleTable from "./(component)/VehicleTable";
import DeleteVehicleModal from "./(component)/DeleteVehicleModal";
import { VehicleRecord } from "@/types/vehicles/types";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VehicleRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);

  const getVehicles = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllVehicles({
        page,
        limit,
        query: debouncedQuery || undefined,
        vehicle_type: vehicleType || undefined,
      });
      setVehicles(res?.data?.data || []);
      setTotal(res?.data?.meta?.total || 0);
      setTotalPages(res?.data?.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVehicles();
  }, [page, limit, debouncedQuery, vehicleType]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, vehicleType]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setVehicleType("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteVehicle(deleteTarget.id);
      setVehicles(vehicles.filter((v) => v.id !== deleteTarget.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      toast.success("Vehicle deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vehicles | Pratik Transport</title>
        <meta name="description" content="Vehicle list" />
      </Head>

      <main className="flex-1 p-3 md:p-4">
        <PageHeader total={total} />

        <FilterSection
          searchQuery={searchQuery}
          vehicleType={vehicleType}
          onSearchChange={setSearchQuery}
          onVehicleTypeChange={setVehicleType}
          onReset={handleResetFilters}
        />

        <VehicleTable
          vehicles={vehicles}
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

      <DeleteVehicleModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        vehicleNumber={deleteTarget?.vehicle_number}
        isDeleting={deleting}
      />
    </>
  );
};

export default withAuth(VehiclesPage);
