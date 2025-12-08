import AvailabilityManager from '@/components/host/AvailabilityManager';

export default async function PropertyAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AvailabilityManager targetType="listing" targetId={id} />;
}


