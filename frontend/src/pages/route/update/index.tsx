import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import withAuth from "../../../components/withAuth";
import apiService from "../../../services/api";
import UpdatePageHeader from "../(component)/UpdatePageHeader";
import RouteMapEditor from "../(component)/RouteMapEditor";
import FormActions from "../(component)/FormActions";
import { RouteFormData, RoutePoint } from "@/types/route-entry/types";
import type { RouteRecord } from "@/types/routes/types";

const emptyPoint: RoutePoint = { name: "", lat: "", long: "" };

const initialFormData: RouteFormData = {
  routeName: "",
  startPoint: { ...emptyPoint },
  viaPoints: [],
  endPoint: { ...emptyPoint },
};

const RouteUpdatePage = () => {
  const router = useRouter();
  const [routeId, setRouteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<RouteFormData>({
    ...initialFormData,
    startPoint: { ...emptyPoint },
    viaPoints: [],
    endPoint: { ...emptyPoint },
  });

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
          const routeData = route as RouteRecord;
          setFormData({
            routeName: routeData.route_name || "",
            startPoint: {
              name: route.start_name || "",
              lat: route.start_lat || "",
              long: route.start_long || "",
            },
            viaPoints: routeData.via_points?.map((point) => ({
                name: point.name || "",
                lat: point.lat || "",
                long: point.long || "",
                notify: point.notify ?? false,
              })) || [],
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

    if (!formData.routeName.trim()) {
      errors.routeName = "Route name is required";
    }
    if (!formData.startPoint.name.trim() || !formData.startPoint.lat || !formData.startPoint.long) {
      errors["startPoint.name"] = "Select a start place from Google Maps";
    }
    if (!formData.endPoint.name.trim() || !formData.endPoint.lat || !formData.endPoint.long) {
      errors["endPoint.name"] = "Select an end place from Google Maps";
    }
    formData.viaPoints.forEach((point, index) => {
      if (!point.name.trim() || !point.lat || !point.long) {
        errors[`viaPoints.${index}`] = "Select a place for this via point or remove it";
      }
    });

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
        route_name: formData.routeName.trim(),
        start_name: formData.startPoint.name.trim(),
        start_lat: formData.startPoint.lat,
        start_long: formData.startPoint.long,
        via_points: formData.viaPoints.map((point) => ({
          name: point.name.trim(),
          lat: point.lat,
          long: point.long,
          notify: point.notify ?? false,
        })),
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
          route_name: "routeName",
          start_name: "startPoint.name",
          start_lat: "startPoint.lat",
          start_long: "startPoint.long",
          via_points: "viaPoints",
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

  const handleCancel = () => {
    router.push("/route");
  };

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
              <UpdatePageHeader />

              <div className="bg-white border border-[#D5DDE6] rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,42,71,0.06),0_4px_16px_rgba(15,42,71,0.04)]">
                <div className="border-b border-[#D5DDE6] px-5 py-4">
                  <label className="mb-1.5 block text-xs font-medium text-[#3B4957]">
                    Route Name <span className="text-[#A12B2B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.routeName}
                    onChange={(event) => {
                      setFormData({ ...formData, routeName: event.target.value });
                      setFieldErrors({ ...fieldErrors, routeName: "" });
                    }}
                    className={`h-10 w-full rounded border px-3 text-[13px] outline-none focus:ring-2 ${
                      fieldErrors.routeName
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-[#C5CFDB] focus:border-[#0F2A47] focus:ring-[#0F2A47]/20"
                    }`}
                    placeholder="Enter route name"
                  />
                  {fieldErrors.routeName && (
                    <p className="mt-1 text-xs text-[#A12B2B]">{fieldErrors.routeName}</p>
                  )}
                </div>
                <RouteMapEditor
                  startPoint={formData.startPoint}
                  viaPoints={formData.viaPoints}
                  endPoint={formData.endPoint}
                  fieldErrors={fieldErrors}
                  onStartChange={(point) => {
                    setFormData((previous) => ({ ...previous, startPoint: point }))
                    if (point.lat && point.long) {
                      setFieldErrors((previous) => ({ ...previous, "startPoint.name": "" }))
                    }
                  }}
                  onViaChange={(index, point) => {
                    setFormData((previous) => ({
                      ...previous,
                      viaPoints: previous.viaPoints.map((via, i) =>
                        i === index ? point : via
                      ),
                    }))
                    if (point.lat && point.long) {
                      setFieldErrors((previous) => ({
                        ...previous,
                        [`viaPoints.${index}`]: "",
                        viaPoints: "",
                      }))
                    }
                  }}
                  onReorderStops={(points) => {
                    setFormData((previous) => ({
                      ...previous,
                      startPoint: points[0],
                      viaPoints: points.slice(1, -1),
                      endPoint: points[points.length - 1],
                    }))
                    setFieldErrors((previous) => {
                      const next = { ...previous }
                      delete next["startPoint.name"]
                      delete next["endPoint.name"]
                      delete next.viaPoints
                      Object.keys(next).forEach((key) => {
                        if (key.startsWith("viaPoints.")) delete next[key]
                      })
                      return next
                    })
                  }}
                  onAddVia={() =>
                    setFormData((previous) => ({
                      ...previous,
                      viaPoints: [...previous.viaPoints, { ...emptyPoint }],
                    }))
                  }
                  onRemoveVia={(index) =>
                    setFormData((previous) => ({
                      ...previous,
                      viaPoints: previous.viaPoints.filter((_, i) => i !== index),
                    }))
                  }
                  onEndChange={(point) => {
                    setFormData((previous) => ({ ...previous, endPoint: point }))
                    if (point.lat && point.long) {
                      setFieldErrors((previous) => ({ ...previous, "endPoint.name": "" }))
                    }
                  }}
                />
              </div>

              <FormActions
                saving={saving}
                secondaryLabel="Cancel"
                submitLabel="Update Route"
                onSecondary={handleCancel}
              />
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(RouteUpdatePage);
