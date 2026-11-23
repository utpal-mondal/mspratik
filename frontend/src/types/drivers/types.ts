export interface DriverDocument {
  id: number;
  driver_id: number;
  company_id?: number;
  driver_name?: string;
  document_type: string;
  expiry_date?: string;
  document_name: string;
  file_path?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface DriverRecord {
  id: number;
  driver_name: string;
  phone_number: string;
  experience_years?: number;
  licence_number?: string;
  driver_photo?: string | null;
  licence_image?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  documents?: DriverDocument[];
}
