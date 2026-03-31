import type { DepreciationMethod, DepreciationRow } from "@/types/fixed-assets";

// Straight-Line: equal charge every year
export function calcSL(
  cost: number,
  residual: number,
  life: number
): DepreciationRow[] {
  const annual = (cost - residual) / life;
  const rows: DepreciationRow[] = [];
  let accum = 0;

  for (let y = 1; y <= life; y++) {
    const beginNBV = cost - accum;
    // Final year: take whatever is left to hit residual exactly
    const depreciation = y === life ? beginNBV - residual : annual;
    accum += depreciation;
    rows.push({ year: y, beginNBV, depreciation, accumDepreciation: accum, endNBV: cost - accum });
  }

  return rows;
}

// Declining Balance: rate = 1/life applied to current NBV each period
export function calcDB(
  cost: number,
  residual: number,
  life: number
): DepreciationRow[] {
  const rate = 1 / life;
  const rows: DepreciationRow[] = [];
  let accum = 0;

  for (let y = 1; y <= life; y++) {
    const beginNBV = cost - accum;
    const remaining = life - y + 1;
    // Switch to SL when it gives a higher charge (ensures we reach residual)
    const dbCharge = beginNBV * rate;
    const slCharge = (beginNBV - residual) / remaining;
    let depreciation = Math.max(dbCharge, slCharge);
    // Never depreciate below residual
    depreciation = Math.min(depreciation, beginNBV - residual);
    depreciation = Math.max(0, depreciation);
    accum += depreciation;
    rows.push({ year: y, beginNBV, depreciation, accumDepreciation: accum, endNBV: cost - accum });
  }

  return rows;
}

// Double Declining Balance: rate = 2/life applied to current NBV,
// switches to SL in the year that SL gives a higher charge
export function calcDDB(
  cost: number,
  residual: number,
  life: number
): DepreciationRow[] {
  const rate = 2 / life;
  const rows: DepreciationRow[] = [];
  let accum = 0;

  for (let y = 1; y <= life; y++) {
    const beginNBV = cost - accum;
    if (beginNBV <= residual) {
      rows.push({ year: y, beginNBV, depreciation: 0, accumDepreciation: accum, endNBV: beginNBV });
      continue;
    }

    const remaining = life - y + 1;
    const ddbCharge = beginNBV * rate;
    // Switch to SL when SL yields a higher per-period charge to ensure full depreciation
    const slCharge = (beginNBV - residual) / remaining;
    let depreciation = Math.max(ddbCharge, slCharge);
    // Never go below residual
    depreciation = Math.min(depreciation, beginNBV - residual);
    accum += depreciation;
    rows.push({ year: y, beginNBV, depreciation, accumDepreciation: accum, endNBV: cost - accum });
  }

  return rows;
}

// Sum-of-Years-Digits: front-loaded, year N gets (remaining years / SYD) of depreciable base
export function calcSYD(
  cost: number,
  residual: number,
  life: number
): DepreciationRow[] {
  const syd = (life * (life + 1)) / 2;
  const depreciableBase = cost - residual;
  const rows: DepreciationRow[] = [];
  let accum = 0;

  for (let y = 1; y <= life; y++) {
    const beginNBV = cost - accum;
    const remainingYears = life - y + 1;
    const depreciation = (remainingYears / syd) * depreciableBase;
    accum += depreciation;
    rows.push({ year: y, beginNBV, depreciation, accumDepreciation: accum, endNBV: cost - accum });
  }

  return rows;
}

// Units of Production: requires usage data — returns empty for UI to handle
export function calcUoP(
  _cost: number,
  _residual: number,
  _life: number
): DepreciationRow[] {
  return [];
}

// Dispatcher: select calculation by method
export function calcSchedule(
  method: DepreciationMethod,
  cost: number,
  residual: number,
  life: number
): DepreciationRow[] {
  if (cost <= 0 || life <= 0 || residual < 0 || residual >= cost) return [];

  switch (method) {
    case "sl":  return calcSL(cost, residual, life);
    case "db":  return calcDB(cost, residual, life);
    case "ddb": return calcDDB(cost, residual, life);
    case "syd": return calcSYD(cost, residual, life);
    case "uop": return calcUoP(cost, residual, life);
  }
}

// Given a full schedule and acquisition date, return current NBV and depreciation status
export function getCurrentNBV(
  schedule: DepreciationRow[],
  acquisitionDate: string
): { nbv: number; yearsElapsed: number; percentDepreciated: number; currentYearDepr: number } {
  if (schedule.length === 0) {
    return { nbv: 0, yearsElapsed: 0, percentDepreciated: 0, currentYearDepr: 0 };
  }

  const acqDate = new Date(acquisitionDate + "T00:00:00");
  const now = new Date();
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const yearsElapsedRaw = (now.getTime() - acqDate.getTime()) / msPerYear;
  const yearsElapsed = Math.max(0, Math.min(schedule.length, Math.floor(yearsElapsedRaw)));

  const cost = schedule[0].beginNBV;
  const residual = schedule[schedule.length - 1].endNBV;
  const depreciableBase = cost - residual;

  let nbv: number;
  let currentYearDepr = 0;

  if (yearsElapsed === 0) {
    nbv = cost;
    currentYearDepr = schedule[0]?.depreciation ?? 0;
  } else if (yearsElapsed >= schedule.length) {
    nbv = schedule[schedule.length - 1].endNBV;
    currentYearDepr = 0;
  } else {
    nbv = schedule[yearsElapsed - 1].endNBV;
    currentYearDepr = schedule[yearsElapsed]?.depreciation ?? 0;
  }

  const percentDepreciated =
    depreciableBase > 0
      ? Math.min(100, Math.round(((cost - nbv) / depreciableBase) * 100))
      : 100;

  return { nbv, yearsElapsed, percentDepreciated, currentYearDepr };
}
