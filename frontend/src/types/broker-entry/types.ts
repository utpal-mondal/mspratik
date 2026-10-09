export interface BrokerFormData {
  brokerName: string;
  contactNo: string;
  emailId: string;
  contactPerson: string;
  address1: string;
  address2: string;
  address3: string;
  openingBalance: string;
  gstnNo: string;
  panNo: string;
  shortForm: string;
  bankerName: string;
  bankId: string;
  branchName: string;
  accountNo: string;
  ifscCode: string;
  brokerType: string;
  ownerBillType: string;
  adharNo: string;
  qtyRound: string;
}

export interface SectionProps {
  formData: BrokerFormData;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  onChange: (field: keyof BrokerFormData, value: string) => void;
  onClearError: (field: string) => void;
}
