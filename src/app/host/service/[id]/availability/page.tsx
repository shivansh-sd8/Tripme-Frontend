import AvailabilityManager from '@/components/host/AvailabilityManager';

export default function ServiceAvailabilityPage({ params }: { params: { id: string } }) {
  return <AvailabilityManager targetType="service" targetId={params.id} />;
}


