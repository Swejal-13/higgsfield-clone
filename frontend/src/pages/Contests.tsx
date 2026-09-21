import { Trophy, Calendar, Users } from "lucide-react";
import { mediaUrl } from "@/utils/format";

const ACTIVE = [
  { id: 1, title: "Neon Dreams Challenge", ends: "5 days left", entries: 342, thumb: "/demo/images/community-1.svg" },
  { id: 2, title: "Cinematic Motion Contest", ends: "12 days left", entries: 198, thumb: "/demo/images/community-2.svg" },
];
const PAST = [
  { id: 3, title: "Golden Hour Portraits", winner: "mira.visuals", thumb: "/demo/images/community-3.svg" },
  { id: 4, title: "Product Spin Showcase", winner: "kenji.ai", thumb: "/demo/images/community-4.svg" },
];
const LEADERBOARD = [
  { rank: 1, name: "studio.nova", points: 4820 },
  { rank: 2, name: "lucid.frames", points: 4310 },
  { rank: 3, name: "orbitlab", points: 3902 },
  { rank: 4, name: "wanderline", points: 3557 },
];

export default function Contests() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-12 space-y-14">
      <div className="text-center">
        <Trophy size={28} className="text-accent mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Contests</h1>
        <p className="text-sm text-ink-muted mt-2">Compete with the community and get featured.</p>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4">Active contests</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ACTIVE.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-panel overflow-hidden flex">
              <img src={mediaUrl(c.thumb)} className="w-32 h-32 object-cover" alt={c.title} />
              <div className="p-4 flex-1">
                <p className="text-sm font-semibold">{c.title}</p>
                <p className="text-xs text-ink-muted mt-1 flex items-center gap-1.5"><Calendar size={12} /> {c.ends}</p>
                <p className="text-xs text-ink-muted mt-1 flex items-center gap-1.5"><Users size={12} /> {c.entries} entries</p>
                <button className="btn-secondary text-xs !py-1.5 !px-3 mt-3">Submit entry</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Leaderboard</h2>
        <div className="rounded-2xl border border-border bg-panel divide-y divide-border">
          {LEADERBOARD.map((l) => (
            <div key={l.rank} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-accent w-5">{l.rank}</span>
                <span className="text-sm">{l.name}</span>
              </div>
              <span className="text-xs text-ink-muted">{l.points.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Past contests</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {PAST.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-panel overflow-hidden flex">
              <img src={mediaUrl(c.thumb)} className="w-32 h-32 object-cover" alt={c.title} />
              <div className="p-4">
                <p className="text-sm font-semibold">{c.title}</p>
                <p className="text-xs text-ink-muted mt-1">Winner: {c.winner}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
