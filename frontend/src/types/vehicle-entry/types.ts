export interface VehicleFormData {
  vehicleNumber: string;
  ownerName: string;
  ownerPhone: string;
  vehicleType: string;
  numberOfWheels: string;
  registrationExpiryDate: string;
  rcNumber: string;
  permitNumber: string;
  insuranceNumber: string;
  pucNumber: string;
  vehicleImage: File | null;
  rcBookImage: File | null;
}

export interface SectionProps {
  formData: VehicleFormData;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  onChange: (field: keyof VehicleFormData, value: string) => void;
  onFileChange: (field: "vehicleImage" | "rcBookImage", file: File | null) => void;
  onClearError: (field: string) => void;
}
