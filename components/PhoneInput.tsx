import React, { useEffect, useRef, useState } from "react";

const COUNTRIES = [
  { code: "UY", flag: "🇺🇾", dialCode: "+598", name: "Uruguay" },
  { code: "AR", flag: "🇦🇷", dialCode: "+54",  name: "Argentina" },
  { code: "BR", flag: "🇧🇷", dialCode: "+55",  name: "Brasil" },
  { code: "CL", flag: "🇨🇱", dialCode: "+56",  name: "Chile" },
  { code: "CO", flag: "🇨🇴", dialCode: "+57",  name: "Colombia" },
  { code: "VE", flag: "🇻🇪", dialCode: "+58",  name: "Venezuela" },
  { code: "PE", flag: "🇵🇪", dialCode: "+51",  name: "Perú" },
  { code: "MX", flag: "🇲🇽", dialCode: "+52",  name: "México" },
  { code: "PY", flag: "🇵🇾", dialCode: "+595", name: "Paraguay" },
  { code: "BO", flag: "🇧🇴", dialCode: "+591", name: "Bolivia" },
  { code: "US", flag: "🇺🇸", dialCode: "+1",   name: "EE.UU." },
  { code: "ES", flag: "🇪🇸", dialCode: "+34",  name: "España" },
  { code: "IT", flag: "🇮🇹", dialCode: "+39",  name: "Italia" },
  { code: "PT", flag: "🇵🇹", dialCode: "+351", name: "Portugal" },
] as const;

// Sort by dialCode length descending so longer codes (e.g. +595) match before shorter ones (e.g. +59)
const SORTED = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

function parsePhone(raw: string): { dialCode: string; localNumber: string } {
  const v = raw.trim();
  if (!v) return { dialCode: "+598", localNumber: "" };
  for (const c of SORTED) {
    if (v.startsWith(c.dialCode)) {
      return { dialCode: c.dialCode, localNumber: v.slice(c.dialCode.length) };
    }
  }
  // Legacy value without dial code — assume Uruguay and strip leading zeros
  return { dialCode: "+598", localNumber: v.replace(/^0+/, "") };
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "99 123 456",
  className = "",
}) => {
  const [dialCode, setDialCode] = useState(() => parsePhone(value).dialCode);
  const [localNumber, setLocalNumber] = useState(() => parsePhone(value).localNumber);
  const lastEmitted = useRef("");

  // Sync internal state only when the value changed from outside (not from our own emit)
  useEffect(() => {
    if (value !== lastEmitted.current) {
      const p = parsePhone(value);
      setDialCode(p.dialCode);
      setLocalNumber(p.localNumber);
    }
  }, [value]);

  const emit = (dial: string, local: string) => {
    // Strip leading zeros so stored/wa.me value is always clean (e.g. +59899123456)
    const stripped = local.replace(/^0+/, "");
    const result = stripped ? `${dial}${stripped}` : "";
    lastEmitted.current = result;
    onChange(result);
  };

  return (
    <div
      className={`flex w-full overflow-hidden rounded-2xl border-2 border-transparent bg-shell-subtle transition-all focus-within:border-brand focus-within:bg-shell ${className}`}
    >
      <select
        value={dialCode}
        onChange={(e) => {
          setDialCode(e.target.value);
          emit(e.target.value, localNumber);
        }}
        className="shrink-0 cursor-pointer bg-transparent py-4 pl-3 pr-1 text-sm text-ink-strong outline-none"
        aria-label="Código de país"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.dialCode}>
            {c.flag} {c.dialCode}
          </option>
        ))}
      </select>
      <div className="my-3 w-px shrink-0 bg-line-subtle" />
      <input
        type="tel"
        value={localNumber}
        onChange={(e) => {
          setLocalNumber(e.target.value);
          emit(dialCode, e.target.value);
        }}
        placeholder={placeholder}
        autoComplete="tel-national"
        className="min-w-0 flex-1 bg-transparent px-3 py-4 text-sm text-ink-strong outline-none"
      />
    </div>
  );
};

export default PhoneInput;
