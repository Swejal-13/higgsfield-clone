interface Props<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

export function PillSelect<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-muted mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              value === opt.value
                ? "bg-accent text-black border-accent"
                : "bg-panel text-ink-muted border-border hover:text-ink hover:border-accent/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
