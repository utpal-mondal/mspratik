import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleVehicleTypeChange = (value: string) => {
    setVehicleType(value);
    setPage(1);
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

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page * limit >= total;

  const pagerBtn =
    "h-10 px-4 bg-white border border-[#D5DDE6] rounded text-[13px] font-medium transition-colors";

  return (
    <>
      <Head>
        <title>Vehicles | Pratik Transport</title>
        <meta name="description" content="Vehicle list" />
      </Head>

      <main className="flex-1 min-h-screen bg-[#F2F5F9] px-6 py-10 md:px-8 md:py-12 text-[#17222E]">
        <div className="mx-auto flex flex-col gap-7">
          <PageHeader total={total} />

          <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
            <FilterSection
              title="Vehicle list"
              searchQuery={searchQuery}
              vehicleType={vehicleType}
              onSearchChange={handleSearchChange}
              onVehicleTypeChange={handleVehicleTypeChange}
            />

            <VehicleTable
              vehicles={vehicles}
              loading={loading}
              page={page}
              limit={limit}
              onDelete={setDeleteTarget}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-[#D5DDE6] bg-white">
              <div className="text-[13px] text-[#5B6A7A]">
                Showing {start}–{end} of {total} vehicles
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
