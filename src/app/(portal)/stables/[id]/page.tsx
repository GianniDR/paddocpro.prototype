import { StableProfile } from "@/components/stables/stable-profile";

export default async function StableProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StableProfile stableId={id} />;
}
