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
  locationApi: string;
}

export interface CompanyRecord {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  vat_number?: string;
  address?: string;
  address_2?: string;
  post_code?: string;
  region?: string;
  city?: string;
  country?: string;
  language?: string;
  currency?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  remark?: string;
  location_api?: string;
}

export interface SectionProps {
  formData: CompanyFormData;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  onChange: (field: keyof CompanyFormData, value: string) => void;
  onClearError: (field: string) => void;
}
