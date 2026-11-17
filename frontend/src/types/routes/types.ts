export interface RouteRecord {
  id: number;
  route_name: string;
  start_name?: string;
  start_lat?: string;
  start_long?: string;
  via_points?: Array<{
    id?: number;
    name: string;
    lat: string;
    long: string;
    position?: number;
    notify?: boolean;
  }>;
  end_name?: string;
  end_lat?: string;
  end_long?: string;
  created_at?: string;
  updated_at?: string;
}
