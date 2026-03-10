export type SlaLevel = "ok" | "warning" | "breach";

export interface SlaEvaluation {
  level: SlaLevel;
  text: string;
  daysOpen?: number;
  daysRemaining?: number;
}

function parseDate(raw?: string): Date | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  // Accept "YYYY-MM-DD" and ISO formats.
  const normalized = value.length === 10 ? `${value}T00:00:00` : value;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function dayDiff(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function evaluateSlaFromOpenedAt(openedAt: string | undefined, slaDays: number): SlaEvaluation {
  const opened = parseDate(openedAt);
  if (!opened) {
    return { level: "ok", text: "Sem SLA" };
  }

  const now = new Date();
  const daysOpen = Math.max(0, dayDiff(opened, now));
  const daysRemaining = slaDays - daysOpen;

  if (daysRemaining < 0) {
    return { level: "breach", text: `${Math.abs(daysRemaining)}d em atraso`, daysOpen, daysRemaining };
  }
  if (daysRemaining <= 2) {
    return { level: "warning", text: `${daysRemaining}d para vencer`, daysOpen, daysRemaining };
  }
  return { level: "ok", text: `${daysRemaining}d restantes`, daysOpen, daysRemaining };
}

export function evaluateSlaFromDueDate(dueDate: string | undefined): SlaEvaluation {
  const due = parseDate(dueDate);
  if (!due) {
    return { level: "ok", text: "Sem prazo" };
  }

  const now = new Date();
  const daysRemaining = dayDiff(now, due);
  if (daysRemaining < 0) {
    return { level: "breach", text: `${Math.abs(daysRemaining)}d em atraso`, daysRemaining };
  }
  if (daysRemaining <= 2) {
    return { level: "warning", text: `${daysRemaining}d para vencer`, daysRemaining };
  }
  return { level: "ok", text: `${daysRemaining}d restantes`, daysRemaining };
}
