import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download, Wand2, Layers, Maximize2, Heart, Share2, Trash2, Film, Sparkles,
} from "lucide-react";
import { Asset } from "@/types";
import { mediaUrl } from "@/utils/format";
import { useToast } from "@/contexts/ToastContext";
import { updateAsset, deleteAssetRequest } from "@/api/assets";

interface Props {
  asset: Asset;
  onOpenFullscreen?: () => void;
  onDeleted?: () => void;
  onVariation?: () => void;
  showActions?: boolean;
}

export function MediaCard({ asset, onOpenFullscreen, onDeleted, onVariation, showActions = true }: Props) {
  const [favorite, setFavorite] = useState(asset.favorite);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleDownload() {
    const link = document.createElement("a");
    link.href = mediaUrl(asset.url);
    link.download = asset.filename;
    link.target = "_blank";
    link.click();
    toast("Download started", "success");
  }

  async function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);
    try {
      await updateAsset(asset._id, { favorite: next });
    } catch {
      setFavorite(!next);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteAssetRequest(asset._id);
      toast("Deleted", "success");
      onDeleted?.();
    } catch {
      toast("Failed to delete", "error");
    }
  }

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${asset._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast("Share link copied to clipboard", "success");
  }

  function handleImageToVideo(e: React.MouseEvent) {
    e.stopPropagation();
    navigate(`/video?sourceAsset=${asset._id}&sourceUrl=${encodeURIComponent(asset.url)}`);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    navigate(`/image/edit?sourceAsset=${asset._id}&sourceUrl=${encodeURIComponent(asset.url)}`);
  }

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-border bg-panel cursor-pointer" onClick={onOpenFullscreen}>
      <div className="aspect-square w-full bg-panel-secondary overflow-hidden">
        {asset.type === "video" ? (
          <video src={mediaUrl(asset.url)} className="w-full h-full object-cover" muted loop playsInline
            onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
        ) : (
          <img src={mediaUrl(asset.url)} alt={asset.filename} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        )}
      </div>

      {asset.type === "video" && (
        <span className="absolute top-2 left-2 bg-black/60 rounded-full p-1.5">
          <Film size={12} className="text-white" />
        </span>
      )}

      {showActions && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
          <div className="flex flex-wrap gap-1.5">
            <ActionBtn icon={Download} onClick={(e) => { e.stopPropagation(); handleDownload(); }} title="Download" />
            {asset.type === "image" && <ActionBtn icon={Wand2} onClick={handleEdit} title="Edit" />}
            {asset.type === "image" && onVariation && <ActionBtn icon={Layers} onClick={(e) => { e.stopPropagation(); onVariation(); }} title="Variations" />}
            {asset.type === "image" && <ActionBtn icon={Sparkles} onClick={handleImageToVideo} title="Image → Video" />}
            {onOpenFullscreen && <ActionBtn icon={Maximize2} onClick={(e) => { e.stopPropagation(); onOpenFullscreen(); }} title="Fullscreen" />}
            <ActionBtn icon={Heart} onClick={handleFavorite} title="Favorite" active={favorite} />
            <ActionBtn icon={Share2} onClick={handleShare} title="Share" />
            <ActionBtn icon={Trash2} onClick={handleDelete} title="Delete" />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  icon: Icon, onClick, title, active,
}: { icon: typeof Download; onClick: (e: React.MouseEvent) => void; title: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
        active ? "bg-accent text-black" : "bg-black/50 text-white hover:bg-black/70"
      }`}
    >
      <Icon size={13} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
