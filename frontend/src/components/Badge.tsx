export function Badge({ type }: { type?: "TOP" | "NEW" | "FREE" }) {
  if (!type) return null;
  const cls = type === "TOP" ? "badge-top" : type === "NEW" ? "badge-new" : "badge-free";
  return <span className={`badge ${cls}`}>{type}</span>;
}
