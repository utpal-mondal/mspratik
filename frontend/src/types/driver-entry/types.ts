export interface DriverFormData {
  driverName: string;
  phoneNumber: string;
  experienceYears: string;
  driverPhoto: File | null;
  licenceImage: File | null;
}

export interface SectionProps {
  formData: DriverFormData;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  onChange: (field: keyof DriverFormData, value: string) => void;
  onFileChange: (field: "driverPhoto" | "licenceImage", file: File | null) => void;
  onClearError: (field: string) => void;
  stacked?: boolean;
}
