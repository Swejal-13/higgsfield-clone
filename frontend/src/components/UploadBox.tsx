import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadAsset } from "@/api/assets";
import { useToast } from "@/contexts/ToastContext";
import { mediaUrl } from "@/utils/format";

interface Props {
  accept?: Record<string, string[]>;
  onUploaded: (url: string, assetId: string) => void;
  currentUrl?: string;
  onClear?: () => void;
  label?: string;
  compact?: boolean;
}

export function UploadBox({ accept, onUploaded, currentUrl, onClear, label = "Drop image or click to upload", compact }: Props) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (file.size > 25 * 1024 * 1024) {
        toast("File too large. Maximum size is 25MB.", "error");
        return;
      }
      setUploading(true);
      try {
        const asset = await uploadAsset(file);
        onUploaded(asset.url, asset._id);
      } catch (err) {
        toast("Upload failed. Please try a different file.", "error");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || { "image/png": [], "image/jpeg": [], "image/webp": [] },
    multiple: false,
  });

  if (currentUrl) {
    return (
      <div className={`relative rounded-xl overflow-hidden border border-border ${compact ? "h-24" : "h-40"}`}>
        <img src={mediaUrl(currentUrl)} alt="Reference" className="w-full h-full object-cover" />
        {onClear && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
          >
            <X size={13} className="text-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
        compact ? "h-24" : "h-40"
      } ${isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 bg-panel"}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <Loader2 size={18} className="text-accent animate-spin" />
      ) : (
        <>
          <Upload size={compact ? 16 : 20} className="text-ink-muted" />
          <p className="text-xs text-ink-muted text-center px-4">{label}</p>
        </>
      )}
    </div>
  );
}
