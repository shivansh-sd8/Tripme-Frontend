"use client";
import React from "react";

interface Props {
  hostId: string;
}

export default function HostProfileContent({ hostId }: Props) {
  return (
    <div>
      <h1 className="text-xl font-semibold">Host Profile</h1>
      <p>Host ID: {hostId}</p>
    </div>
  );
}
