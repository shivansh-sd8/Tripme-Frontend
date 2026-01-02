"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";

const HostingEmptyState: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-full">
          Today
        </div>
        <div className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
          Upcoming
        </div>
      </div>

      <div className="w-48 h-48 mx-auto mb-8">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <rect x="20" y="30" width="140" height="160" fill="#D4A574" rx="4" />
          <rect x="30" y="40" width="60" height="140" fill="#F9F9F9" rx="2" />
          {[...Array(11)].map((_, i) => (
            <line
              key={i}
              x1="35"
              y1={50 + i * 12}
              x2="85"
              y2={50 + i * 12}
              stroke="#E5E5E5"
              strokeWidth="1"
            />
          ))}
          <rect x="100" y="40" width="50" height="140" fill="#FFFFFF" rx="2" />
          {[...Array(6)].map((_, i) => (
            <rect
              key={i}
              x={105 + (i % 3) * 15}
              y={45 + Math.floor(i / 3) * 20}
              width="12"
              height="12"
              fill="#F5F5F5"
              stroke="#E5E5E5"
              strokeWidth="1"
              rx="1"
            />
          ))}
          <path
            d="M 100 40 L 100 180 L 110 175 L 100 180 L 90 175 Z"
            fill="#FF385C"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
        You don’t have any reservations
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
        To get booked, you’ll need to complete and publish your listing.
      </p>

      <Button
        onClick={() => router.push("/host/listings")}
        className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg px-6 py-3"
      >
        Complete your listing
      </Button>
    </div>
  );
};

export default HostingEmptyState;



