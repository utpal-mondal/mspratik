import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../../components/withAuth";
import apiService from "../../../../services/api";
import PageHeader from "./(component)/PageHeader";
import BrokerDetailsSection from "./(component)/BrokerDetailsSection";
import { BrokerRecord } from "@/types/brokers/types";

const BrokerViewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [broker, setBroker] = useState<BrokerRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    const fetchBroker = async () => {
      try {
        setLoading(true);
        const res = await apiService.getBroker(Number(id));
        const data = res?.data?.data || res?.data;
        if (data) {
          setBroker(data);
        } else {
          toast.error("Broker not found");
          router.push("/broker");
        }
      } catch (error) {
        console.error("Error fetching broker:", error);
        toast.error("Failed to fetch broker details");
        router.push("/broker");
      } finally {
        setLoading(false);
      }
    };
    fetchBroker();
  }, [router.isReady, id]);

  return (
    <>
      <Head>
        <title>
          {broker?.broker_name ? `${broker.broker_name} | ` : ""}Broker Details | Pratik Transport
        </title>
        <meta name="description" content="Broker details" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <PageHeader brokerName={broker?.broker_name} brokerId={broker?.id} />

          {loading ? (
            <div className="bg-white flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading broker details...</p>
            </div>
          ) : (
            broker && <BrokerDetailsSection broker={broker} />
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(BrokerViewPage);
