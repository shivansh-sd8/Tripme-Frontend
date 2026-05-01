import ServiceSlotManager from '@/components/host/ServiceSlotManager';

export default async function ServiceAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ServiceSlotManager serviceId={id} />;
}
