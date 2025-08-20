"use client";
import PropertyEditForm from '@/components/host/PropertyEditForm';
import React from 'react';

interface PropertyEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PropertyEditPage({ params }: PropertyEditPageProps) {
  // Unwrap params using React.use()
  const { id } = React.use(params);
  return (
    <div className="min-h-screen bg-white">
      <PropertyEditForm listingId={id} />
    </div>
  );
} 