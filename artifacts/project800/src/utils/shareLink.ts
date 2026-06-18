import { MonthData, BudgetItem, Campaign, EventItem, Hoarding } from "@/data/defaults";

export type SnapshotData = {
  months: MonthData[];
  budget: BudgetItem[];
  campaigns: Campaign[];
  events: EventItem[];
  hoardings: Hoarding[];
  totalBudget: number;
  generatedAt: string;
};

export function encodeSnapshot(data: SnapshotData): string {
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeSnapshot(encoded: string): SnapshotData | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as SnapshotData;
  } catch {
    return null;
  }
}

export function buildShareUrl(data: SnapshotData): string {
  const encoded = encodeSnapshot(data);
  const base = window.location.origin + window.location.pathname;
  return `${base}#view=${encoded}`;
}

export function getSnapshotFromHash(): SnapshotData | null {
  const hash = window.location.hash;
  const match = hash.match(/^#view=(.+)$/);
  if (!match) return null;
  return decodeSnapshot(match[1]);
}
