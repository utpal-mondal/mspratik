export interface TripLookup {
  id: number;
  name: string;
}

export interface TripVehicleLookup extends TripLookup {
  number_of_wheels: number | null;
}

export interface TripLookups {
  products: TripLookup[];
  loading_points: TripLookup[];
  unloading_points: TripLookup[];
  vehicles: TripVehicleLookup[];
  brokers: TripLookup[];
  clients: TripLookup[];
  consignors: TripLookup[];
  firms: TripLookup[];
  vessals: TripLookup[];
  pumps: TripLookup[];
  sessions: string[];
  current_session: string;
}

export interface TripFormValues {
  grChallanNo: string;
  date: string;
  invoiceNo: string;
  billingWeighmentClient: string;
  billingWeighmentBroker: string;
  weightPort: string;
  weightGrn: string;
  weightOther: string;
  productId: string;
  loadingPointId: string;
  unloadingPointId: string;
  productConditionOnLoading: string;
  vessalId: string;
  firmId: string;
  vehicleId: string;
  vehicleNameFallback: string;
  wheel: string;
  vehicleType: string;
  brokerId: string;
  upperLimitCondition: string;
  brokerPaymentType: string;
  brokerPrice: string;
  fuelQty: string;
  fuelPrice: string;
  fuelAdvance: string;
  pumpId: string;
  cashAdvance: string;
  advanceFromClient: string;
  transportingCharges: string;
  totalAdvance: string;
  clientId: string;
  clientPrice: string;
  clientPaymentType: string;
  clientAdvance: string;
  consignorId: string;
  session: string;
}

export const initialTripForm = (date = "", session = ""): TripFormValues => ({
  grChallanNo: "",
  date: date.slice(0, 10),
  invoiceNo: "",
  billingWeighmentClient: "",
  billingWeighmentBroker: "",
  weightPort: "",
  weightGrn: "",
  weightOther: "",
  productId: "",
  loadingPointId: "",
  unloadingPointId: "",
  productConditionOnLoading: "",
  vessalId: "",
  firmId: "",
  vehicleId: "",
  vehicleNameFallback: "",
  wheel: "",
  vehicleType: "",
  brokerId: "",
  upperLimitCondition: "",
  brokerPaymentType: "Normal",
  brokerPrice: "",
  fuelQty: "",
  fuelPrice: "",
  fuelAdvance: "",
  pumpId: "",
  cashAdvance: "",
  advanceFromClient: "",
  transportingCharges: "",
  totalAdvance: "",
  clientId: "",
  clientPrice: "",
  clientPaymentType: "Normal",
  clientAdvance: "",
  consignorId: "",
  session,
});

export const sessionForDate = (date: string) => {
  if (!date) return "";
  const [yearText, monthText] = date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return "";
  const startYear = month < 4 ? year - 1 : year;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

export const validateTripForm = (values: TripFormValues) => {
  const errors: Record<string, string> = {};
  if (!values.grChallanNo.trim()) errors.grChallanNo = "GR/Challan No is required";
  if (!values.date) errors.date = "Date is required";
  if (!values.invoiceNo.trim()) errors.invoiceNo = "Invoice No is required";
  if (!values.productId) errors.productId = "Product is required";
  if (!values.loadingPointId) errors.loadingPointId = "Loading Point is required";
  if (!values.unloadingPointId) errors.unloadingPointId = "Unloading Point is required";
  if (!values.productConditionOnLoading) {
    errors.productConditionOnLoading = "Product condition is required";
  }
  if (!values.firmId) errors.firmId = "Firm is required";
  if (!values.session) errors.session = "Session is required";
  if (!values.vehicleId && !values.vehicleNameFallback.trim()) {
    errors.vehicleId = "Select an RC No or enter an RC name";
  }
  if (!values.brokerId) errors.brokerId = "Broker is required";
  if (!values.clientId) errors.clientId = "Client is required";
  if (!values.consignorId) errors.consignorId = "Consignee is required";
  return errors;
};

export const toNullableNumber = (value: string) =>
  value.trim() === "" ? null : Number(value);
