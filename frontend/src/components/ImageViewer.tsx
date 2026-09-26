import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Heart, Share2, Wand2, Sparkles, Layers, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Asset } from "@/types";
import { mediaUrl } from "@/utils/format";
import { useToast } from "@/contexts/ToastContext";
import { updateAsset } from "@/api/assets";

interface Props {
  asset: Asset | null;
  onClose: () => void;
  onVariation?: () => void;
}

export function ImageViewer({ asset, onClose, onVariation }: Props) {
  const [zoom, setZoom] = useState(1);
  const [favorite, setFavorite] = useState(asset?.favorite ?? false);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!asset) return null;

  async function toggleFavorite() {
    const next = !favorite;
    setFavorite(next);
    await updateAsset(asset!._id, { favorite: next }).catch(() => setFavorite(!next));
  }

  function download() {
    const link = document.createElement("a");
    link.href = mediaUrl(asset!.url);
    link.download = asset!.filename;
    link.click();
  }

  function share() {
    navigator.clipboard.writeText(`${window.location.origin}/share/${asset!._id}`);
    toast("Share link copied", "success");
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[150] flex flex-col"
        onClick={onClose}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-sm text-white/70 truncate max-w-md">{asset.filename}</p>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {asset.type === "image" && (
              <>
                <IconBtn icon={ZoomOut} onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} />
                <IconBtn icon={ZoomIn} onClick={() => setZoom((z) => Math.min(3, z + 0.25))} />
                <IconBtn icon={Wand2} onClick={() => navigate(`/image/edit?sourceAsset=${asset._id}&sourceUrl=${encodeURIComponent(asset.url)}`)} />
                {onVariation && <IconBtn icon={Layers} onClick={onVariation} />}
                <IconBtn icon={Sparkles} onClick={() => navigate(`/video?sourceAsset=${asset._id}&sourceUrl=${encodeURIComponent(asset.url)}`)} />
              </>
            )}
            <IconBtn icon={Heart} onClick={toggleFavorite} active={favorite} />
            <IconBtn icon={Share2} onClick={share} />
            <IconBtn icon={Download} onClick={download} />
            <IconBtn icon={X} onClick={onClose} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
          {asset.type === "video" ? (
            <video src={mediaUrl(asset.url)} controls autoPlay className="max-h-full max-w-full rounded-xl" />
          ) : (
            <motion.img
              src={mediaUrl(asset.url)}
              alt={asset.filename}
              style={{ scale: zoom }}
              className="max-h-[80vh] max-w-full rounded-xl object-contain"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function IconBtn({ icon: Icon, onClick, active }: { icon: typeof X; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
        active ? "bg-accent text-white" : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      <Icon size={16} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
