export interface RoutePoint {
  name: string;
  lat: string;
  long: string;
  notify?: boolean;
}

export interface RouteFormData {
  routeName: string;
  startPoint: RoutePoint;
  viaPoints: RoutePoint[];
  endPoint: RoutePoint;
}

export interface RoutePayload {
  route_name: string;
  start_name: string;
  start_lat: string;
  start_long: string;
  via_points: RoutePoint[];
  end_name: string;
  end_lat: string;
  end_long: string;
}
