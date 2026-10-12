import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import UpdatePageHeader from "../(component)/UpdatePageHeader";
import ClientSection from "../(component)/ClientSection";
import PointSection from "../(component)/PointSection";
import { geocodeAddress } from "@/utils/geocode";
import { RouteFormData, RoutePoint } from "@/types/route-entry/types";

const emptyPoint: RoutePoint = { name: "", lat: "", long: "" };

const initialFormData: RouteFormData = {
  clientId: "",
  startPoint: { ...emptyPoint },
  viaPoint: { ...emptyPoint },
  endPoint: { ...emptyPoint },
};

const RouteUpdatePage = () => {
  const router = useRouter();
  const [routeId, setRouteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geoSection, setGeoSection] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<RouteFormData>(initialFormData);

  useEffect(() => {
    if (!router.isReady) return;
    const { id } = router.query;
    if (!id) {
      toast.error("Route ID is required");
      router.push("/route");
      return;
    }
    setRouteId(Number(id));
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (routeId == null) return;
    const fetchRoute = async () => {
      try {
        setLoading(true);
        const res = await apiService.getRoute(routeId);
        const route = res?.data?.data;
        if (route) {
          setFormData({
            clientId: route.client_id ? String(route.client_id) : "",
            startPoint: {
              name: route.start_name || "",
              lat: route.start_lat || "",
              long: route.start_long || "",
            },
            viaPoint: {
              name: route.via_name || "",
              lat: route.via_lat || "",
              long: route.via_long || "",
            },
            endPoint: {
              name: route.end_name || "",
              lat: route.end_lat || "",
              long: route.end_long || "",
            },
          });
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        toast.error("Failed to fetch route details");
        router.push("/route");
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [routeId]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.clientId) {
      errors.clientId = "Client name is required";
    }
    if (!formData.startPoint.name.trim()) {
      errors["startPoint.name"] = "Start point name is required";
    }
    if (!formData.endPoint.name.trim()) {
      errors["endPoint.name"] = "End point name is required";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      toast.error("Please fill the required fields");
      return;
    }

    if (routeId == null) {
      toast.error("Route ID is missing");
      return;
    }

    try {
      setSaving(true);
      await apiService.updateRoute(routeId, {
        client_id: formData.clientId,
        start_name: formData.startPoint.name.trim(),
        start_lat: formData.startPoint.lat,
        start_long: formData.startPoint.long,
        via_name: formData.viaPoint.name.trim(),
        via_lat: formData.viaPoint.lat,
        via_long: formData.viaPoint.long,
        end_name: formData.endPoint.name.trim(),
        end_lat: formData.endPoint.lat,
        end_long: formData.endPoint.long,
      });
      toast.success("Route updated successfully");
      router.push("/route");
    } catch (error: any) {
      console.error("Error updating route:", error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const keyMap: { [key: string]: string } = {
          client_id: "clientId",
          start_name: "startPoint.name",
          start_lat: "startPoint.lat",
          start_long: "startPoint.long",
          via_name: "viaPoint.name",
          via_lat: "viaPoint.lat",
          via_long: "viaPoint.long",
          end_name: "endPoint.name",
          end_lat: "endPoint.lat",
          end_long: "endPoint.long",
        };
        const mapped: { [key: string]: string } = {};
        for (const [key, msg] of Object.entries(apiErrors)) {
          mapped[keyMap[key] || key] = String(msg);
        }
        setFieldErrors(mapped);
      }
      toast.error(error?.response?.data?.message || "Failed to update route");
    } finally {
      setSaving(false);
    }
  };

  const handlePointChange = (
    section: "startPoint" | "viaPoint" | "endPoint",
    field: keyof RoutePoint,
    value: string
  ) => {
    setFormData({
      ...formData,
      [section]: { ...formData[section], [field]: value },
    });
  };

  const lookupSection = async (
    section: "startPoint" | "viaPoint" | "endPoint",
    auto?: boolean
  ) => {
    const point = formData[section];
    const name = point.name.trim();
    if (!name) return;
    if (auto && (point.lat.trim() || point.long.trim())) return;

    try {
      setGeoSection(section);
      const coords = await geocodeAddress(name);
      if (coords) {
        setFormData((prev) => ({
          ...prev,
          [section]: { ...prev[section], lat: coords.lat, long: coords.long },
        }));
      } else if (!auto) {
        toast.warn(`No location found for "${name}"`);
      }
    } catch {
      if (!auto) toast.error("Failed to fetch location");
    } finally {
      setGeoSection(null);
    }
  };

  const handleClearError = (field: string) => {
    setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  const handleCancel = () => {
    router.push("/route");
  };

  const inputClass = (field: string) =>
    `w-full h-10 px-3 border rounded text-[13px] placeholder-[#6B7886] hover:border-[#8C9BAD] focus:outline-none focus:ring-2 transition-colors ${
      fieldErrors[field]
        ? "border-red-500 focus:ring-red-500/30"
        : "border-[#C5CFDB] focus:ring-[#0F2A47] focus:border-[#0F2A47]"
    }`;

  return (
    <>
      <Head>
        <title>Update Route | Pratik Transport</title>
        <meta name="description" content="Update route" />
       
      </Head>

      <div
        className="min-h-screen bg-[#F2F5F9] px-6 pt-6 pb-8 md:px-8 text-[#17222E]"
       
      >
        <div className=" mx-auto flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#5B6A7A]">Loading route details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <UpdatePageHeader saving={saving} onCancel={handleCancel} />

              <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
                <ClientSection
                  clientId={formData.clientId}
                  error={fieldErrors.clientId}
                  onChange={(value) => {
                    setFormData({ ...formData, clientId: value });
                    if (fieldErrors.clientId) handleClearError("clientId");
                  }}
                  onClearError={() => handleClearError("clientId")}
                />
                <PointSection
                  title="Start Point"
                  point={formData.startPoint}
                  errorKeyPrefix="startPoint"
                  fieldErrors={fieldErrors}
                  inputClass={inputClass}
                  nameRequired
                  lookingUp={geoSection === "startPoint"}
                  onLookup={(auto) => lookupSection("startPoint", auto)}
                  onFieldChange={(field, value) =>
                    handlePointChange("startPoint", field, value)
                  }
                  onClearError={handleClearError}
                />
                <PointSection
                  title="Via Point"
                  point={formData.viaPoint}
                  errorKeyPrefix="viaPoint"
                  fieldErrors={fieldErrors}
                  inputClass={inputClass}
                  lookingUp={geoSection === "viaPoint"}
                  onLookup={(auto) => lookupSection("viaPoint", auto)}
                  onFieldChange={(field, value) =>
                    handlePointChange("viaPoint", field, value)
                  }
                  onClearError={handleClearError}
                />
                <PointSection
                  title="End Point"
                  point={formData.endPoint}
                  errorKeyPrefix="endPoint"
                  fieldErrors={fieldErrors}
                  inputClass={inputClass}
                  nameRequired
                  lookingUp={geoSection === "endPoint"}
                  onLookup={(auto) => lookupSection("endPoint", auto)}
                  onFieldChange={(field, value) =>
                    handlePointChange("endPoint", field, value)
                  }
                  onClearError={handleClearError}
                />

                <div className="px-5 py-2.5 bg-[#F8FAFC] border-t border-[#D5DDE6] text-xs text-[#5B6A7A]">
                  <span className="text-[#A12B2B]">*</span> Required fields · Latitude
                  −90 to 90 · Longitude −180 to 180
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(RouteUpdatePage);
