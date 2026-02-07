"use client";
import Header from "@/components/shared/Header";
import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import StayCard from "@/components/trips/StayCard";

export default function WishlistPage() {

    const [wishlists, setWishlists] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
  const loadWishlists = async () => {
    const res = await apiClient.getMyWishlists();
    setWishlists(res.data);
  };
  loadWishlists();
}, []);


const findWishlistItem = (stayId: string) => {
  for (const wl of wishlists) {
    const item = wl.items.find((i: any) =>
      (i.itemId._id || i.itemId) === stayId
    );
    if (item) return { wishlistId: wl._id, wishlistItemId: item._id };
  }
  return null;
};



const handleFavorite = async (stayId: string) => {
  const found = findWishlistItem(stayId);
  if (!found) return;

  await apiClient.removeFromWishlist(
    found.wishlistId,
    found.wishlistItemId
  );

  // update local state
  setFavorites(prev => {
    const newSet = new Set(prev);
    newSet.delete(stayId);
    return newSet;
  });

  setWishlists(prev =>
    prev.map(wl =>
      wl._id === found.wishlistId
        ? { ...wl, items: wl.items.filter(i => i._id !== found.wishlistItemId) }
        : wl
    )
  );
};




    return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
              <Header hideSearch ={true} />

              <div className="max-w-7xl mt-10 mx-auto p-6">
  <h1 className="text-2xl font-semibold mb-6">Wishlists</h1>

  {wishlists.map(wl => (
    <div key={wl._id} className="mb-10">
      <h2 className="text-xl font-medium mb-4">{wl.name}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wl.items.map((item: any) => (
      

           <StayCard
                      key={item._id}
                      stay={item.itemId}
                     
                      isFavorite={true}
                      onFavorite={handleFavorite}
                     
                    />
        ))}
      </div>
    </div>
  ))}
</div>


              </div>
    );
}