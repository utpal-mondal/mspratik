import { useEffect, useRef, useState } from "react";
import { CirclePlus, GripVertical, MapPin, Trash2 } from "lucide-react";
import type { RoutePoint } from "@/types/route-entry/types";

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

interface GoogleMarkerDragEvent {
  latLng?: GoogleLatLng;
}

interface GoogleAutocomplete {
  addListener: (event: "place_changed", callback: () => void) => void;
  getPlace: () => GooglePlace;
}

interface GoogleMap {
  setMap: (map: GoogleMapInstance | null) => void;
  setOptions: (options: {
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    zIndex?: number;
  }) => void;
  addListener: (event: "click", callback: () => void) => void;
}

interface GoogleDirectionsResult {
  routes: Array<{
    overview_path: GoogleLatLng[];
    legs?: Array<{
      duration?: { value: number };
      distance?: { value: number };
    }>;
  }>;
}

interface GoogleMapInstance {
  panTo: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (bounds: GoogleLatLngBounds) => void;
}

interface GoogleLatLngBounds {
  extend: (position: { lat: number; lng: number }) => void;
}

interface GoogleMapMarker {
  setMap: (map: GoogleMapInstance | null) => void;
  setPosition: (position: { lat: number; lng: number }) => void;
  setTitle: (title: string) => void;
  setDraggable: (draggable: boolean) => void;
  addListener: (
    event: "dragend",
    callback: (event: GoogleMarkerDragEvent) => void
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
      }
    ) => GoogleMapInstance;
    LatLngBounds: new () => GoogleLatLngBounds;
    Marker: new (options: {
      map: GoogleMapInstance;
      position: { lat: number; lng: number };
      title: string;
      draggable: boolean;
    }) => GoogleMapMarker;
    Polyline: new (options: {
      map: GoogleMapInstance;
      path: GoogleLatLng[];
      strokeColor: string;
      strokeOpacity: number;
      strokeWeight: number;
      zIndex: number;
    }) => GoogleMap;
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options: { fields: string[]; types: string[] }
      ) => GoogleAutocomplete;
    };
    DirectionsRenderer: new (options: {
      map: GoogleMapInstance;
      suppressMarkers: boolean;
    }) => GoogleMap;
    DirectionsService: new () => {
      route: (
        request: {
          origin: { lat: number; lng: number };
          destination: { lat: number; lng: number };
          waypoints: Array<{
            location: { lat: number; lng: number };
            stopover: boolean;
          }>;
          optimizeWaypoints: boolean;
          provideRouteAlternatives: boolean;
          travelMode: string;
        },
        callback: (result: GoogleDirectionsResult | null, status: string) => void
      ) => void;
    };
    Geocoder: new () => {
      geocode: (
        request: { address?: string; location?: { lat: number; lng: number } },
        callback: (results: GoogleGeocoderResult[] | null, status: string) => void
      ) => void;
    };
    TravelMode: { DRIVING: string };
    DirectionsStatus: { OK: string };
    GeocoderStatus: { OK: string };
  };
}

type GoogleWindow = Window & { google?: GoogleMapsApi };
type RouteTarget = "start" | "end" | `via:${number}`;
interface RouteOption {
  duration: string;
  distance: string;
}

interface RouteStop {
  key: string;
  label: string;
  point: RoutePoint;
}

const routeColors = ["#2563EB", "#7C3AED", "#0891B2", "#EA580C"];

const formatRouteMetric = (value: number, unit: "duration" | "distance") => {
  if (unit === "duration") {
    const minutes = Math.round(value / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours} hr ${remainingMinutes} min` : `${minutes} min`;
  }
  return value >= 1000
    ? `${(value / 1000).toFixed(1)} km`
    : `${Math.round(value)} m`;
};

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

interface LocationInputProps {
  label: string;
  point: RoutePoint;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  googleReady: boolean;
  onChange: (point: RoutePoint) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  point,
  readOnly = false,
  required = false,
  error,
  googleReady,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const lookupRequestRef = useRef(0);
  const resolvedValueRef = useRef("");
  const [lookupError, setLookupError] = useState("");
  onChangeRef.current = onChange;

  useEffect(() => {
    const maps = (window as GoogleWindow).google?.maps;
    if (readOnly || !googleReady || !maps || !inputRef.current) return;

    const autocomplete = new maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "name"],
      types: ["geocode"],
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (!location) return;
      const name = place.name || place.formatted_address || "";
      lookupRequestRef.current += 1;
      resolvedValueRef.current = name;
      setLookupError("");
      onChangeRef.current({
        name,
        lat: String(location.lat()),
        long: String(location.lng()),
      });
    });
  }, [googleReady, readOnly]);

  return (
    <div className="min-w-0 flex-1">
      <label className="mb-1.5 block text-xs font-medium text-[#3B4957]">
        {label} {required && <span className="text-[#A12B2B]">*</span>}
      </label>
      <div className="relative">
        <MapPin
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8896]"
        />
        <input
          ref={inputRef}
          disabled={readOnly}
          value={point.name}
          onChange={(event) => {
            lookupRequestRef.current += 1;
            resolvedValueRef.current = "";
            setLookupError("");
            onChangeRef.current({ name: event.target.value, lat: "", long: "" })
          }}
          onBlur={(event) => {
            const address = event.currentTarget.value.trim();
            const maps = (window as GoogleWindow).google?.maps;
            if (
              readOnly ||
              !address ||
              (point.lat && point.long) ||
              address === resolvedValueRef.current ||
              !googleReady ||
              !maps
            ) {
              return;
            }

            const requestId = ++lookupRequestRef.current;
            new maps.Geocoder().geocode({ address }, (results, status) => {
              if (
                requestId !== lookupRequestRef.current ||
                inputRef.current?.value.trim() !== address
              ) {
                return;
              }
              const result = results?.[0];
              const location = result?.geometry?.location;
              if (status !== maps.GeocoderStatus.OK || !result || !location) {
                setLookupError("Place not found. Choose a suggestion or try another search.");
                return;
              }
              resolvedValueRef.current = result.formatted_address;
              setLookupError("");
              onChangeRef.current({
                name: result.formatted_address,
                lat: String(location.lat()),
                long: String(location.lng()),
              });
            });
          }}
          className={`h-10 w-full rounded border pl-9 pr-3 text-[13px] outline-none focus:ring-2 ${
            readOnly
              ? "cursor-not-allowed bg-[#F8FAFC] text-[#17222E] opacity-100"
              : "bg-white"
          } ${
            error
              ? "border-red-500 focus:ring-red-500/20"
              : "border-[#C5CFDB] focus:border-[#0F2A47] focus:ring-[#0F2A47]/20"
          }`}
          placeholder="Search and select a place"
          maxLength={100}
          autoComplete="off"
        />
      </div>
      {(error || lookupError) && (
        <p className="mt-1 text-xs text-[#A12B2B]">{error || lookupError}</p>
      )}
    </div>
  );
};

interface RouteMapEditorProps {
  startPoint: RoutePoint;
  viaPoints: RoutePoint[];
  endPoint: RoutePoint;
  fieldErrors: Record<string, string>;
  readOnly?: boolean;
  onStartChange: (point: RoutePoint) => void;
  onViaChange: (index: number, point: RoutePoint) => void;
  onReorderStops: (points: RoutePoint[]) => void;
  onAddVia: () => void;
  onRemoveVia: (index: number) => void;
  onEndChange: (point: RoutePoint) => void;
}

const RouteMapEditor: React.FC<RouteMapEditorProps> = ({
  startPoint,
  viaPoints,
  endPoint,
  fieldErrors,
  readOnly = false,
  onStartChange,
  onViaChange,
  onReorderStops,
  onAddVia,
  onRemoveVia,
  onEndChange,
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<Record<string, GoogleMapMarker>>({});
  const routeLinesRef = useRef<GoogleMap[]>([]);
  const directionsRequestRef = useRef(0);
  const directionsServiceRef = useRef<InstanceType<
    GoogleMapsApi["maps"]["DirectionsService"]
  > | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [draggedStopKey, setDraggedStopKey] = useState<string | null>(null);
  const lastViaRowRef = useRef<HTMLDivElement>(null);
  const focusNextViaRef = useRef(false);
  const previousViaCountRef = useRef(viaPoints.length);
  const onMapPointSelectedRef = useRef<
    (target: RouteTarget, point: RoutePoint) => void
  >(() => {});
  onMapPointSelectedRef.current = (target, point) => {
    if (target === "start") {
      onStartChange(point);
    } else if (target === "end") {
      onEndChange(point);
    } else {
      const index = Number(target.slice("via:".length));
      onViaChange(index, { ...point, notify: viaPoints[index]?.notify ?? false });
    }
  };

  useEffect(() => {
    if (focusNextViaRef.current && viaPoints.length > previousViaCountRef.current) {
      const newStopInput = lastViaRowRef.current?.querySelector("input");
      newStopInput?.focus();
      newStopInput?.scrollIntoView({ block: "nearest" });
      focusNextViaRef.current = false;
    }
    previousViaCountRef.current = viaPoints.length;
  }, [viaPoints.length]);

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

  useEffect(() => {
    const maps = (window as GoogleWindow).google?.maps;
    if (!googleReady || !maps || !mapElementRef.current || mapRef.current) return;

    const map = new maps.Map(mapElementRef.current, {
      center: { lat: 22.5726, lng: 88.3639 },
      zoom: 6,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    mapRef.current = map;
    directionsServiceRef.current = new maps.DirectionsService();
  }, [googleReady]);

  useEffect(() => {
    const maps = (window as GoogleWindow).google?.maps;
    const map = mapRef.current;
    if (!googleReady || !maps || !map) return;

    const points = [
      { key: "start", label: "From", point: startPoint },
      ...viaPoints.map<RouteStop>((point, index) => ({
        key: `via:${index}`,
        label: `Via ${index + 1}`,
        point,
      })),
      { key: "end", label: "To", point: endPoint },
    ];
    const activeKeys = new Set<string>();
    const bounds = new maps.LatLngBounds();
    let lastSelected: { lat: number; lng: number } | null = null;
    let selectedCount = 0;

    for (const { key, label, point } of points) {
      const lat = Number(point.lat);
      const lng = Number(point.long);
      if (!point.lat || !point.long || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        continue;
      }

      activeKeys.add(key);
      selectedCount += 1;
      lastSelected = { lat, lng };
      bounds.extend(lastSelected);
      const marker =
        markersRef.current[key] ||
        new maps.Marker({
          map,
          position: { lat, lng },
          title: `${label}: ${point.name}`,
          draggable: !readOnly,
        });
      if (!markersRef.current[key]) {
        marker.addListener("dragend", (event) => {
          const location = event.latLng;
          if (!location) return;
          const draggedLat = location.lat();
          const draggedLng = location.lng();
          new maps.Geocoder().geocode(
            { location: { lat: draggedLat, lng: draggedLng } },
            (results, status) => {
              const address = results?.[0]?.formatted_address;
              if (status !== maps.GeocoderStatus.OK || !address) {
                setMapError("Could not identify the new marker location. Try another point.");
                return;
              }
              onMapPointSelectedRef.current(key as RouteTarget, {
                name: address,
                lat: String(draggedLat),
                long: String(draggedLng),
              });
              setMapError("");
            }
          );
        });
      }
      marker.setMap(map);
      marker.setDraggable(!readOnly);
      marker.setPosition({ lat, lng });
      marker.setTitle(`${label}: ${point.name}`);
      markersRef.current[key] = marker;
    }

    for (const [key, marker] of Object.entries(markersRef.current)) {
      if (!activeKeys.has(key)) {
        marker.setMap(null);
        delete markersRef.current[key];
      }
    }

    if ((!startPoint.lat || !startPoint.long || !endPoint.lat || !endPoint.long) && lastSelected) {
      if (selectedCount > 1) {
        map.fitBounds(bounds);
      } else {
        map.panTo(lastSelected);
        map.setZoom(12);
      }
    }
  }, [googleReady, readOnly, startPoint, viaPoints, endPoint]);

  useEffect(() => {
    const maps = (window as GoogleWindow).google?.maps;
    const service = directionsServiceRef.current;
    if (!googleReady || !maps || !service) return;
    const requestId = ++directionsRequestRef.current;
    routeLinesRef.current.forEach((routeLine) => routeLine.setMap(null));
    routeLinesRef.current = [];
    setRouteOptions([]);
    setSelectedRouteIndex(0);
    setMapError("");
    if (!startPoint.lat || !startPoint.long || !endPoint.lat || !endPoint.long) {
      return;
    }
    const map = mapRef.current;
    if (!map) return;

    const waypoints = viaPoints
      .filter((point) => point.lat && point.long)
      .map((point) => ({
        location: { lat: Number(point.lat), lng: Number(point.long) },
        stopover: true,
      }));
    service.route(
      {
        origin: { lat: Number(startPoint.lat), lng: Number(startPoint.long) },
        destination: { lat: Number(endPoint.lat), lng: Number(endPoint.long) },
        waypoints,
        optimizeWaypoints: false,
        provideRouteAlternatives: true,
        travelMode: maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (requestId !== directionsRequestRef.current) return;
        if (status === maps.DirectionsStatus.OK && result?.routes.length) {
          const routeBounds = new maps.LatLngBounds();
          const options = result.routes.map((route) => {
            const durationSeconds =
              route.legs?.reduce((total, leg) => total + (leg.duration?.value || 0), 0) || 0;
            const distanceMeters =
              route.legs?.reduce((total, leg) => total + (leg.distance?.value || 0), 0) || 0;

            route.overview_path.forEach((point) =>
              routeBounds.extend({ lat: point.lat(), lng: point.lng() })
            );
            return {
              duration: formatRouteMetric(durationSeconds, "duration"),
              distance: formatRouteMetric(distanceMeters, "distance"),
            };
          });
          const routeLines = result.routes.map((route, index) => {
            const line = new maps.Polyline({
              map,
              path: route.overview_path,
              strokeColor: routeColors[index % routeColors.length],
              strokeOpacity: index === 0 ? 0.9 : 0.55,
              strokeWeight: index === 0 ? 7 : 5,
              zIndex: result.routes.length - index,
            });
            line.addListener("click", () => {
              setSelectedRouteIndex(index);
              routeLinesRef.current.forEach((routeLine, routeIndex) => {
                routeLine.setOptions({
                  strokeOpacity: routeIndex === index ? 0.95 : 0.55,
                  strokeWeight: routeIndex === index ? 7 : 5,
                  zIndex: routeIndex === index ? result.routes.length + 1 : result.routes.length - routeIndex,
                });
              });
            });
            return line;
          });
          routeLinesRef.current = routeLines;
          setRouteOptions(options);
          map.fitBounds(routeBounds);
          setMapError("");
        } else {
          setMapError("A driving route could not be displayed for these places.");
        }
      }
    );
  }, [googleReady, startPoint, viaPoints, endPoint]);

  const stops: RouteStop[] = [
    { key: "start", label: "From", point: startPoint },
    ...viaPoints.map((point, index) => ({
      key: `via:${index}`,
      label: `Via ${index + 1}`,
      point,
    })),
    { key: "end", label: "To", point: endPoint },
  ];

  const reorderStops = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...stops];
    const [movedStop] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedStop);
    onReorderStops(reordered.map((stop) => stop.point));
  };

  return (
    <section className="overflow-hidden rounded-md border border-[#D5DDE6] bg-white shadow-[0_1px_2px_rgba(15,42,71,0.06)]">
      <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <aside className="border-b border-[#D5DDE6] p-4 lg:border-b-0 lg:border-r">
          <h2 className="mb-4 text-sm font-semibold text-[#17222E]">Route stops</h2>
          <div className="flex flex-col gap-3">
            {stops.map((stop, index) => (
              <div
                key={stop.key}
                data-stop-card
                onDragOver={readOnly ? undefined : (event) => event.preventDefault()}
                onDrop={
                  readOnly
                    ? undefined
                    : (event) => {
                        event.preventDefault();
                        const sourceKey = event.dataTransfer.getData("text/plain");
                        const sourceIndex = stops.findIndex((item) => item.key === sourceKey);
                        if (sourceIndex >= 0) reorderStops(sourceIndex, index);
                        setDraggedStopKey(null);
                      }
                }
                className={`flex items-start gap-2 ${
                  draggedStopKey === stop.key
                    ? "rounded-md border border-[#2563EB] bg-blue-50 p-2 shadow-md"
                    : ""
                }`}
              >
                {!readOnly && (
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", stop.key);
                    const stopCard =
                      event.currentTarget.closest<HTMLElement>("[data-stop-card]");
                    if (stopCard) {
                      stopCard.style.border = "1px solid #2563EB";
                      stopCard.style.borderRadius = "6px";
                      stopCard.style.padding = "8px";
                      stopCard.style.borderColor = "#2563EB";
                      stopCard.style.backgroundColor = "#EFF6FF";
                      stopCard.style.boxShadow = "0 4px 12px rgba(15, 42, 71, 0.16)";
                      const bounds = stopCard.getBoundingClientRect();
                      event.dataTransfer.setDragImage(
                        stopCard,
                        event.clientX - bounds.left,
                        event.clientY - bounds.top
                      );
                    }
                    setDraggedStopKey(stop.key);
                    }}
                    onDragEnd={(event) => {
                    const stopCard =
                      event.currentTarget.closest<HTMLElement>("[data-stop-card]");
                    if (stopCard) {
                      stopCard.style.removeProperty("border");
                      stopCard.style.removeProperty("border-radius");
                      stopCard.style.removeProperty("padding");
                      stopCard.style.removeProperty("border-color");
                      stopCard.style.removeProperty("background-color");
                      stopCard.style.removeProperty("box-shadow");
                    }
                    setDraggedStopKey(null);
                    }}
                    onKeyDown={(event) => {
                    if (event.key === "ArrowUp" && index > 0) {
                      event.preventDefault();
                      reorderStops(index, index - 1);
                    } else if (event.key === "ArrowDown" && index < stops.length - 1) {
                      event.preventDefault();
                      reorderStops(index, index + 1);
                    }
                    }}
                    aria-label={`Drag to reorder ${stop.label.toLowerCase()} stop. Use the up and down arrow keys to move it.`}
                    title="Drag to reorder; use arrow keys when focused"
                    className="mt-8 shrink-0 cursor-grab touch-none text-[#8A96A3] active:cursor-grabbing"
                  >
                    <GripVertical size={18} />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  {stop.key === "start" ? (
                    <LocationInput
                      label={stop.label}
                      point={stop.point}
                      readOnly={readOnly}
                      required
                      error={fieldErrors["startPoint.name"]}
                      googleReady={googleReady}
                      onChange={onStartChange}
                    />
                  ) : stop.key === "end" ? (
                    <LocationInput
                      label={stop.label}
                      point={stop.point}
                      readOnly={readOnly}
                      required
                      error={fieldErrors["endPoint.name"]}
                      googleReady={googleReady}
                      onChange={onEndChange}
                    />
                  ) : (
                    <div
                      ref={index === stops.length - 2 ? lastViaRowRef : null}
                      className="flex min-w-0 items-start gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <LocationInput
                          label={stop.label}
                          point={stop.point}
                          readOnly={readOnly}
                          error={fieldErrors[`viaPoints.${index - 1}`]}
                          googleReady={googleReady}
                          onChange={(value) =>
                            onViaChange(index - 1, {
                              ...value,
                              notify: stop.point.notify ?? false,
                            })
                          }
                        />
                        {!readOnly && (
                          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-[#4D5B6A]">
                            <input
                              type="checkbox"
                              checked={stop.point.notify ?? false}
                              onChange={(event) =>
                                onViaChange(index - 1, {
                                  ...stop.point,
                                  notify: event.target.checked,
                                })
                              }
                              className="h-4 w-4 accent-[#0F2A47]"
                            />
                            Notify when reached
                          </label>
                        )}
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => onRemoveVia(index - 1)}
                          className="mt-6 shrink-0 rounded border border-[#D5DDE6] p-2 text-[#7B8896] hover:bg-[#F8FAFC] hover:text-[#A12B2B]"
                          aria-label={`Remove ${stop.label.toLowerCase()} stop`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {fieldErrors.viaPoints && (
              <p className="text-xs text-[#A12B2B]">{fieldErrors.viaPoints}</p>
            )}
            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    focusNextViaRef.current = true;
                    onAddVia();
                  }}
                  className="flex h-9 w-fit items-center gap-2 rounded px-2 text-[13px] font-medium text-[#0F2A47] hover:bg-[#F8FAFC]"
                >
                  <CirclePlus size={20} />
                  Add destination
                </button>
                <p className="text-xs text-[#5B6A7A]">
                  Drag the handle to reorder stops. You can also move a pin directly on the map.
                </p>
              </>
            )}
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-3 p-3">
          {mapError && <p className="text-xs text-[#A12B2B]">{mapError}</p>}
          <div
            ref={mapElementRef}
            className="h-[420px] w-full rounded border border-[#D5DDE6] bg-[#F1F4F8] lg:h-[560px]"
            aria-label="Google map showing the selected route"
          />
          {routeOptions.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Available driving routes">
              {routeOptions.map((option, index) => (
                <button
                  key={`${option.duration}-${option.distance}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedRouteIndex(index);
                    routeLinesRef.current.forEach((routeLine, routeIndex) => {
                      routeLine.setOptions({
                        strokeOpacity: routeIndex === index ? 0.95 : 0.55,
                        strokeWeight: routeIndex === index ? 7 : 5,
                        zIndex:
                          routeIndex === index
                            ? routeOptions.length + 1
                            : routeOptions.length - routeIndex,
                      });
                    });
                  }}
                  className={`flex min-w-[145px] items-center gap-2 rounded border px-3 py-2 text-left text-xs transition-colors ${
                    selectedRouteIndex === index
                      ? "border-[#2563EB] bg-blue-50 text-[#17222E]"
                      : "border-[#D5DDE6] bg-white text-[#4D5B6A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: routeColors[index % routeColors.length] }}
                  />
                  <span className="flex flex-col">
                    <span className="font-semibold">{option.duration}</span>
                    <span className="text-[11px] text-[#7B8896]">{option.distance}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RouteMapEditor;
