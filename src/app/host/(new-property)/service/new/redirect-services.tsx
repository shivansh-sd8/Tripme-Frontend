"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToServices() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/host/service/new/categories");
  }, [router]);

return null;
}
