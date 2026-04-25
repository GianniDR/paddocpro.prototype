import { HorseProfile } from "@/components/horses/horse-profile";

export default async function HorseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HorseProfile horseId={id} />;
}
