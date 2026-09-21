import { useRef } from "react";
import { Wand2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  negativeValue?: string;
  onNegativeChange?: (v: string) => void;
  showNegative?: boolean;
}

export function PromptBox({ value, onChange, placeholder = "Describe the scene you imagine", negativeValue, onNegativeChange, showNegative }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="space-y-2">
      <div className="relative">
        <Wand2 size={15} className="absolute left-3.5 top-3.5 text-ink-muted" />
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input-field !pl-10 resize-none"
        />
      </div>
      {showNegative && onNegativeChange && (
        <textarea
          value={negativeValue || ""}
          onChange={(e) => onNegativeChange(e.target.value)}
          placeholder="Negative prompt — what to avoid (optional)"
          rows={2}
          className="input-field resize-none text-xs"
        />
      )}
    </div>
  );
}
