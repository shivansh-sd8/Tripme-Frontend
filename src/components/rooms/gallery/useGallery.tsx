"use client";

import { useState } from "react";

export function useGallery(images: string[]) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  const openAt = (index: number) => {
    setSelected(index);
    setOpen(true);
  };

  return {
    selected,
    setSelected,
    open,
    setOpen,
    openAt,
    total: images.length,
  };
}
