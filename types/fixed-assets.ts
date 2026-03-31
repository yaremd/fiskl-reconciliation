export type DepreciationMethod = "sl" | "db" | "ddb" | "syd" | "uop";

export type AssetStatus = "active" | "done" | "disposed";

export const GL_ACCOUNTS: Record<string, string> = {
  "1400": "Office Equipment",
  "1410": "Computer Equipment",
  "1420": "Furniture and Fixtures",
  "1430": "Buildings",
  "1440": "Leasehold Improvements",
  "1450": "Vehicles",
  "1460": "Machinery and Equipment",
  "1470": "Intangibles",
};

// Maps GL asset account → GL accumulated depreciation account
export const GL_ACCUM_MAP: Record<string, string> = {
  "1400": "1401",
  "1410": "1411",
  "1420": "1421",
  "1430": "1431",
  "1440": "1441",
  "1450": "1451",
  "1460": "1461",
  "1470": "1471",
};

// GL depreciation expense accounts (user-selectable)
export const GL_DEPR_EXPENSE_ACCOUNTS: Record<string, string> = {
  "7400": "Depreciation Expense - Office Equipment",
  "7410": "Depreciation Expense - Computer Equipment",
  "7420": "Depreciation Expense - Furniture and Fixtures",
  "7430": "Depreciation Expense - Buildings",
  "7440": "Depreciation Expense - Leasehold Improvements",
  "7450": "Depreciation Expense - Vehicles",
  "7460": "Depreciation Expense - Machinery and Equipment",
  "7470": "Depreciation Expense - Intangibles",
};

// Maps GL asset account → default depreciation expense account
export const GL_DEPR_EXPENSE_DEFAULT_MAP: Record<string, string> = {
  "1400": "7400",
  "1410": "7410",
  "1420": "7420",
  "1430": "7430",
  "1440": "7440",
  "1450": "7450",
  "1460": "7460",
  "1470": "7470",
};

export interface FixedAsset {
  id: string;
  name: string;
  description: string;
  cost: number;
  residual: number;
  life: number;               // useful life in years
  method: DepreciationMethod;
  glAssetAccount: string;     // key into GL_ACCOUNTS
  glAccumAccount: string;     // derived from glAssetAccount via GL_ACCUM_MAP, stored at save time
  glDeprExpenseAccount: string; // user-selected from GL_DEPR_EXPENSE_ACCOUNTS
  acquisitionDate: string;    // "YYYY-MM-DD"
  status: AssetStatus;
  createdAt: string;          // ISO datetime
}

export interface DepreciationRow {
  year: number;
  beginNBV: number;
  depreciation: number;
  accumDepreciation: number;
  endNBV: number;
}

// Form values use string inputs for numeric fields (same pattern as MileageFormValues)
export type AssetFormValues = {
  name: string;
  description: string;
  costStr: string;
  residualStr: string;
  lifeStr: string;
  method: DepreciationMethod;
  glAssetAccount: string;
  glDeprExpenseAccount: string;
  acquisitionDate: string;
  status: AssetStatus;
};
