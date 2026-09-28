export interface CompanyFormData {
  name: string;
  email: string;
  phoneNumber: string;
  vatNumber: string;
  address: string;
  address2: string;
  postCode: string;
  region: string;
  city: string;
  country: string;
  language: string;
  currency: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  remark: string;
}

export interface SectionProps {
  formData: CompanyFormData;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  onChange: (field: keyof CompanyFormData, value: string) => void;
  onClearError: (field: string) => void;
}
