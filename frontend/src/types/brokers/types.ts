export interface BrokerRecord {
  id: number;
  broker_name: string;
  contact_no?: string;
  email_id?: string;
  contact_person?: string;
  address_1?: string;
  address_2?: string;
  address_3?: string;
  opening_balance?: string;
  previous_due?: string;
  gstn_no?: string;
  pan_no?: string;
  short_form?: string;
  banker_name?: string;
  bank_id?: number;
  branch_name?: string;
  account_no?: string;
  ifsc_code?: string;
  broker_type?: string;
  owner_bill_type?: string;
  adhar_no?: string;
  qty_round?: string;
  created_at?: string;
  updated_at?: string;
}
