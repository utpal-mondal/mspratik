import { useCallback, useEffect, useRef, useState } from "react";
import {
  geocodeAddressPhoton,
  type GeoCoordinates,
} from "@/utils/geocode";

export type BranchGeocodeStatus = "idle" | "loading" | "success" | "not-found" | "error";

const statusMessages: Record<BranchGeocodeStatus, string> = {
  idle: "Coordinates update automatically as you enter the address.",
  loading: "Finding coordinates for this address...",
  success: "Coordinates found using Photon and OpenStreetMap.",
  "not-found": "No matching location found. Continue typing or check the address.",
  error: "Could not look up the address. Check your connection and try again.",
};

export default function useBranchGeocode() {
  const [status, setStatus] = useState<BranchGeocodeStatus>("idle");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const clear = useCallback(() => {
    cancel();
    setStatus("idle");
  }, [cancel]);

  const lookup = useCallback(async (address: string): Promise<GeoCoordinates | null> => {
    controllerRef.current?.abort();
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setStatus("idle");
      return null;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("loading");

    try {
      const coordinates = await geocodeAddressPhoton(trimmedAddress, controller.signal);
      if (controller.signal.aborted) return null;
      setStatus(coordinates ? "success" : "not-found");
      return coordinates;
    } catch (error) {
      if (controller.signal.aborted) return null;
      console.error("Photon address lookup failed:", error);
      setStatus("error");
      return null;
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  return { lookup, cancel, clear, status, message: statusMessages[status] };
}
