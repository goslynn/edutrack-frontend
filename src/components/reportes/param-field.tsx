import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { ReportParameter } from "@/types/reportes"

interface ParamFieldProps {
  param: ReportParameter
  value: string
  invalid?: boolean
  onChange: (value: string) => void
}

/** Campo de filtro dinámico: el control depende del `ParamType` declarado. */
export function ParamField({ param, value, invalid, onChange }: ParamFieldProps) {
  const id = `p-${param.name}`

  let control
  if (param.type === "BOOLEAN") {
    const checked = value === "true"
    control = (
      <div className="flex h-8 items-center gap-2.5">
        <Switch id={id} checked={checked} onCheckedChange={(c) => onChange(c ? "true" : "false")} />
        <span className="text-sm text-muted">{checked ? "Sí" : "No"}</span>
      </div>
    )
  } else if (param.type === "DATE") {
    control = (
      <Input id={id} type="date" value={value} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)} />
    )
  } else if (param.type === "TIMESTAMP") {
    control = (
      <Input
        id={id}
        type="datetime-local"
        value={value}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  } else if (param.type === "INTEGER" || param.type === "DECIMAL") {
    control = (
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={param.type === "INTEGER" ? "1" : "0.1"}
        value={value}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  } else if (param.type === "UUID") {
    control = (
      <Input
        id={id}
        type="text"
        placeholder="00000000-0000-0000-0000-000000000000"
        value={value}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-[13px]"
      />
    )
  } else {
    control = (
      <Input id={id} type="text" value={value} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)} />
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-semibold -tracking-[0.01em]">
        {param.label}
        {param.required ? (
          <span className="text-danger" title="Requerido">
            *
          </span>
        ) : (
          <span className="rounded-sm bg-surface px-1.5 py-px text-[10.5px] font-semibold tracking-[0.04em] text-muted uppercase">
            opcional
          </span>
        )}
      </label>
      {control}
      <div className="flex items-center gap-2">
        <span className="rounded-sm bg-surface px-1.5 py-px font-mono text-[10px] font-semibold text-muted">
          {param.type}
        </span>
        <code className="font-mono text-[11px] text-muted">{param.name}</code>
      </div>
    </div>
  )
}
