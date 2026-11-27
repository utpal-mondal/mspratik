import type { TripFormValues, TripLookup } from "../types";
import { TripDateField, TripField, TripSection, TripSelectField } from "./TripFields";

interface Props {
  values: TripFormValues;
  lookups: {
    products: TripLookup[];
    loading_points: TripLookup[];
    unloading_points: TripLookup[];
    vessals: TripLookup[];
    firms: TripLookup[];
    sessions: string[];
  };
  errors: Record<string, string>;
  onChange: <K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) => void;
}

const GRChallanDetails = ({ values, lookups, errors, onChange }: Props) => (
  <TripSection title="Enter GR/Challan Details">
    <TripField label="GR/Challan No" value={values.grChallanNo} required
      onChange={(value) => onChange("grChallanNo", value)} error={errors.grChallanNo} />
    <TripDateField label="Date" value={values.date} required
      onChange={(value) => onChange("date", value)} error={errors.date} />
    <TripField label="Invoice No" value={values.invoiceNo} required
      onChange={(value) => onChange("invoiceNo", value)} error={errors.invoiceNo} />
    <TripSelectField label="Billing Weighment (Client)" value={values.billingWeighmentClient}
      onChange={(value) => onChange("billingWeighmentClient", value)}
      options={["PORT", "GREEN", "Other"]} />
    <TripSelectField label="Billing Weighment (Broker)" value={values.billingWeighmentBroker}
      onChange={(value) => onChange("billingWeighmentBroker", value)}
      options={["PORT", "GREEN", "Other"]} />
    <TripField label="Weight (PORT)" type="number" value={values.weightPort}
      onChange={(value) => onChange("weightPort", value)} />
    <TripField label="Weight (GRN)" type="number" value={values.weightGrn}
      onChange={(value) => onChange("weightGrn", value)} />
    <TripField label="Weight (Other)" type="number" value={values.weightOther}
      onChange={(value) => onChange("weightOther", value)} />
    <TripField label="Product" value={values.productId} options={lookups.products}
      required onChange={(value) => onChange("productId", value)} error={errors.productId} />
    <TripField label="Loading Point" value={values.loadingPointId} options={lookups.loading_points}
      required onChange={(value) => onChange("loadingPointId", value)} error={errors.loadingPointId} />
    <TripField label="Unloading Point" value={values.unloadingPointId} options={lookups.unloading_points}
      required onChange={(value) => onChange("unloadingPointId", value)} error={errors.unloadingPointId} />
    <TripSelectField label="Product Condition" value={values.productConditionOnLoading}
      onChange={(value) => onChange("productConditionOnLoading", value)}
      options={["Normal", "Heavy Moisture", "Sweeping", "Water Drop"]}
      required error={errors.productConditionOnLoading} />
    <TripField label="Vessel Name" value={values.vessalId} options={lookups.vessals}
      onChange={(value) => onChange("vessalId", value)} />
    <TripField label="Firm" value={values.firmId} options={lookups.firms}
      required onChange={(value) => onChange("firmId", value)} error={errors.firmId} />
    <TripSelectField label="Session" value={values.session} options={lookups.sessions}
      required onChange={(value) => onChange("session", value)} error={errors.session} />
  </TripSection>
);

export default GRChallanDetails;
