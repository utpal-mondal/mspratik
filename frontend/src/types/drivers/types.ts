export interface DriverRecord {
  id: number;
  driver_name: string;
  phone_number: string;
  experience_years?: number;
  driver_photo?: string | null;
  licence_image?: string | null;
  created_at?: string;
  updated_at?: string;
}
