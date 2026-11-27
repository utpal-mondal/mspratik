import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import { folioApi, tripApi, type FolioData, type TripInput } from "@/lib/api";
import BrokerDetails from "./components/BrokerDetails";
import ClientDetails from "./components/ClientDetails";
import FolioDetails from "./components/FolioDetails";
import GRChallanDetails from "./components/GRChallanDetails";
import VehicleDetails from "./components/VehicleDetails";
import {
  calculateTotalAdvance,
  initialTripForm,
  sessionForDate,
  toNullableNumber,
  validateTripForm,
  type TripFormValues,
  type TripLookups,
} from "./types";

const emptyLookups: TripLookups = {
  products: [],
  loading_points: [],
  unloading_points: [],
  vehicles: [],
  brokers: [],
  clients: [],
  consignors: [],
  firms: [],
  vessals: [],
  pumps: [],
  sessions: [],
  current_session: "",
};

const toNullableId = (value: string) => (value ? Number(value) : null);

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const LoadingEntryPage = ({ folioId }: { folioId: number }) => {
  const router = useRouter();
  const [folio, setFolio] = useState<FolioData | null>(null);
  const [lookups, setLookups] = useState<TripLookups>(emptyLookups);
  const [values, setValues] = useState<TripFormValues>(initialTripForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const loadPageData = async () => {
      try {
        setLoading(true);
        const [folioResponse, lookupsResponse] = await Promise.all([
          folioApi.getFolio(folioId),
          tripApi.getLookups(),
        ]);
        const folioData = folioResponse?.data as FolioData | undefined;
        const lookupData = lookupsResponse?.data as TripLookups | undefined;
        if (!folioData) throw new Error("Folio details were not returned");
        if (!lookupData || !Array.isArray(lookupData.products)) {
          throw new Error("Loading entry options were not returned");
        }
        if (active) {
          setFolio(folioData);
          const sessions = Array.isArray(lookupData.sessions) ? lookupData.sessions : [];
          setLookups({ ...lookupData, sessions });
          const today = getTodayDate();
          const todaySession = sessionForDate(today);
          const defaultSession = sessions.includes(todaySession)
            ? todaySession
            : lookupData.current_session || sessions[0] || todaySession;
          setValues(initialTripForm(today, defaultSession));
        }
      } catch (error) {
        console.error("Error loading entry page data:", error);
        if (active) toast.error("Failed to load loading entry details");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPageData();
    return () => {
      active = false;
    };
  }, [folioId]);

  const set = <K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateTripForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please complete the required fields");
      return;
    }

    const numericValues = [
      values.weightPort,
      values.weightGrn,
      values.weightOther,
      values.brokerPrice,
      values.fuelQty,
      values.fuelPrice,
      values.fuelAdvance,
      values.cashAdvance,
      values.advanceFromClient,
      values.transportingCharges,
      values.clientPrice,
      values.clientAdvance,
    ];
    if (numericValues.some((value) => value !== "" && !Number.isFinite(Number(value)))) {
      toast.error("Enter valid numeric values");
      return;
    }

    const trip: TripInput = {
      gr_challan_no: values.grChallanNo,
      date: values.date,
      invoice_no: values.invoiceNo,
      billing_weighment_client: values.billingWeighmentClient,
      billing_weighment_broker: values.billingWeighmentBroker,
      weight_port: toNullableNumber(values.weightPort),
      weight_grn: toNullableNumber(values.weightGrn),
      weight_other: toNullableNumber(values.weightOther),
      product_id: Number(values.productId),
      loading_point_id: Number(values.loadingPointId),
      unloading_point_id: Number(values.unloadingPointId),
      product_condition_on_loading: values.productConditionOnLoading,
      vessal_id: toNullableId(values.vessalId),
      firm_id: Number(values.firmId),
      vehicle_id: toNullableId(values.vehicleId),
      vehicle_name_fallback: values.vehicleNameFallback.trim(),
      wheel: values.wheel ? Number(values.wheel) : null,
      vehicle_type: values.vehicleType,
      broker_id: Number(values.brokerId),
      upper_limit_condition: values.upperLimitCondition,
      broker_payment_type: values.brokerPaymentType,
      broker_price: toNullableNumber(values.brokerPrice),
      fuel_qty: toNullableNumber(values.fuelQty),
      fuel_price: toNullableNumber(values.fuelPrice),
      fuel_advance: toNullableNumber(values.fuelAdvance),
      pump_id: toNullableId(values.pumpId),
      cash_advance: toNullableNumber(values.cashAdvance),
      advance_from_client: toNullableNumber(values.advanceFromClient),
      transporting_charges: toNullableNumber(values.transportingCharges),
      total_advance: toNullableNumber(calculateTotalAdvance(values)),
      client_id: Number(values.clientId),
      client_price: toNullableNumber(values.clientPrice),
      client_payment_type: values.clientPaymentType,
      client_advance: toNullableNumber(values.clientAdvance),
      consignor_id: Number(values.consignorId),
      session: values.session,
    };

    try {
      setSaving(true);
      await tripApi.createTrip(folioId, trip);
      toast.success("Loading entry saved successfully");
      await router.push("/cash-adv-folio");
    } catch (error) {
      if (axios.isAxiosError<{ errors?: Record<string, string>; message?: string }>(error)) {
        const fieldErrors = error.response?.data?.errors;
        if (fieldErrors) {
          const mappedErrors: Record<string, string> = {};
          Object.entries(fieldErrors).forEach(([key, message]) => {
            const formKey = Object.keys(values).find(
              (candidate) =>
                candidate.toLowerCase() === key.toLowerCase() ||
                candidate.toLowerCase() === key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()).toLowerCase(),
            );
            if (formKey) mappedErrors[formKey] = message;
          });
          setErrors((previous) => ({ ...previous, ...mappedErrors }));
        }
        toast.error(error.response?.data?.message || "Failed to save loading entry");
      } else {
        console.error("Error saving loading entry:", error);
        toast.error("Failed to save loading entry");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Loading Entry | Pratik Transport</title>
        <meta name="description" content="Create a loading entry for a folio" />
      </Head>
      <main className="min-h-screen bg-[#F2F5F9] px-4 pb-8 pt-6 text-[#17222E] md:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/cash-adv-folio"
                className="-ml-2 flex h-7 w-fit items-center gap-1 rounded px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4D6178] transition-colors hover:bg-[#E4EAF1]"
              >
                <ChevronLeft size={14} />
                Cash Adv. Folio
              </Link>
              <h1 className="m-0 text-2xl font-semibold leading-[1.2] text-[#0F2A47]">
                Loading Entry
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-[#5B6A7A]">
              Loading folio and entry options...
            </div>
          ) : !folio ? (
            <div className="rounded border border-[#D5DDE6] bg-white p-6 text-sm text-[#5B6A7A]">
              Folio details could not be loaded.
            </div>
          ) : (
            <>
              <FolioDetails folio={folio} />
              <GRChallanDetails values={values} lookups={lookups} errors={errors} onChange={set} />
              <VehicleDetails values={values} vehicles={lookups.vehicles} errors={errors} onChange={set} />
              <BrokerDetails
                values={values}
                brokers={lookups.brokers}
                pumps={lookups.pumps}
                errors={errors}
                onChange={set}
              />
              <ClientDetails
                values={values}
                clients={lookups.clients}
                consignors={lookups.consignors}
                errors={errors}
                onChange={set}
              />
              <div className="flex justify-end gap-3 rounded-md border border-[#D5DDE6] bg-white p-4">
                <button
                  type="button"
                  onClick={() => void router.push("/cash-adv-folio")}
                  disabled={saving}
                  className="h-10 rounded border border-[#C5CFDB] px-5 text-sm font-medium text-[#0F2A47] hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={saving}
                  className="h-10 rounded bg-[#2563EB] px-5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default LoadingEntryPage;
