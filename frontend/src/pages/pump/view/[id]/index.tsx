import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../../components/withAuth";
import apiService from "../../../../services/api";
import PageHeader from "./(component)/PageHeader";
import PumpDetailsSection from "./(component)/PumpDetailsSection";
import { PumpRecord } from "@/types/pumps/types";

const PumpViewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [pump, setPump] = useState<PumpRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    const fetchPump = async () => {
      try {
        setLoading(true);
        const res = await apiService.getPump(Number(id));
        const data = res?.data?.data || res?.data;
        if (data) {
          setPump(data);
        } else {
          toast.error("Pump not found");
          router.push("/pump");
        }
      } catch (error) {
        console.error("Error fetching pump:", error);
        toast.error("Failed to fetch pump details");
        router.push("/pump");
      } finally {
        setLoading(false);
      }
    };
    fetchPump();
  }, [router.isReady, id]);

  return (
    <>
      <Head>
        <title>
          {pump?.pump_name ? `${pump.pump_name} | ` : ""}Pump Details | Pratik Transport
        </title>
        <meta name="description" content="Pump details" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <PageHeader pumpName={pump?.pump_name} pumpId={pump?.id} />

          {loading ? (
            <div className="bg-white flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading pump details...</p>
            </div>
          ) : (
            pump && <PumpDetailsSection pump={pump} />
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(PumpViewPage);
