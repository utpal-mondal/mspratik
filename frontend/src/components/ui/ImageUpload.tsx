import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadProps {
  label: string;
  file: File | null;
  error?: string;
  onSelect: (file: File | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  file,
  error,
  onSelect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] || null)}
      />
      {file && previewUrl ? (
        <div className="relative flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
          <img
            src={previewUrl}
            alt={label}
            className="w-14 h-14 rounded-md object-cover border border-gray-200"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-700 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full flex items-center justify-center gap-2 px-3 py-4 border-2 border-dashed rounded-lg text-sm transition-colors ${
            error
              ? "border-red-300 text-red-500 hover:border-red-400 bg-red-50/40"
              : "border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40"
          }`}
        >
          <ImagePlus size={18} />
          Click to upload
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
