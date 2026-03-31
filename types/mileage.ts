export type DistanceUnit = "mi" | "km";
export type MileageEntryMode = "manual" | "odometer";

export interface MileageClient {
  id: string;
  companyName: string;
}

export interface MileageItem {
  id: string;
  name: string;
  note: string;
  occurDate: string;           // ISO date "YYYY-MM-DD"
  client: MileageClient | null;
  quantity: number | null;     // distance in `unit`
  unit: DistanceUnit;
  startMileage: number | null; // odometer start reading
  finishMileage: number | null;// odometer finish reading
  roundTrip: boolean;
  price: number;               // rate per unit (e.g. 0.67 per mile)
  subtotal: number;            // calculated: quantity * price
  currency: string;            // ISO currency code e.g. "USD"
  reimbursable: boolean;
  report: boolean;             // true = attached to invoice (billed)
  entryMode: MileageEntryMode;
  createdAt: string;           // ISO datetime for default sort
}

export type MileageFormValues = {
  name: string;
  note: string;
  occurDate: string;
  clientId: string;
  quantity: string;
  unit: DistanceUnit;
  startMileage: string;
  finishMileage: string;
  roundTrip: boolean;
  price: string;
  currency: string;
  reimbursable: boolean;
  entryMode: MileageEntryMode;
};
