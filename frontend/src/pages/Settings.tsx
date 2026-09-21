import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Shield, CreditCard, Coins, Bell, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";
import { updateProfileRequest, changePasswordRequest, listApiKeysRequest, createApiKeyRequest, revokeApiKeyRequest } from "@/api/settings";
import { fetchCreditTransactions } from "@/api/credits";
import { formatRelativeTime } from "@/utils/format";

const TABS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "credits", label: "Credits", icon: Coins },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
] as const;

export default function Settings() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("profile");
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-10 grid md:grid-cols-[200px_1fr] gap-8">
      <nav className="space-y-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              tab === t.id ? "bg-accent text-black font-semibold" : "text-ink-muted hover:text-ink hover:bg-panel-secondary"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </nav>

      <div>
        {tab === "profile" && <ProfileTab />}
        {tab === "subscription" && <SubscriptionTab />}
        {tab === "credits" && <CreditsTab />}
        {tab === "api-keys" && <ApiKeysTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user!.name);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await updateProfileRequest({ name });
      setUser({ ...user!, ...updated });
      toast("Profile updated", "success");
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Profile">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-accent text-black font-bold text-2xl flex items-center justify-center">
          {user!.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold">{user!.name}</p>
          <p className="text-xs text-ink-muted">{user!.email}</p>
        </div>
      </div>
      <label className="text-xs font-medium text-ink-muted mb-1 block">Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mb-4" />
      <button onClick={save} disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save changes"}</button>
    </Section>
  );
}

function SubscriptionTab() {
  const { user } = useAuth();
  return (
    <Section title="Subscription">
      <div className="rounded-xl border border-border bg-panel-secondary p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold capitalize">{user!.plan} plan</p>
          <p className="text-xs text-ink-muted mt-1">Renews automatically each month (simulated).</p>
        </div>
        <a href="/pricing" className="btn-secondary text-xs !py-1.5 !px-3">Change plan</a>
      </div>
    </Section>
  );
}

function CreditsTab() {
  const { user } = useAuth();
  const { data: transactions = [] } = useQuery({ queryKey: ["credit-tx"], queryFn: fetchCreditTransactions });
  return (
    <Section title="Credits">
      <div className="rounded-xl border border-border bg-panel-secondary p-4 mb-5 flex items-center justify-between">
        <span className="text-sm text-ink-muted">Current balance</span>
        <span className="text-xl font-bold text-accent">{user!.credits.toLocaleString()}</span>
      </div>
      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Recent transactions</p>
      <div className="rounded-xl border border-border divide-y divide-border">
        {transactions.length === 0 && <p className="text-sm text-ink-muted p-4">No transactions yet.</p>}
        {transactions.map((t) => (
          <div key={t._id} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <p className="text-sm capitalize">{t.reason}</p>
              <p className="text-xs text-ink-muted">{formatRelativeTime(t.createdAt)}</p>
            </div>
            <span className={`text-sm font-semibold ${t.amount > 0 ? "text-emerald-400" : "text-ink"}`}>
              {t.amount > 0 ? "+" : ""}{t.amount}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ApiKeysTab() {
  const { toast } = useToast();
  const { data: keys = [], refetch } = useQuery({ queryKey: ["settings-api-keys"], queryFn: listApiKeysRequest });
  const [newKey, setNewKey] = useState<string | null>(null);

  async function generate() {
    const key = await createApiKeyRequest("Default key");
    setNewKey(key.rawKey);
    refetch();
  }
  async function revoke(id: string) {
    await revokeApiKeyRequest(id);
    refetch();
    toast("Key revoked", "info");
  }

  return (
    <Section title="API Keys">
      <button onClick={generate} className="btn-primary text-sm mb-4">Create API key</button>
      {newKey && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 mb-4 text-xs font-mono text-accent break-all">{newKey}</div>
      )}
      <div className="rounded-xl border border-border divide-y divide-border">
        {keys.length === 0 && <p className="text-sm text-ink-muted p-4">No API keys yet.</p>}
        {keys.map((k) => (
          <div key={k._id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm">{k.label}</p>
              <p className="text-xs text-ink-muted font-mono">{k.keyPrefix}</p>
            </div>
            {!k.revoked && <button onClick={() => revoke(k._id)} className="text-xs text-red-400 hover:underline">Revoke</button>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function NotificationsTab() {
  const [emailOn, setEmailOn] = useState(true);
  const [productOn, setProductOn] = useState(false);
  return (
    <Section title="Notifications">
      <Toggle label="Email me when a generation completes" checked={emailOn} onChange={setEmailOn} />
      <Toggle label="Product updates & announcements" checked={productOn} onChange={setProductOn} />
    </Section>
  );
}

function SecurityTab() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await changePasswordRequest(current, next);
      toast("Password updated", "success");
      setCurrent("");
      setNext("");
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Security">
      <form onSubmit={save} className="space-y-3 max-w-xs">
        <input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" className="input-field" />
        <input type="password" required minLength={6} value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password" className="input-field" />
        <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Updating..." : "Change password"}</button>
      </form>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-lg font-bold mb-5">{title}</h1>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-ink">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5.5 rounded-full transition-colors relative ${checked ? "bg-accent" : "bg-panel-secondary"}`}
        style={{ height: 22, width: 40 }}
      >
        <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${checked ? "translate-x-[19px]" : "translate-x-0.5"}`} style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );
}
