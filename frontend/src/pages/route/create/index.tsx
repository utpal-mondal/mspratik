import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import CreatePageHeader from "../(component)/CreatePageHeader";
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

const RouteEntryPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [geoSection, setGeoSection] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<RouteFormData>(initialFormData);

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

    try {
      setSaving(true);
      await apiService.createRoute({
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
      toast.success("Route saved successfully");
      router.push("/route");
    } catch (error: any) {
      console.error("Error saving route:", error);
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
      toast.error(error?.response?.data?.message || "Failed to save route");
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

  const handleReset = () => {
    setFormData({
      clientId: "",
      startPoint: { ...emptyPoint },
      viaPoint: { ...emptyPoint },
      endPoint: { ...emptyPoint },
    });
    setFieldErrors({});
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
        <title>Route Entry | Pratik Transport</title>
        <meta name="description" content="Route entry" />
       
      </Head>

      <div
        className="min-h-screen bg-[#F2F5F9] px-6 pt-6 pb-8 md:px-8 text-[#17222E]"
       
      >
        <div className=" mx-auto flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CreatePageHeader saving={saving} onReset={handleReset} />

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
                <span className="text-[#A12B2B]">*</span> Required fields · Latitude −90
                to 90 · Longitude −180 to 180
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(RouteEntryPage);
