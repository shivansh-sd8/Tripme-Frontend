import AvailabilityManager from '@/components/host/AvailabilityManager';

export default function PropertyAvailabilityPage({ params }: { params: { id: string } }) {
  return <AvailabilityManager targetType="listing" targetId={params.id} />;
}


