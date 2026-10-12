export interface ClientFormData {
  clientName: string;
  contactNo: string;
  emailId: string;
  contactPerson: string;
  address1: string;
  gstnNo: string;
  panNo: string;
  
}

export interface SectionProps {
  formData: ClientFormData;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  onChange: (field: keyof ClientFormData, value: string) => void;
  onClearError: (field: string) => void;
}
