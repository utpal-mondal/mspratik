import type { TripFormValues, TripVehicleLookup } from "../types";
import { TripField, TripSection, TripSelectField } from "./TripFields";

const VehicleDetails = ({
  values,
  vehicles,
  errors,
  onChange,
}: {
  values: TripFormValues;
  vehicles: TripVehicleLookup[];
  errors: Record<string, string>;
  onChange: <K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) => void;
}) => (
  <TripSection title="Enter Vehicle Details">
    <TripField
      label="RC No"
      value={values.vehicleId}
      options={vehicles}
      required={!values.vehicleNameFallback.trim()}
      onChange={(value) => {
        onChange("vehicleId", value);
        const vehicle = vehicles.find((item) => String(item.id) === value);
        onChange("wheel", vehicle?.number_of_wheels == null ? "" : String(vehicle.number_of_wheels));
        if (value) onChange("vehicleNameFallback", "");
      }}
      error={errors.vehicleId || errors.vehicleNameFallback}
    />
    <TripField label="Wheel" type="number" value={values.wheel}
      onChange={(value) => onChange("wheel", value)} />
    <TripField
      label="Enter RC name if not found in database"
      value={values.vehicleNameFallback}
      required={!values.vehicleId}
      onChange={(value) => {
        onChange("vehicleNameFallback", value);
        if (value.trim()) {
          onChange("vehicleId", "");
          onChange("wheel", "");
        }
      }}
      error={errors.vehicleId || errors.vehicleNameFallback}
    />
    <TripSelectField label="Vehicle Type" value={values.vehicleType}
      onChange={(value) => onChange("vehicleType", value)} options={["Truck", "Dumper"]} />
  </TripSection>
);

export default VehicleDetails;
