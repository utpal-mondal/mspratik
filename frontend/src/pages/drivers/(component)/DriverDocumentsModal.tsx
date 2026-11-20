import { useEffect, useRef, useState } from "react";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import CustomDatePicker from "@/components/ui/DatePicker";
import { formatDate } from "@/utils/dateRangeUtils";
import type { DriverRecord } from "@/types/drivers/types";
import {
  FileText,
  UploadCloud,
  X,
  Trash2,
  File as FileIcon,
  CheckCircle2,
} from "lucide-react";
 
const documentTypes = [
  "Aadhar Card",
  "PAN Card",
  "Voter Card",
  "Driving License",
  "Passport",
] as const;

type DriverDocumentType = (typeof documentTypes)[number];
 
export interface DocumentUploadPayload {
  documentType: DriverDocumentType;
  expiryDate?: string;
  files: File[];
}
 
interface DocumentUploadDialogProps {
  driver: DriverRecord | null;
  onClose: () => void;
  onUpload: (payload: DocumentUploadPayload) => Promise<void> | void;
  isUploading?: boolean;
}
 
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.svg,.webp";
const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/svg+xml", "image/webp"];
const MAX_SIZE_MB = 5;
const documentTypeOptions = documentTypes.map((type) => ({ value: type, label: type }));
 
const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
 
const FileThumb: React.FC<{ file: File; onPreview?: () => void }> = ({ file, onPreview }) => {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const [url, setUrl] = useState<string | null>(null);
 
  useEffect(() => {
    if (!isImage) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);
 
  if (isImage && url) {
    return (
      <img
        src={url}
        alt={file.name}
        onClick={onPreview}
        title="Click to preview"
        className="w-16 h-16 rounded-md object-cover shrink-0 border border-gray-100 cursor-pointer hover:opacity-90 transition"
      />
    );
  }
 
  return (
    <div
      className={`flex items-center justify-center w-16 h-16 rounded-md shrink-0 ${
        isPdf ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isPdf ? <FileText size={20} /> : <FileIcon size={20} />}
    </div>
  );
};
 
const labelCls = "block text-[11px] font-semibold tracking-wide uppercase text-gray-500 mb-1";
const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 outline-none transition focus:border-[#0F2A47] focus:ring-2 focus:ring-[#0F2A47]/10 disabled:bg-gray-50";
 
const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  driver,
  onClose,
  onUpload,
  isUploading = false,
}) => {
  const isOpen = Boolean(driver);
  const inputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<DriverDocumentType | "">("");
  const [expiryDate, setExpiryDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const previewUrlRef = useRef<string | null>(null);
 
  const openPreview = (file: File) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreview({ url, name: file.name });
  };
 
  const closePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreview(null);
  };
 
  // Reset form whenever the dialog opens; clean up preview on close
  useEffect(() => {
    if (!isOpen) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreview(null);
      return;
    }
    setDocumentType("");
    setExpiryDate("");
    setFiles([]);
    setError(null);
    setDragActive(false);
  }, [isOpen]);
 
  // Close on Escape (preview first, then dialog)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (previewUrlRef.current) {
        closePreview();
        return;
      }
      if (!isUploading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isUploading, onClose]);
 
  if (!isOpen) return null;
 
  const addFiles = (incoming: FileList | File[]) => {
    if (!documentType) {
      setError("Please select a document type first.");
      return;
    }
    const list = Array.from(incoming);
    const rejected: string[] = [];
    const valid = list.filter((f) => {
      if (!ACCEPTED_MIME.includes(f.type)) {
        rejected.push(`${f.name}: unsupported format`);
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        rejected.push(`${f.name}: exceeds ${MAX_SIZE_MB} MB`);
        return false;
      }
      return true;
    });
    setFiles(valid);
    setError(rejected.length ? rejected.join(", ") : null);
  };
 
  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));
 
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isUploading || !documentType) return;
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentType) {
      setError("Please select a document type.");
      return;
    }
    if (files.length === 0) {
      setError("Please choose at least one file to upload.");
      return;
    }
    setError(null);
    await onUpload({
      documentType,
      expiryDate: expiryDate || undefined,
      files,
    });
  };
 
  const canSubmit = !!documentType && files.length > 0 && !isUploading;
 
  const documentTypeLabel = documentType;
 
  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-3"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isUploading) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-upload-title"
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] whitespace-normal"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600 shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <h2 id="doc-upload-title" className="text-sm font-semibold text-gray-900">
                Upload Documents
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {driver ? (
                  <>
                    For driver{" "}
                    <span className="font-semibold text-gray-700">{driver.driver_name}</span>
                  </>
                ) : (
                  "Attach documents to this driver"
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close"
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
 
        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                Document Type <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={documentTypeOptions}
                value={documentTypeOptions.find((option) => option.value === documentType) || null}
                onChange={(option) => {
                  setDocumentType(option ? option.value : "");
                  setError(null);
                }}
                placeholder="Select type"
                searchPlaceholder="Search type..."
                labelKey="value"
                displayKey="label"
                allowClear={false}
                disabled={isUploading}
                className="w-full"
                buttonClassName="px-3 py-2 text-[13px] font-normal border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="doc-expiry" className={labelCls}>
                Expiry Date
              </label>
              <div className={isUploading ? "pointer-events-none opacity-60" : ""}>
                <CustomDatePicker
                  id="doc-expiry"
                  value={expiryDate ? new Date(expiryDate) : null}
                  onChange={(date) => setExpiryDate(date ? formatDate(date, "YYYY-MM-DD") : "")}
                  placeholder="DD/MM/YYYY"
                  className="!px-3 !py-2 !pr-10 !text-[13px] !border-gray-200"
                />
              </div>
            </div>
          </div>
 
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            title={documentType ? undefined : "At first choose dropdown value"}
            onClick={() => {
              if (isUploading) return;
              if (!documentType) {
                setError("Please select a document type first.");
                return;
              }
              inputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              if (isUploading) return;
              if (!documentType) {
                setError("Please select a document type first.");
                return;
              }
              inputRef.current?.click();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed px-4 py-7 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0F2A47]/20 ${
              dragActive
                ? "border-blue-500 bg-blue-50/60"
                : "border-gray-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
            } ${isUploading || !documentType ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-full mb-2 transition-colors ${
                dragActive ? "bg-blue-100 text-blue-600" : "bg-white text-gray-400 shadow-sm"
              }`}
            >
              <UploadCloud size={20} />
            </div>
            <p className="text-[13px] font-medium text-gray-700">
              {dragActive ? (
                "Drop files here"
              ) : (
                <>
                  <span className="text-blue-600">Click to browse</span> or drag & drop
                </>
              )}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              PDF, JPG, PNG or WEBP · up to {MAX_SIZE_MB} MB each
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPT}
              disabled={isUploading || !documentType}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
 
          {/* Selected files */}
          {files.length > 0 && (
            <div>
              <p className={labelCls}>
                Selected Files <span className="text-gray-400 normal-case">({files.length})</span>
              </p>
              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {files.map((file, idx) => {
                  return (
                    <li
                      key={`${file.name}-${file.size}`}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
                    >
                      <FileThumb file={file} onPreview={() => openPreview(file)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-gray-800" title={file.name}>
                          {file.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <p className="text-[11px] text-gray-400">{formatSize(file.size)}</p>
                          {documentTypeLabel ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                              {documentTypeLabel}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300">No type selected</span>
                          )}
                        </div>
                      </div>
                      {isUploading ? (
                        <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          aria-label={`Remove ${file.name}`}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
 
          {error && (
            <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
 
        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 bg-slate-50/60 rounded-b-xl">
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            {files.length > 0 && documentType ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-500" /> Ready to upload
              </>
            ) : (
              "* Required fields"
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="h-10 px-4 bg-white text-[#0F2A47] border border-[#C5CFDB] rounded font-medium text-sm transition-colors hover:bg-[#F1F4F8] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 h-10 px-4 bg-blue-700 text-white border border-blue-400 rounded font-medium text-sm transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={15} />
                  Upload{files.length > 1 ? ` ${files.length} files` : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
 
      {/* Image preview overlay */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePreview();
          }}
        >
          <div className="relative max-w-4xl">
            <img
              src={preview.url}
              alt={preview.name}
              className="max-w-full max-h-[80vh] rounded-lg object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={closePreview}
              aria-label="Close preview"
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white text-gray-600 shadow-md hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
            </button>
            <p className="mt-2 text-center text-xs text-gray-300 truncate">{preview.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default DocumentUploadDialog;
 