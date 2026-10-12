export interface RouteRecord {
  id: number;
  client_id?: number;
  client_name?: string;
  start_name?: string;
  start_lat?: string;
  start_long?: string;
  via_name?: string;
  via_lat?: string;
  via_long?: string;
  end_name?: string;
  end_lat?: string;
  end_long?: string;
  created_at?: string;
  updated_at?: string;
}
