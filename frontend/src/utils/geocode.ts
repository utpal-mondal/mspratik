export interface GeoPoint {
  lat: string;
  long: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export async function geocodeAddressPhoton(
  address: string,
  signal?: AbortSignal,
): Promise<GeoCoordinates | null> {
  const query = new URLSearchParams({
    q: address.trim(),
    limit: "1",
  });
  const response = await fetch(
    `https://photon.komoot.io/api/?${query.toString()}`,
    {
      headers: { Accept: "application/json" },
      referrerPolicy: "strict-origin-when-cross-origin",
      signal,
    },
  );
  if (!response.ok) {
    throw new Error(`Photon geocoding failed with status ${response.status}`);
  }

  const result = (await response.json()) as {
    features?: { geometry?: { coordinates?: [number, number] } }[];
  };
  const coordinates = result.features?.[0]?.geometry?.coordinates;
  if (!coordinates) return null;

  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Photon returned invalid coordinates");
  }

  return { latitude, longitude };
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
