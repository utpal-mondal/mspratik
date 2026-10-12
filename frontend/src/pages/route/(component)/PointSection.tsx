import { Loader2, MapPin } from "lucide-react";
import { RoutePoint } from "@/types/route-entry/types";

interface PointSectionProps {
  title: string;
  point: RoutePoint;
  errorKeyPrefix: string;
  fieldErrors: { [key: string]: string };
  inputClass: (field: string) => string;
  nameRequired?: boolean;
  lookingUp?: boolean;
  onFieldChange: (field: keyof RoutePoint, value: string) => void;
  onLookup: (auto?: boolean) => void;
  onClearError: (field: string) => void;
}

const labelClass = "text-xs font-medium text-[#3B4957]";
const errorClass = "mt-0.5 text-xs text-[#A12B2B]";

const PointSection: React.FC<PointSectionProps> = ({
  title,
  point,
  errorKeyPrefix,
  fieldErrors,
  inputClass,
  nameRequired = false,
  lookingUp = false,
  onFieldChange,
  onLookup,
  onClearError,
}) => {
  const nameKey = `${errorKeyPrefix}.name`;
  const latKey = `${errorKeyPrefix}.lat`;
  const longKey = `${errorKeyPrefix}.long`;

  return (
    <div className="bg-white">
      <div className="flex items-center h-10 px-5 bg-[#0F2A47] text-white border-t border-[#0F2A47]">
        <h2 className="m-0 text-xs font-semibold tracking-[0.08em] uppercase">
          {title}
        </h2>
      </div>
      <div className="flex flex-wrap gap-4 px-5 py-4">
        <div className="flex-[2_1_260px] min-w-0 flex flex-col gap-1.5">
          <label className={labelClass}>
            Name {nameRequired && <span className="text-[#A12B2B]">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              value={point.name}
              onChange={(e) => {
                onFieldChange("name", e.target.value);
                if (fieldErrors[nameKey]) onClearError(nameKey);
              }}
              onBlur={() => onLookup(true)}
              className={`${inputClass(nameKey)} capitalize pr-9`}
              placeholder="Enter point name"
              maxLength={100}
            />
            <button
              type="button"
              onClick={() => onLookup()}
              disabled={lookingUp}
              title="Fetch latitude & longitude"
              className="absolute bg-[#0F2A47] right-2 top-1/2 -translate-y-1/2 p-1 text-white hover:text-[#0F2A47] rounded transition-colors disabled:opacity-50"
            >
              {lookingUp ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <MapPin size={15} />
              )}
            </button>
          </div>
          {fieldErrors[nameKey] && <p className={errorClass}>{fieldErrors[nameKey]}</p>}
        </div>

        <div className="flex-[1_1_150px] min-w-0 flex flex-col gap-1.5">
          <label className={labelClass}>Lat</label>
          <input
            type="text"
            inputMode="decimal"
            value={point.lat}
            onChange={(e) => {
              onFieldChange("lat", e.target.value.replace(/[^\d.-]/g, ""));
              if (fieldErrors[latKey]) onClearError(latKey);
            }}
            disabled
            className={`${inputClass(latKey)} [font-variant-numeric:tabular-nums] disabled:bg-[#F1F4F8] disabled:text-[#5B6A7A] disabled:cursor-not-allowed`}
            placeholder="Auto-filled"
            maxLength={20}
          />
          {fieldErrors[latKey] && <p className={errorClass}>{fieldErrors[latKey]}</p>}
        </div>

        <div className="flex-[1_1_150px] min-w-0 flex flex-col gap-1.5">
          <label className={labelClass}>Long</label>
          <input
            type="text"
            inputMode="decimal"
            value={point.long}
            onChange={(e) => {
              onFieldChange("long", e.target.value.replace(/[^\d.-]/g, ""));
              if (fieldErrors[longKey]) onClearError(longKey);
            }}
            disabled
            className={`${inputClass(longKey)} [font-variant-numeric:tabular-nums] disabled:bg-[#F1F4F8] disabled:text-[#5B6A7A] disabled:cursor-not-allowed`}
            placeholder="Auto-filled"
            maxLength={20}
          />
          {fieldErrors[longKey] && <p className={errorClass}>{fieldErrors[longKey]}</p>}
        </div>
      </div>
    </div>
  );
};

export default PointSection;
