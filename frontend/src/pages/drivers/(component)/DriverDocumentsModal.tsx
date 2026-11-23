import { useEffect, useRef, useState } from "react";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import CustomDatePicker from "@/components/ui/DatePicker";
import { formatDate } from "@/utils/dateRangeUtils";
import apiService from "@/services/api";
import type { DriverDocument, DriverRecord } from "@/types/drivers/types";
import ConfirmationModal from "@/components/ConfirmationModal";
import { toast } from "react-toastify";
import {
  FileText,
  UploadCloud,
  X,
  File as FileIcon,
  CheckCircle2,
} from "lucide-react";

export const DOCUMENT_TYPES = [
  { value: "Driving License", label: "Driving License" },
  { value: "Aadhar Card", label: "Aadhar Card" },
  // { value: "PAN Card", label: "PAN Card" },
  // { value: "Voter Card", label: "Voter Card" },
  // { value: "Passport", label: "Passport" },
] as const;

export type DriverDocumentType = (typeof DOCUMENT_TYPES)[number]["value"];

export interface SelectedFile {
  file: File;
  documentType: DriverDocumentType;
}

export interface DocumentUploadPayload {
  expiryDate?: string;
  files: SelectedFile[];
}

interface DriverDocumentsModalProps {
  driver: DriverRecord | null;
  onClose: () => void;
  onUpload: (payload: DocumentUploadPayload) => Promise<void> | void;
  isUploading?: boolean;
}

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.svg,.webp";
const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
];
const MAX_SIZE_MB = 5;

const formatExpiry = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

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
        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
      />
    );
  }

  return (
    <div
      onClick={onPreview}
      className={`flex items-center justify-center w-full h-full ${
        isPdf ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isPdf ? <FileText size={22} /> : <FileIcon size={22} />}
    </div>
  );
};

// Renders an uploaded document thumbnail directly from its stored file path
const DriverDocThumb: React.FC<{
  name: string;
  url: string | null;
  isImage: boolean;
  isPdf: boolean;
  onOpen?: () => void;
}> = ({ name, url, isImage, isPdf, onOpen }) => (
  <div
    role="button"
    title={url ? `Preview ${name}` : undefined}
    onClick={onOpen}
    className="block w-full h-full cursor-pointer bg-slate-50"
  >
    {isImage && url ? (
      <img
        src={url}
        alt={name}
        className="w-full h-full object-cover hover:opacity-90 transition"
      />
    ) : (
      <div
        className={`flex items-center justify-center w-full h-full ${
          isPdf ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"
        }`}
      >
        {isPdf ? <FileText size={22} /> : <FileIcon size={22} />}
      </div>
    )}
  </div>
);

// Strip the "/api" suffix so /uploads/... file paths resolve on the backend origin
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(
  /\/api\/?$/,
  ""
);

const labelCls = "block text-[11px] font-semibold tracking-wide uppercase text-gray-500 mb-2.5";
const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 outline-none transition focus:border-[#0F2A47] focus:ring-2 focus:ring-[#0F2A47]/10 disabled:bg-gray-50";

const DriverDocumentsModal: React.FC<DriverDocumentsModalProps> = ({
  driver,
  onClose,
  onUpload,
  isUploading = false,
}) => {
  const isOpen = Boolean(driver);
  const driverId = driver?.id;
  const inputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<DriverDocumentType | "">("");
  const [expiryDate, setExpiryDate] = useState("");
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [existingDocs, setExistingDocs] = useState<DriverDocument[]>([]);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [docToDelete, setDocToDelete] = useState<DriverDocument | null>(null);

  const confirmDeleteDoc = async () => {
    const doc = docToDelete;
    if (!doc || !driverId || deletingDocId !== null) return;
    try {
      setDocToDelete(null);
      setDeletingDocId(doc.id);
      await apiService.deleteDriverDocument(driverId, doc.id);
      setExistingDocs((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeletingDocId(null);
    }
  };

  // Load already-uploaded documents each time the dialog opens
  useEffect(() => {
    if (!isOpen || !driverId) {
      setExistingDocs([]);
      return;
    }
    let cancelled = false;
    apiService
      .getDriverDocuments(driverId)
      .then((res) => {
        if (!cancelled) setExistingDocs(res?.data?.data || []);
      })
      .catch(() => {
        if (!cancelled) setExistingDocs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, driverId]);

  const openPreview = (file: File) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreview({ url, name: file.name });
  };

  // Public URL for an uploaded doc — same scheme as vehicle documents
  const docFileUrl = (doc: DriverDocument) => {
    if (doc.file_path) return `${API_ORIGIN}${doc.file_path}`;
    if (doc.document_name.startsWith("uploads/"))
      return `${API_ORIGIN}/${doc.document_name}`;
    return null;
  };

  // Preview an uploaded doc: images open in the overlay, other files open in a new tab
  const openDocPreview = (doc: DriverDocument, url: string) => {
    const extSource = doc.file_path || doc.document_name;
    const name = doc.document_name.split("/").pop() || doc.document_name;
    if (/\.(jpe?g|png|webp|svg)$/i.test(extSource)) {
      setPreview({ url, name });
    } else {
      window.open(url, "_blank");
    }
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
      if (preview) {
        closePreview();
        return;
      }
      if (!isUploading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isUploading, onClose, preview]);

  if (!isOpen || !driver) return null;

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
    // Replace only files of the same document type; keep other types' selections
    const type = documentType;
    setFiles((prev) => [
      ...prev.filter((item) => item.documentType !== type),
      ...valid.map((f) => ({ file: f, documentType: type })),
    ]);
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
      expiryDate: expiryDate || undefined,
      files,
    });
  };

  const canSubmit = files.length > 0 && !isUploading;

  const typeLabelOf = (type: string) =>
    DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;

  // Types already used by selected files or uploaded docs can't be picked again
  const usedTypes = new Set<string>([
    ...files.map((f) => f.documentType),
    ...existingDocs.map((d) => d.document_type),
  ]);

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
                For driver <span className="font-semibold text-gray-700">{driver.driver_name}</span>
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
                options={[...DOCUMENT_TYPES]}
                value={DOCUMENT_TYPES.find((t) => t.value === documentType) || null}
                onChange={(option) => {
                  setDocumentType(option ? option.value : "");
                  setError(null);
                }}
                placeholder="Select type"
                searchPlaceholder="Search type..."
                labelKey="value"
                displayKey="label"
                isOptionDisabled={(t) => usedTypes.has(t.value)}
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
                  minDate={new Date()}
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
            className={`flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0F2A47]/20 ${
              dragActive
                ? "border-blue-500 bg-blue-50/60"
                : "border-gray-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
            } ${isUploading || !documentType ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full mb-1.5 transition-colors ${
                dragActive ? "bg-blue-100 text-blue-600" : "bg-white text-gray-400 shadow-sm"
              }`}
            >
              <UploadCloud size={18} />
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
              PDF, JPG, PNG, SVG or WEBP · up to {MAX_SIZE_MB} MB each
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
              <ul className="grid grid-cols-2 gap-3 mt-1.5 max-h-64 overflow-y-auto pr-1">
                {files.map((item, idx) => {
                  return (
                    <li
                      key={`${item.documentType}-${item.file.name}-${item.file.size}`}
                      className="relative rounded-lg border border-gray-100 bg-white overflow-hidden"
                    >
                      <div className="h-24 bg-slate-50">
                        <FileThumb file={item.file} onPreview={() => openPreview(item.file)} />
                      </div>
                      {isUploading ? (
                        <span className="absolute top-1.5 right-1.5 block h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin bg-white/80" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          aria-label={`Remove ${item.file.name}`}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white shadow-md ring-1 ring-red-200 text-red-500 hover:text-red-800 hover:bg-red-50 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                      <div className="px-2.5 py-2">
                        <p
                          className="truncate text-[12px] font-medium text-gray-800"
                          title={item.file.name}
                        >
                          {item.file.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-gray-400">
                            {formatSize(item.file.size)}
                          </span>
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                            {typeLabelOf(item.documentType)}
                          </span>
                          {expiryDate && (
                            <span className="text-[10px] text-gray-400">
                              Exp: {formatExpiry(expiryDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Uploaded documents */}
          {existingDocs.length > 0 && (
            <div>
              <p className={labelCls}>
                Uploaded Documents{" "}
                <span className="text-gray-400 normal-case">({existingDocs.length})</span>
              </p>
              <ul className="grid grid-cols-2 gap-3 mt-1.5 max-h-64 overflow-y-auto pr-1">
                {existingDocs.map((doc) => {
                  const displayName = doc.document_name.split("/").pop() || doc.document_name;
                  const extSource = doc.file_path || doc.document_name;
                  const isImage = /\.(jpe?g|png|webp|svg)$/i.test(extSource);
                  const isPdf = /\.pdf$/i.test(extSource);
                  const fileUrl = docFileUrl(doc);
                  const expiry = formatExpiry(doc.expiry_date);
                  const isDeleting = deletingDocId === doc.id;
                  return (
                    <li
                      key={doc.id}
                      className="relative rounded-lg border border-gray-100 bg-white overflow-hidden"
                    >
                      <div className="h-24 bg-slate-50">
                        <DriverDocThumb
                          name={displayName}
                          url={fileUrl}
                          isImage={isImage}
                          isPdf={isPdf}
                          onOpen={fileUrl ? () => openDocPreview(doc, fileUrl) : undefined}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocToDelete(doc)}
                        disabled={isDeleting}
                        aria-label={`Delete ${displayName}`}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white shadow-md ring-1 ring-red-200 text-red-500 hover:text-red-800 hover:bg-red-50 transition-colors disabled:opacity-60"
                      >
                        {isDeleting ? (
                          <span className="block h-3 w-3 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                      <div className="px-2.5 py-2">
                        <p
                          className="truncate text-[12px] font-medium text-gray-800"
                          title={displayName}
                        >
                          {displayName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                            {typeLabelOf(doc.document_type)}
                          </span>
                          {expiry && (
                            <span className="text-[10px] text-gray-400">Exp: {expiry}</span>
                          )}
                        </div>
                      </div>
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

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={confirmDeleteDoc}
        title="Delete Document"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-gray-900">
              {docToDelete?.document_name.split("/").pop() ?? "this document"}
            </strong>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
      />
    </div>
  );
};

export default DriverDocumentsModal;
