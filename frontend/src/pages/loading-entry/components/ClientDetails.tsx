import type { TripFormValues, TripLookup } from "../types";
import { TripField, TripSection, TripSelectField } from "./TripFields";

const ClientDetails = ({
  values,
  clients,
  consignors,
  errors,
  onChange,
}: {
  values: TripFormValues;
  clients: TripLookup[];
  consignors: TripLookup[];
  errors: Record<string, string>;
  onChange: <K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) => void;
}) => (
  <TripSection title="Enter Client Details">
    <TripField label="Client Name" value={values.clientId} options={clients}
      required onChange={(value) => onChange("clientId", value)} error={errors.clientId} />
    <TripField label="Client Price" type="number" value={values.clientPrice}
      onChange={(value) => onChange("clientPrice", value)} />
    <TripSelectField label="Client Payment Type" value={values.clientPaymentType}
      onChange={(value) => onChange("clientPaymentType", value)} options={["Normal", "Fixed"]} />
    <TripField label="Client Advance" type="number" value={values.clientAdvance}
      onChange={(value) => onChange("clientAdvance", value)} />
    <TripField label="Consignee Name" value={values.consignorId} options={consignors}
      required onChange={(value) => onChange("consignorId", value)} error={errors.consignorId} />
  </TripSection>
);

export default ClientDetails;
