'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import ServiceForm from "@/components/host/ServiceForm";
import { apiClient } from "@/lib/api";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchService() {
      if (typeof id !== 'string') {
        setError('Invalid service ID');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiClient.getService(id);
        if (response.success && response.data && (response.data as any).service) {
          setService((response.data as any).service);
        } else {
          setError("Failed to load service");
        }
      } catch (err) {
        setError("Failed to load service");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchService();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <ProtectedRoute requireHost>
      {service && <ServiceForm initialData={service} isEditMode />}
    </ProtectedRoute>
  );
} 