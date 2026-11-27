import { calculateTotalAdvance, type TripFormValues, type TripLookup } from "../types";
import { TripField, TripSection, TripSelectField } from "./TripFields";

const BrokerDetails = ({
  values,
  brokers,
  pumps,
  errors,
  onChange,
}: {
  values: TripFormValues;
  brokers: TripLookup[];
  pumps: TripLookup[];
  errors: Record<string, string>;
  onChange: <K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) => void;
}) => (
  <TripSection title="Enter Broker Details">
    <TripField label="Broker Name" value={values.brokerId} options={brokers}
      required onChange={(value) => onChange("brokerId", value)} error={errors.brokerId} />
    <TripField label="Upper Limit Condition" value={values.upperLimitCondition}
      onChange={(value) => onChange("upperLimitCondition", value)} />
    <TripSelectField label="Broker Payment Type" value={values.brokerPaymentType}
      onChange={(value) => onChange("brokerPaymentType", value)}
      options={["Normal", "Under Loading", "Fixed"]} />
    <TripField label="Broker Price" type="number" value={values.brokerPrice}
      onChange={(value) => onChange("brokerPrice", value)} />
    <TripField label="Fuel Qty" type="number" value={values.fuelQty}
      onChange={(value) => onChange("fuelQty", value)} />
    <TripField label="Fuel Price" type="number" value={values.fuelPrice}
      onChange={(value) => onChange("fuelPrice", value)} />
    <TripField label="Fuel Advance" type="number" value={values.fuelAdvance}
      onChange={(value) => onChange("fuelAdvance", value)} />
    <TripField label="Pump Name" value={values.pumpId} options={pumps}
      onChange={(value) => onChange("pumpId", value)} />
    <TripField label="Cash Advance" type="number" value={values.cashAdvance}
      onChange={(value) => onChange("cashAdvance", value)} />
    <TripField label="Adv From Client" type="number" value={values.advanceFromClient}
      onChange={(value) => onChange("advanceFromClient", value)} />
    <TripField label="Transporting Charges" type="number" value={values.transportingCharges}
      onChange={(value) => onChange("transportingCharges", value)} />
    <TripField label="Total Advance" type="number" value={calculateTotalAdvance(values)} disabled />
  </TripSection>
);

export default BrokerDetails;
