export interface VehicleRecord {
  id: number;
  vehicle_number: string;
  owner_name: string;
  owner_phone: string;
  vehicle_type: string;
  number_of_wheels?: number;
  registration_expiry_date?: string;
  rc_number?: string;
  permit_number?: string;
  insurance_number?: string;
  insurance_expiry_date?: string;
  puc_number?: string;
  puc_expiry_date?: string;
  road_tax_expiry_date?: string;
  vehicle_image?: string | null;
  rc_book_image?: string | null;
  created_at?: string;
  updated_at?: string;
}
