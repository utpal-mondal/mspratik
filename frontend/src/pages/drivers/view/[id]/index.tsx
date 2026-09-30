import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../../components/withAuth";
import apiService from "../../../../services/api";
import PageHeader from "./(component)/PageHeader";
import DriverDetailsSection from "./(component)/DriverDetailsSection";
import { DriverRecord } from "@/types/drivers/types";

const DriverViewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    const fetchDriver = async () => {
      try {
        setLoading(true);
        const res = await apiService.getDriver(Number(id));
        const data = res?.data?.data || res?.data;
        if (data) {
          setDriver(data);
        } else {
          toast.error("Driver not found");
          router.push("/drivers");
        }
      } catch (error) {
        console.error("Error fetching driver:", error);
        toast.error("Failed to fetch driver details");
        router.push("/drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [router.isReady, id]);

  return (
    <>
      <Head>
        <title>
          {driver?.driver_name ? `${driver.driver_name} | ` : ""}Driver Details | Pratik Transport
        </title>
        <meta name="description" content="Driver details" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <PageHeader driverName={driver?.driver_name} driverId={driver?.id} />

          {loading ? (
            <div className="bg-white flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading driver details...</p>
            </div>
          ) : (
            driver && <DriverDetailsSection driver={driver} />
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(DriverViewPage);
