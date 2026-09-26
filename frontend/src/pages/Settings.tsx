import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  User as UserIcon,
  Shield,
  CreditCard,
  Coins,
  Bell,
  Key,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Database,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { apiErrorMessage } from "@/api/client";
import { updateProfileRequest, changePasswordRequest, listApiKeysRequest, createApiKeyRequest, revokeApiKeyRequest } from "@/api/settings";
import { fetchCreditTransactions } from "@/api/credits";
import { formatRelativeTime } from "@/utils/format";
import { clearLocalWorkspaceState, clearPreferences } from "@/utils/preferences";
import type { ThemePref, GenerationTypePref } from "@/utils/preferences";

const TABS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "interface", label: "Interface", icon: SlidersHorizontal },
  { id: "generation", label: "Generation", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "credits", label: "Credits", icon: Coins },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data", icon: Database },
] as const;

export default function Settings() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("appearance");
  const { user } = useAuth();

  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-10 grid md:grid-cols-[200px_1fr] gap-8">
      <nav className="space-y-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              tab === t.id ? "bg-accent text-white font-semibold" : "text-ink-muted hover:text-ink hover:bg-panel-secondary"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </nav>

      <div>
        {tab === "appearance" && <AppearanceTab />}
        {tab === "interface" && <InterfaceTab />}
        {tab === "generation" && <GenerationTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "profile" && (user ? <ProfileTab /> : <SignedOutNotice what="your profile" />)}
        {tab === "subscription" && (user ? <SubscriptionTab /> : <SignedOutNotice what="subscription details" />)}
        {tab === "credits" && (user ? <CreditsTab /> : <SignedOutNotice what="credit history" />)}
        {tab === "api-keys" && (user ? <ApiKeysTab /> : <SignedOutNotice what="API keys" />)}
        {tab === "security" && (user ? <SecurityTab /> : <SignedOutNotice what="password & security" />)}
        {tab === "data" && <DataTab />}
      </div>
    </div>
  );
}

/** Shown for account-bound tabs when browsing as a guest — the app is fully
 *  usable without an account, but a handful of settings (profile, billing,
 *  API keys) genuinely require one to have anything to show. */
function SignedOutNotice({ what }: { what: string }) {
  return (
    <Section title="Sign in required">
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-ink-muted">
        You're browsing as a guest, so there's no account to show {what} for. Everything else on this
        page — appearance, interface, generation defaults and notifications — applies right away and is
        saved on this device.
      </div>
    </Section>
  );
}

function AppearanceTab() {
  const { preferences, setPreference } = usePreferences();
  const options: { value: ThemePref; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];
  return (
    <Section title="Appearance">
      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Theme</p>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => setPreference("theme", o.value)}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
              preferences.theme === o.value
                ? "bg-accent text-white border-accent font-semibold"
                : "border-border text-ink hover:bg-panel-secondary"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-muted mt-3">
        Applies instantly and is remembered on this device. "System" follows your OS setting.
      </p>
    </Section>
  );
}

function InterfaceTab() {
  const { preferences, setPreference } = usePreferences();
  return (
    <Section title="Interface">
      <Toggle
        label="Compact mode"
        description="Tightens spacing on cards, buttons and inputs across the app."
        checked={preferences.compactMode}
        onChange={(v) => setPreference("compactMode", v)}
      />
      <Toggle
        label="Reduce motion"
        description="Turns off transitions and hover animation throughout the interface."
        checked={preferences.reducedMotion}
        onChange={(v) => setPreference("reducedMotion", v)}
      />
    </Section>
  );
}

function GenerationTab() {
  const { preferences, setPreference } = usePreferences();
  const types: { value: GenerationTypePref; label: string }[] = [
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
  ];
  const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
  const qualities = ["Standard", "High"];

  return (
    <Section title="Generation defaults">
      <p className="text-xs text-ink-muted mb-5">
        Used to pre-fill new Image and Video studio sessions. You can still change any option per generation.
      </p>

      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Default creation type</p>
      <div className="flex gap-2 mb-5">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setPreference("defaultGenerationType", t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              preferences.defaultGenerationType === t.value
                ? "bg-accent text-white border-accent font-semibold"
                : "border-border text-ink hover:bg-panel-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Default aspect ratio</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {aspectRatios.map((ar) => (
          <button
            key={ar}
            onClick={() => setPreference("defaultAspectRatio", ar)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              preferences.defaultAspectRatio === ar
                ? "bg-accent text-white border-accent font-semibold"
                : "border-border text-ink hover:bg-panel-secondary"
            }`}
          >
            {ar}
          </button>
        ))}
      </div>

      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Default quality</p>
      <div className="flex gap-2">
        {qualities.map((q) => (
          <button
            key={q}
            onClick={() => setPreference("defaultQuality", q)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              preferences.defaultQuality === q
                ? "bg-accent text-white border-accent font-semibold"
                : "border-border text-ink hover:bg-panel-secondary"
            }`}
          >
            {q}
          </button>
        ))}
      </div>
    </Section>
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
        <div className="w-16 h-16 rounded-full bg-accent text-white font-bold text-2xl flex items-center justify-center">
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
  const { preferences, setPreference } = usePreferences();
  return (
    <Section title="Notifications">
      <Toggle
        label="Notify me when a generation completes"
        description="Shows an in-app notification and adds it to your activity feed."
        checked={preferences.notifyOnComplete}
        onChange={(v) => setPreference("notifyOnComplete", v)}
      />
      <Toggle
        label="Product updates & announcements"
        checked={preferences.notifyProductUpdates}
        onChange={(v) => setPreference("notifyProductUpdates", v)}
      />
      <p className="text-xs text-ink-muted mt-3">Saved on this device and remembered across sessions.</p>
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

function DataTab() {
  const { toast } = useToast();
  const { resetPreferences } = usePreferences();

  function handleClearPreferences() {
    clearPreferences();
    resetPreferences();
    toast("Preferences reset to defaults", "info");
  }

  function handleClearWorkspaceState() {
    clearLocalWorkspaceState();
    toast("Local workspace state cleared", "info");
  }

  return (
    <Section title="Data">
      <div className="space-y-3">
        <DataAction
          title="Clear local preferences"
          description="Resets theme, interface and generation defaults back to their defaults on this device."
          actionLabel="Clear preferences"
          onClick={handleClearPreferences}
        />
        <DataAction
          title="Clear recent workspace state"
          description="Clears your saved Canvas graph and recent prompt history stored on this device."
          actionLabel="Clear workspace state"
          onClick={handleClearWorkspaceState}
        />
      </div>
    </Section>
  );
}

function DataAction({ title, description, actionLabel, onClick }: { title: string; description: string; actionLabel: string; onClick: () => void }) {
  return (
    <div className="rounded-xl border border-border p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-ink-muted mt-0.5">{description}</p>
      </div>
      <button onClick={onClick} className="btn-secondary text-xs !py-1.5 !px-3 whitespace-nowrap">{actionLabel}</button>
    </div>
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

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0 gap-4">
      <div>
        <span className="text-sm text-ink block">{label}</span>
        {description && <span className="text-xs text-ink-muted">{description}</span>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`shrink-0 rounded-full transition-colors relative ${checked ? "bg-accent" : "bg-panel-secondary"}`}
        style={{ height: 22, width: 40 }}
      >
        <span className={`absolute top-0.5 rounded-full bg-white transition-transform ${checked ? "translate-x-[19px]" : "translate-x-0.5"}`} style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );
}
