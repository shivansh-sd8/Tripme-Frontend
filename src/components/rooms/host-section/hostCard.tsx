"use client";

import Link from "next/link";
import { Star, ShieldCheck } from "lucide-react";

export default function HostCard({ host }: { host: any }) {
  return (
    <Link href={`/user/host/${host.id}`} className="block">
      <div className="flex items-center gap-4 ">
        <img
          src={host.profileImage}
          className="w-16 h-16 rounded-full object-cover"
          alt={host.name}
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold"> Hosted by {host.name}</h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 fill-black" />
            {host.rating} • {host.reviewCount} reviews
          </div>

          {host.superhost && (
            <div className="flex items-center gap-1 text-sm mt-1">
              <ShieldCheck className="w-4 h-4" />
              Superhost
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
