"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function ServiceRootRedirect() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    router.replace(`/host/service/${id}/categories?mode=edit`);
  }, [id, router]);

  return null;
}
