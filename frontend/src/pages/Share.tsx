import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { mediaUrl } from "@/utils/format";
import { PageLoader } from "@/components/PageLoader";

export default function Share() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["share", id],
    queryFn: async () => {
      const { data } = await api.get(`/assets`, { params: { search: "" } });
      return (data.data.assets as any[]).find((a) => a._id === id);
    },
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center px-4">
        <p className="text-sm text-ink-muted">This shared item is unavailable or private.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full rounded-2xl overflow-hidden border border-border bg-panel">
        {data.type === "video" ? (
          <video src={mediaUrl(data.url)} controls className="w-full" />
        ) : (
          <img src={mediaUrl(data.url)} alt={data.filename} className="w-full" />
        )}
      </div>
      <p className="text-xs text-ink-muted mt-4">Shared from Higgsfield</p>
    </div>
  );
}
