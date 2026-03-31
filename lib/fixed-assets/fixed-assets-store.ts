import type { FixedAsset } from "@/types/fixed-assets";
import { MOCK_ASSETS } from "./mock-data";

const STORAGE_KEY = "fiskl_fixed_assets_v1";

function loadFromStorage(): FixedAsset[] {
  if (typeof window === "undefined") return [...MOCK_ASSETS];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as FixedAsset[];
  } catch {
    // ignore parse errors
  }
  return [...MOCK_ASSETS];
}

function saveToStorage(items: FixedAsset[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export function getFixedAssets(): FixedAsset[] {
  return loadFromStorage();
}

export function getFixedAssetById(id: string): FixedAsset | null {
  return loadFromStorage().find((i) => i.id === id) ?? null;
}

export function saveFixedAsset(item: FixedAsset): void {
  const items = loadFromStorage();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.unshift(item);
  }
  saveToStorage(items);
}

export function deleteFixedAssets(ids: string[]): void {
  const idSet = new Set(ids);
  saveToStorage(loadFromStorage().filter((i) => !idSet.has(i.id)));
}

export function disposeAsset(id: string): void {
  const items = loadFromStorage();
  const idx = items.findIndex((i) => i.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], status: "disposed" };
    saveToStorage(items);
  }
}

export function generateAssetId(): string {
  return `fa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
