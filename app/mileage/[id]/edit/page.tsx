import { MileageForm } from "@/components/mileage/mileage-form";

export default async function EditMileagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MileageForm id={id} />;
}
