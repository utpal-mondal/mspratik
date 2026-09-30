import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../../components/withAuth";
import apiService from "../../../../services/api";
import PageHeader from "./(component)/PageHeader";
import VehicleDetailsSection from "./(component)/VehicleDetailsSection";
import { VehicleRecord } from "@/types/vehicles/types";

const VehicleViewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const res = await apiService.getVehicle(Number(id));
        const data = res?.data?.data || res?.data;
        if (data) {
          setVehicle(data);
        } else {
          toast.error("Vehicle not found");
          router.push("/vehicles");
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        toast.error("Failed to fetch vehicle details");
        router.push("/vehicles");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [router.isReady, id]);

  return (
    <>
      <Head>
        <title>
          {vehicle?.vehicle_number ? `${vehicle.vehicle_number} | ` : ""}Vehicle Details | Pratik Transport
        </title>
        <meta name="description" content="Vehicle details" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <PageHeader vehicleNumber={vehicle?.vehicle_number} vehicleId={vehicle?.id} />

          {loading ? (
            <div className="bg-white flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading vehicle details...</p>
            </div>
          ) : (
            vehicle && <VehicleDetailsSection vehicle={vehicle} />
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(VehicleViewPage);
