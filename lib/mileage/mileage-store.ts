import type { MileageItem } from "@/types/mileage";
import { MOCK_MILEAGES } from "./mock-data";

const STORAGE_KEY = "fiskl_mileages_v1";

function loadFromStorage(): MileageItem[] {
  if (typeof window === "undefined") return [...MOCK_MILEAGES];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as MileageItem[];
  } catch {
    // ignore parse errors
  }
  return [...MOCK_MILEAGES];
}

function saveToStorage(items: MileageItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export function getMileages(): MileageItem[] {
  return loadFromStorage();
}

export function getMileageById(id: string): MileageItem | null {
  return loadFromStorage().find((i) => i.id === id) ?? null;
}

export function saveMileage(item: MileageItem): void {
  const items = loadFromStorage();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.unshift(item);
  }
  saveToStorage(items);
}

export function deleteMileages(ids: string[]): void {
  const idSet = new Set(ids);
  saveToStorage(loadFromStorage().filter((i) => !idSet.has(i.id)));
}

export function generateId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function calculateSubtotal(
  quantity: number | null,
  price: number,
  roundTrip: boolean
): number {
  if (!quantity) return 0;
  const distance = roundTrip ? quantity * 2 : quantity;
  return Math.round(distance * price * 100) / 100;
}
