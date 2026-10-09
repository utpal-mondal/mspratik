export interface PumpFormData {
  pumpName: string;
  contactNo: string;
  emailId: string;
  contactPerson: string;
  address1: string;
  address2: string;
  address3: string;
  gstnNo: string;
  panNo: string;
  bankerName: string;
  branchName: string;
  accountNo: string;
  ifscCode: string;
  openingBalance: string;
}

export interface SectionProps {
  formData: PumpFormData;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  onChange: (field: keyof PumpFormData, value: string) => void;
  onClearError: (field: string) => void;
}
