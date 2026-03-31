import { FixedAssetForm } from "@/components/fixed-assets/fixed-assets-form";

export default async function EditFixedAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FixedAssetForm id={id} />;
}
