export interface RoutePoint {
  name: string;
  lat: string;
  long: string;
}

export interface RouteFormData {
  clientId: string;
  startPoint: RoutePoint;
  viaPoint: RoutePoint;
  endPoint: RoutePoint;
}
