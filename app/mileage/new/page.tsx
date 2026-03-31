import { MileageForm } from "@/components/mileage/mileage-form";

export default async function NewMileagePage({
  searchParams,
}: {
  searchParams: Promise<{ sourceId?: string }>;
}) {
  const { sourceId } = await searchParams;
  return <MileageForm sourceId={sourceId} />;
}
