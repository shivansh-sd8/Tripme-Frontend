// components/user/ProfileRouter.tsx
"use client";

import { useSearchParams } from "next/navigation";
import ProfileContent from "@/components/user/ProfileContent";
import HostProfileContent from "@/components/user/hostProfileContent";

export default function ProfileRouter() {
  const searchParams = useSearchParams();
  const hostId = searchParams.get("id");

  // If id exists → host profile
  if (hostId) {
    return <HostProfileContent hostId={hostId} />;
  }

  // Default user profile
  return <ProfileContent />;
}
