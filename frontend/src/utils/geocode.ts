export interface GeoPoint {
  lat: string;
  long: string;
}

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${key}`
  );
  const data = await res.json();
  const loc = data?.results?.[0]?.geometry?.location;
  if (!loc) return null;

  return { lat: String(loc.lat), long: String(loc.lng) };
}
