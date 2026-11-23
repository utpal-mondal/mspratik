import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface GoogleLatLng {
  lat: () => number;
  lng: () => number;
}

interface GooglePlace {
  name?: string;
  formatted_address?: string;
  geometry?: { location?: GoogleLatLng };
}

interface GoogleGeocoderResult {
  formatted_address: string;
  geometry?: { location?: GoogleLatLng };
}

interface GoogleAutocomplete {
  addListener: (event: "place_changed", callback: () => void) => void;
  getPlace: () => GooglePlace;
}

interface GoogleMapInstance {
  panTo: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  addListener: (
    event: "click",
    callback: (event: { latLng?: GoogleLatLng }) => void
  ) => void;
}

interface GoogleMapMarker {
  setMap: (map: GoogleMapInstance | null) => void;
  setPosition: (position: { lat: number; lng: number }) => void;
  setTitle: (title: string) => void;
  setDraggable: (draggable: boolean) => void;
  addListener: (
    event: "dragend",
    callback: (event: { latLng?: GoogleLatLng }) => void
  ) => void;
}

interface GoogleMapsApi {
  maps: {
    Map: new (
      element: HTMLElement,
      options: {
        center: { lat: number; lng: number };
        zoom: number;
        mapTypeControl: boolean;
        streetViewControl: boolean;
        fullscreenControl: boolean;
        restriction: {
          latLngBounds: {
            north: number;
            south: number;
            east: number;
            west: number;
          };
          strictBounds: boolean;
        };
      }
    ) => GoogleMapInstance;
    Marker: new (options: {
      map: GoogleMapInstance;
      position: { lat: number; lng: number };
      title: string;
      draggable: boolean;
    }) => GoogleMapMarker;
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options: {
          fields: string[];
          types: string[];
          componentRestrictions: { country: string };
        }
      ) => GoogleAutocomplete;
    };
    Geocoder: new () => {
      geocode: (
        request: { address?: string; location?: { lat: number; lng: number } },
        callback: (results: GoogleGeocoderResult[] | null, status: string) => void
      ) => void;
    };
    GeocoderStatus: { OK: string };
  };
}

type GoogleWindow = Window & { google?: GoogleMapsApi };

const indiaMapBounds = {
  north: 37.2,
  south: 6.5,
  east: 97.5,
  west: 68.0,
};

const HALDIA_CENTER = { lat: 22.0667, lng: 88.0698 };

let mapsScriptPromise: Promise<void> | null = null;

const loadGoogleMaps = (apiKey: string): Promise<void> => {
  if ((window as GoogleWindow).google?.maps?.places) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places`;
    script.async = true;
    script.onload = () => {
      if ((window as GoogleWindow).google?.maps.places) {
        resolve();
      } else {
        mapsScriptPromise = null;
        reject(new Error("Google Places failed to load"));
      }
    };
    script.onerror = () => {
      mapsScriptPromise = null;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(script);
  });
  return mapsScriptPromise;
};

const toFixed6 = (n: number) => n.toFixed(6);
const isValidLat = (v: number) => Number.isFinite(v) && v >= -90 && v <= 90;
const isValidLng = (v: number) => Number.isFinite(v) && v >= -180 && v <= 180;

interface LocationMapPickerProps {
  locationName: string;
  latitude: string;
  longitude: string;
  readOnly?: boolean;
  error?: string;
  onChange: (next: {
    locationName: string;
    latitude: string;
    longitude: string;
  }) => void;
}

const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  locationName,
  latitude,
  longitude,
  readOnly = false,
  error,
  onChange,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<GoogleMapMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const valuesRef = useRef({ locationName, latitude, longitude });
  const lookupRequestRef = useRef(0);
  const resolvedValueRef = useRef("");
  const resolvedCoordinatesRef = useRef("");
  const lastSyncedCoordsRef = useRef("");
  const [googleReady, setGoogleReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [lookupError, setLookupError] = useState("");

  onChangeRef.current = onChange;
  valuesRef.current = { locationName, latitude, longitude };

  const applyPoint = (name: string, lat: number, lng: number) => {
    const latStr = toFixed6(lat);
    const lngStr = toFixed6(lng);
    resolvedValueRef.current = name;
    resolvedCoordinatesRef.current = `${latStr},${lngStr}`;
    setLookupError("");
    setMapError("");
    onChangeRef.current({
      locationName: name,
      latitude: latStr,
      longitude: lngStr,
    });
  };

  // Resolve an arbitrary lat/lng into a full address and push all fields up
  const reverseGeocode = (lat: number, lng: number) => {
    const maps = (window as GoogleWindow).google?.maps;
    if (!maps) return;
    const requestId = ++lookupRequestRef.current;
    new maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
      if (requestId !== lookupRequestRef.current) return;
      const address = results?.[0]?.formatted_address;
      if (status !== maps.GeocoderStatus.OK || !address) {
        setMapError("Could not identify this location. Try another point.");
        return;
      }
      applyPoint(address, lat, lng);
    });
  };

  // Load the Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError("Google Maps is not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      return;
    }
    let active = true;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (active) setGoogleReady(true);
      })
      .catch(() => {
        if (active) setMapError("Google Maps could not be loaded. Check the API key and network.");
      });
    return () => {
      active = false;
    };
  }, []);

  // Create the map once Google is ready
  useEffect(() => {
    const maps = (window as GoogleWindow).google?.maps;
    if (!googleReady || !maps || !mapElementRef.current || mapRef.current) return;

    const map = new maps.Map(mapElementRef.current, {
      center: HALDIA_CENTER,
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      restriction: {
        latLngBounds: indiaMapBounds,
        strictBounds: true,
      },
    });
    mapRef.current = map;

    if (!readOnly) {
      map.addListener("click", (event) => {
        const location = event.latLng;
        if (!location) return;
        reverseGeocode(location.lat(), location.lng());
      });
    }
  }, [googleReady, readOnly]);

  // Places autocomplete on the location input
  useEffect(() => {
    const maps = (window as GoogleWindow).google?.maps;
    if (readOnly || !googleReady || !maps || !searchInputRef.current) return;

    const autocomplete = new maps.places.Autocomplete(searchInputRef.current, {
      fields: ["formatted_address", "geometry", "name"],
      types: ["geocode"],
      componentRestrictions: { country: "in" },
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (!location) return;
      applyPoint(place.formatted_address || place.name || "", location.lat(), location.lng());
    });
  }, [googleReady, readOnly]);

  // Keep the marker + camera in sync with latitude/longitude props
  useEffect(() => {
    const maps = (window as GoogleWindow).google?.maps;
    const map = mapRef.current;
    if (!googleReady || !maps || !map) return;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const hasCoords = latitude !== "" && longitude !== "" && isValidLat(lat) && isValidLng(lng);

    if (!hasCoords) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      lastSyncedCoordsRef.current = "";
      return;
    }

    const coordsKey = `${lat},${lng}`;
    if (!markerRef.current) {
      markerRef.current = new maps.Marker({
        map,
        position: { lat, lng },
        title: locationName || "Selected location",
        draggable: !readOnly,
      });
      markerRef.current.addListener("dragend", (event) => {
        const location = event.latLng;
        if (!location) return;
        reverseGeocode(location.lat(), location.lng());
      });
    } else {
      markerRef.current.setPosition({ lat, lng });
      markerRef.current.setDraggable(!readOnly);
      markerRef.current.setTitle(locationName || "Selected location");
    }

    if (lastSyncedCoordsRef.current !== coordsKey) {
      map.panTo({ lat, lng });
      map.setZoom(14);
      lastSyncedCoordsRef.current = coordsKey;
    }
  }, [googleReady, latitude, longitude, locationName, readOnly]);

  // Reverse-geocode manually typed coordinates into a location name.
  // Debounced; skipped when the coords came from a lookup (search/map/marker).
  useEffect(() => {
    const maps = (window as GoogleWindow).google?.maps;
    if (!googleReady || !maps || readOnly) return;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!(latitude !== "" && longitude !== "" && isValidLat(lat) && isValidLng(lng))) return;
    if (resolvedCoordinatesRef.current === `${toFixed6(lat)},${toFixed6(lng)}`) return;

    const timer = setTimeout(() => {
      // Bail if the user kept typing while we waited
      if (
        valuesRef.current.latitude !== latitude ||
        valuesRef.current.longitude !== longitude
      ) {
        return;
      }
      reverseGeocode(lat, lng);
    }, 600);
    return () => clearTimeout(timer);
  }, [googleReady, latitude, longitude, readOnly]);

  const handleSearchBlur = () => {
    const maps = (window as GoogleWindow).google?.maps;
    const address = searchInputRef.current?.value.trim() ?? "";
    if (
      readOnly ||
      !googleReady ||
      !maps ||
      !address ||
      (latitude && longitude) ||
      address === resolvedValueRef.current
    ) {
      return;
    }
    const requestId = ++lookupRequestRef.current;
    new maps.Geocoder().geocode({ address }, (results, status) => {
      if (
        requestId !== lookupRequestRef.current ||
        searchInputRef.current?.value.trim() !== address
      ) {
        return;
      }
      const location = results?.[0]?.geometry?.location;
      if (status !== maps.GeocoderStatus.OK || !results?.[0] || !location) {
        setLookupError("Place not found. Choose a suggestion or try another search.");
        return;
      }
      applyPoint(results[0].formatted_address, location.lat(), location.lng());
    });
  };

  const inputCls =
    "w-full h-10 px-3 border rounded text-[13px] focus:outline-none focus:ring-2 transition-colors border-[#C5CFDB] focus:ring-[#0F2A47]/20 focus:border-[#0F2A47]";
  const searchInputCls =
    "w-full h-10 pl-9 pr-3 border rounded text-[13px] focus:outline-none focus:ring-2 transition-colors border-[#C5CFDB] focus:ring-[#0F2A47]/20 focus:border-[#0F2A47]";

  return (
    <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_8px_24px_rgba(15,42,71,0.05)]">
      <div className="px-6 pt-4">
        <h2 className="text-base font-semibold text-[#0F2A47]">Location</h2>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Location
            </label>
            <div className="relative">
              <MapPin
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={locationName}
                disabled={readOnly}
                onChange={(e) => {
                  lookupRequestRef.current += 1;
                  resolvedValueRef.current = "";
                  setLookupError("");
                  onChangeRef.current({
                    locationName: e.target.value,
                    latitude,
                    longitude,
                  });
                }}
                onBlur={handleSearchBlur}
                className={searchInputCls}
                placeholder="Search a place (e.g. Haldia)"
                maxLength={200}
                autoComplete="off"
              />
            </div>
            {(error || lookupError) && (
              <p className="mt-1 text-xs text-[#A12B2B]">{error || lookupError}</p>
            )}
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              disabled={readOnly}
              onChange={(e) =>
                onChangeRef.current({ locationName, latitude: e.target.value, longitude })
              }
              className={inputCls}
              placeholder="e.g. 22.0667"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#3B4957] mb-1.5">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              disabled={readOnly}
              onChange={(e) =>
                onChangeRef.current({ locationName, latitude, longitude: e.target.value })
              }
              className={inputCls}
              placeholder="e.g. 88.0698"
            />
          </div>
        </div>

        <div
          ref={mapElementRef}
          className="h-64 w-full rounded-md border border-[#D5DDE6] bg-slate-100"
        />
        {mapError ? (
          <p className="text-xs text-[#A12B2B]">{mapError}</p>
        ) : (
          !readOnly && (
            <p className="text-[11px] text-[#7B8896]">
              Search a place, drag the marker, or click the map to pick a location.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default LocationMapPicker;
