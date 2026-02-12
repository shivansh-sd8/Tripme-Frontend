"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/infrastructure/api/clients/api-client";

type ServiceDraft = {
  title: string;
  description: string;
  serviceType: string;
  location: any;
  pricing: any;
  duration: any;
  media: any[];
};

type ContextType = {
  draft: ServiceDraft;
  setField: (key: keyof ServiceDraft, value: any) => void;
  setAll: (data: ServiceDraft) => void;
  loading: boolean;
  draftId?: string;
};

const ServiceDraftContext = createContext<ContextType | null>(null);

export function ServiceDraftProvider({
  children,
  serviceId,
}: {
  children: React.ReactNode;
  serviceId?: string;
}) {
  const [draft, setDraft] = useState<ServiceDraft>({
    title: "",
    description: "",
    serviceType: "",
    location: null,
    pricing: { basePrice: 0 },
    duration: { value: 60, unit: "minutes" },
    media: [],
  });

  const [draftId, setDraftId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // 🔹 Load existing service (edit mode)
  useEffect(() => {
    if (!serviceId) return;

    setLoading(true);
    apiClient.getService(serviceId).then((res) => {
      setDraft(res.data);
      setDraftId(serviceId);
      setLoading(false);
    });
  }, [serviceId]);

  // 🔹 Autosave (Airbnb-style)
//   useEffect(() => {
//     if (loading) return;

//     const timeout = setTimeout(async () => {
//       if (draftId) {
//         await apiClient.updateService(draftId, draft);
//       } else {
//         const res = await apiClient.createService(draft);
//         setDraftId(res.data.id);
//       }
//     }, 800);

//     return () => clearTimeout(timeout);
//   }, [draft]);

  const setField = (key: keyof ServiceDraft, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setAll = (data: ServiceDraft) => setDraft(data);

  return (
    <ServiceDraftContext.Provider
      value={{ draft, setField, setAll, loading, draftId }}
    >
      {children}
    </ServiceDraftContext.Provider>
  );
}

export const useServiceDraft = () => {
  const ctx = useContext(ServiceDraftContext);
  if (!ctx) throw new Error("useServiceDraft must be used inside provider");
  return ctx;
};
