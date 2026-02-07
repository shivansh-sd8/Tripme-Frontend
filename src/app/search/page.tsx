
// "use client";
// import React, { useEffect, useState, Suspense, useCallback, useMemo, useRef } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { MapPin } from 'lucide-react';
// import Image from 'next/image';
// import Header from '@/components/shared/Header';
// import Footer from '@/components/shared/Footer';
// import { apiClient } from '@/infrastructure/api/clients/api-client';
// import { useAuth } from '@/core/store/auth-context';
// import GoogleMapDisplay from '@/components/shared/GoogleMapDisplay';
// import StayCard from '@/components/trips/StayCard';
// import { Stay, Property } from '@/types';
// import FilterModal from '@/components/shared/FilterModal';
// import { useUI } from '@/core/store/uiContext';
// import { div } from 'framer-motion/client';

// // Helper function to convert Property to Stay type for StayCard
// const convertPropertyToStay = (property: any): Stay => {
//   return {
//     id: property._id,
//     title: property.title,
//     description: property.description,
//     images: property.images?.map((img: any) => img.url || img) || [],
//     location: {
//       city: property.location?.city || '',
//       state: property.location?.state || '',
//       country: property.location?.country || 'India',
//       coordinates: property.location?.coordinates || [0, 0]
//     },
//     price: {
//       amount: property.pricing?.basePrice || 0,
//       currency: property.pricing?.currency || 'INR'
//     },
//     rating: property.rating?.average || 0,
//     reviewCount: property.reviewCount || 0,
//     host: {
//       id: property.host?._id || property.host?.id || '',
//       name: property.host?.name || 'Unknown Host',
//       avatar: property.host?.profileImage || '',
//       isSuperhost: false
//     },
//     amenities: property.amenities || [],
//     tags: property.tags || [],
//     maxGuests: property.maxGuests || 1,
//     bedrooms: property.bedrooms || 0,
//     beds: property.beds || 0,
//     bathrooms: property.bathrooms || 0,
//     instantBookable: property.instantBookable || false,
//     createdAt: new Date(property.createdAt),
//     updatedAt: new Date(property.updatedAt)
//   };
// };

// function SearchPageContent() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const { user } = useAuth();
  
//   const [listings, setListings] = useState<any[]>([]);
//   const [allProperties, setAllProperties] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
//   const [searchCenter, setSearchCenter] = useState<[number, number] | undefined>();
//   const [mapCenter, setMapCenter] = useState<[number, number] | undefined>();
//   const [mapBounds, setMapBounds] = useState<{
//     ne: { lat: number; lng: number };
//     sw: { lat: number; lng: number };
//   } | null>(null);
//   const [mapInitialized, setMapInitialized] = useState(false);
//   const [initialLoadComplete, setInitialLoadComplete] = useState(false);
//   const [selectedProperty, setSelectedProperty] = useState<any>(null);
//   const [showPropertyModal, setShowPropertyModal] = useState(false);
//   const [searchExpanded, setSearchExpanded] = useState(false);
//   const isFetchingRef = useRef(false);
//   const initialPropertiesRef = useRef<any[]>([]);

//   const lng = searchParams.get('lng');
//   const lat = searchParams.get('lat');
//   const city = searchParams.get('city');
//   const guests = searchParams.get('guests');
//   const checkIn = searchParams.get('checkIn');
//   const checkOut = searchParams.get('checkOut');
//   const [favorites, setFavorites] = useState<Set<string>>(new Set());
//   const [showWishlistModal, setShowWishlistModal] = useState(false);
//   const [selectedStay, setSelectedStay] = useState<string | null>(null);
//   const [wishlistName, setWishlistName] = useState('');
//   const [wishlists, setWishlists] = useState<any[]>([]);
  
//   // Bottom sheet states - Airbnb style with peek
//   const [sheetState, setSheetState] = useState<'peek' | 'half' | 'full'>('half');
//   const [isDragging, setIsDragging] = useState(false);
//   const [startY, setStartY] = useState(0);
//   const [currentY, setCurrentY] = useState(0);
//   const sheetRef = useRef<HTMLDivElement>(null);
//   const listScrollRef = useRef<HTMLDivElement>(null);
//   const [showStickyMapButton, setShowStickyMapButton] = useState(false);
  
//   const [filterOpen, setFilterOpen] = useState(false);
//   const [filteredResultsCount, setFilteredResultsCount] = useState(0);
//   const { hideHeader, setHideHeader ,hideBottomNav, setHideBottomNav } = useUI();
  
//   const [currentCardIndex, setCurrentCardIndex] = useState(0);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);

//   // Bottom sheet heights - Airbnb style
//   const SHEET_HEIGHTS = {
//     peek: '12vh',    // Stuck at bottom - shows peek with drag handle
//     half: '50vh',    // Half screen - shows map + horizontal cards
//     full: '92vh'     // Full screen - hides map, shows grid list
//   };

//   // Handle list scroll to show/hide sticky map button
//   const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     const scrollTop = e.currentTarget.scrollTop;
//     // Show button when scrolled down more than 100px
//     setShowStickyMapButton(scrollTop > 100);
//     setHideBottomNav(scrollTop > 100);
//   };

//   // Handle drag start
//   const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
//     // Don't allow dragging when in full state and scrolling content
//     if (sheetState === 'full' && listScrollRef.current) {
//       const scrollTop = listScrollRef.current.scrollTop;
//       if (scrollTop > 0) return; // Allow content scroll, not sheet drag
//     }

//     setIsDragging(true);
//     const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
//     setStartY(clientY);
//     setCurrentY(clientY);
//   };

//   // Handle drag move
//   const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
//     if (!isDragging) return;
    
//     const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
//     setCurrentY(clientY);
//   };

//   // Handle drag end - Airbnb style snap behavior
//   const handleDragEnd = () => {
//     if (!isDragging) return;
//     setIsDragging(false);
    
//     const deltaY = currentY - startY;
//     const threshold = 80; // pixels to trigger state change
    
//     if (sheetState === 'peek') {
//       // From peek state - can only go up
//       if (deltaY < -threshold) {
//         setSheetState('half');
//       }
//     } else if (sheetState === 'half') {
//       if (deltaY > threshold) {
//         // Dragged down - collapse to peek
//         setSheetState('peek');
//       } else if (deltaY < -threshold) {
//         // Dragged up - expand to full
//         setSheetState('full');
//       }
//     } else if (sheetState === 'full') {
//       if (deltaY > threshold) {
//         // Dragged down - collapse to half
//         setSheetState('half');
//       }
//     }
//   };

//   const applyFilters = async (filters: any) => {
//     try {
//       setLoading(true);
      
//       const params = new URLSearchParams();
      
//       if (filters.priceRange.min) params.append('minPrice', filters.priceRange.min);
//       if (filters.priceRange.max) params.append('maxPrice', filters.priceRange.max);
      
//       if (filters.bedrooms) params.append('guests', filters.bedrooms);
//       if (filters.beds) params.append('beds', filters.beds);
//       if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
      
//       if (filters.propertyTypes.length > 0) {
//         params.append('type', filters.propertyTypes.join(','));
//       }
      
//       if (filters.amenities.length > 0) {
//         params.append('amenities', filters.amenities.join(','));
//       }
      
//       if (filters.instantBook) params.append('instantBook', 'true');
//       if (filters.selfCheckIn) params.append('selfCheckIn', 'true');
//       if (filters.freeCancel) params.append('freeCancel', 'true');
      
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/listings?${params}`);
//       const data = await response.json();
      
//       if (data.success) {
//         let listingsData = data.data;
        
//         if (data.data && data.data.listings) {
//           listingsData = data.data.listings;
//         }
        
//         if (!Array.isArray(listingsData)) {
//           listingsData = [];
//         }
        
//         setListings(listingsData);
//       }
//     } catch (error) {
//       console.error('Error applying filters:', error);
//       setListings([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResultsCountChange = (count: number) => {
//     setFilteredResultsCount(count);
//   };

//   useEffect(() => {
//     setHideHeader(true);
//     return () => {
//       setHideHeader(false);
//     };
//   }, []);

//   useEffect(() => {
//     const fetchProperties = async () => {
//       if (isFetchingRef.current) return;
      
//       try {
//         isFetchingRef.current = true;
//         setLoading(true);
      
//         const params: any = {
//           limit: 100,
//           sortBy: 'createdAt',
//           sortOrder: 'desc'
//         };

//         if (guests) params.guests = guests;
//         if (checkIn) params.checkIn = checkIn;
//         if (checkOut) params.checkOut = checkOut;
//         if (city) params.city = city;

//         if (lng && lat) {
//           params.lng = lng;
//           params.lat = lat;
          
//           const defaultRadius = city && ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'].includes(city.toLowerCase()) 
//             ? '50000' : '25000';
//           params.radius = searchParams.get('radius') || defaultRadius;
          
//           const center = [parseFloat(lng), parseFloat(lat)] as [number, number];
//           setSearchCenter(center);
//           setMapCenter(center);
//           setMapInitialized(false);
//         }

//         const response = await apiClient.getListings(params);
      
//         if (response.success && response.data) {
//           const properties = response.data.listings || [];
          
//           if (properties.length < 3 && city && lng && lat) {
//             try {
//               const fallbackParams = { ...params };
//               delete fallbackParams.lng;
//               delete fallbackParams.lat;
//               delete fallbackParams.radius;
//               fallbackParams.city = city;
              
//               const fallbackResponse = await apiClient.getListings(fallbackParams);
//               if (fallbackResponse.success && fallbackResponse.data) {
//                 const fallbackProperties = fallbackResponse.data.listings || [];
//                 initialPropertiesRef.current = fallbackProperties;
//                 setAllProperties(fallbackProperties);
//                 setListings(fallbackProperties);
//               } else {
//                 initialPropertiesRef.current = properties;
//                 setAllProperties(properties);
//                 setListings(properties);
//               }
//             } catch (fallbackError) {
//               initialPropertiesRef.current = properties;
//               setAllProperties(properties);
//               setListings(properties);
//             }
//           } else {
//             initialPropertiesRef.current = properties;
//             setAllProperties(properties);
//             setListings(properties);
//           }
          
//           setTimeout(() => {
//             setInitialLoadComplete(true);
//             setMapInitialized(true);
//           }, 1000);
//         } else {
//           setListings([]);
//           setAllProperties([]);
//         }
//       } catch (error) {
//         console.error('❌ Error fetching properties:', error);
//         setListings([]);
//         setAllProperties([]);
//       } finally {
//         setLoading(false);
//         isFetchingRef.current = false;
//       }
//     };

//     fetchProperties();
//   }, [lng, lat, city, guests, checkIn, checkOut]);

//   const handleBoundsChange = useCallback((bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => {
//     if (mapBounds) {
//       const latDiff = Math.abs(mapBounds.ne.lat - bounds.ne.lat) + Math.abs(mapBounds.sw.lat - bounds.sw.lat);
//       const lngDiff = Math.abs(mapBounds.ne.lng - bounds.ne.lng) + Math.abs(mapBounds.sw.lng - bounds.sw.lng);
      
//       if (latDiff < 0.01 && lngDiff < 0.01) return;
//     }
    
//     setMapBounds(bounds);
//   }, [mapBounds]);

//   const handleCenterChange = useCallback((center: [number, number]) => {
//     setMapCenter(center);
//   }, []);

//   const handlePropertyClick = useCallback((propertyId: string) => {
//     const property = allProperties.find(p => p._id === propertyId);
//     if (property) {
//       setSelectedProperty(property);
//       setShowPropertyModal(true);
//     }
//   }, [allProperties]);

//   useEffect(() => {
//     if (mapBounds && initialLoadComplete) {
//       const bounds = `${mapBounds.sw.lng},${mapBounds.sw.lat},${mapBounds.ne.lng},${mapBounds.ne.lat}`;
//       fetchPropertiesWithBounds(bounds);
//     }
//   }, [mapBounds, initialLoadComplete]);

//   useEffect(() => {
//     const loadWishlists = async () => {
//       const res = await apiClient.getMyWishlists();
//       setWishlists(res.data);

//       const favSet = new Set<string>();
//       res.data.forEach((wl: any) => {
//         wl.items.forEach((item: any) => {
//           favSet.add(item.itemId.id.toString());
//         });
//       });

//       setFavorites(favSet);
//     };

//     loadWishlists();
//   }, []);

//   const fetchPropertiesWithBounds = async (bounds: string) => {
//     try {
//       const params = new URLSearchParams({ bounds });

//       if (guests) params.append('guests', guests);
//       if (checkIn) params.append('checkIn', checkIn);
//       if (checkOut) params.append('checkOut', checkOut);

//       const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
//       const response = await fetch(`${API_URL}/listings/map?${params.toString()}`, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//       });

//       const data = await response.json();

//       if (data.success && data.data) {
//         const properties = data.data.listings || [];
        
//         if (properties.length > 0) {
//           setListings(properties);
//           setAllProperties(properties);
//         } else {
//           if (initialPropertiesRef.current.length > 0) {
//             setListings(initialPropertiesRef.current);
//             setAllProperties(initialPropertiesRef.current);
//           }
//         }
//       } else {
//         if (initialPropertiesRef.current.length > 0) {
//           setListings(initialPropertiesRef.current);
//           setAllProperties(initialPropertiesRef.current);
//         }
//       }
//     } catch (error) {
//       if (initialPropertiesRef.current.length > 0) {
//         setListings(initialPropertiesRef.current);
//         setAllProperties(initialPropertiesRef.current);
//       }
//     }
//   };

//   const handleSearch = (location: any, guestsCount?: number, checkInDate?: string, checkOutDate?: string) => {
//     const params = new URLSearchParams();
//     params.set('lng', location.coordinates[0].toString());
//     params.set('lat', location.coordinates[1].toString());
//     params.set('city', location.value || location.label || '');
//     if (guestsCount) params.set('guests', guestsCount.toString());
//     if (checkInDate) params.set('checkIn', checkInDate);
//     if (checkOutDate) params.set('checkOut', checkOutDate);
    
//     router.push(`/search?${params.toString()}`);
//   };

//   const findWishlistItem = (stayId: string) => {
//     for (const wl of wishlists) {
//       const item = wl.items.find((i: any) => (i.itemId._id || i.itemId) === stayId);
//       if (item) return { wishlistId: wl._id, wishlistItemId: item._id };
//     }
//     return null;
//   };

//   const handleFavorite = async (stayId: string) => {
//     if (favorites.has(stayId)) {
//       const found = findWishlistItem(stayId);
//       if (!found) return;

//       await apiClient.removeFromWishlist(found.wishlistId, found.wishlistItemId);

//       setFavorites(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(stayId);
//         return newSet;
//       });

//       setWishlists(prev =>
//         prev.map(wl =>
//           wl._id === found.wishlistId
//             ? { ...wl, items: wl.items.filter(i => i._id !== found.wishlistItemId) }
//             : wl
//         )
//       );
//       return;
//     }

//     if (wishlists.length === 0) {
//       setSelectedStay(stayId);
//       setShowWishlistModal(true);
//       return;
//     }

//     const wishlist = wishlists[0];
//     const res = await apiClient.addToWishlist(wishlist._id, {
//       itemType: 'Property',
//       itemId: stayId
//     });

//     setWishlists(prev => prev.map(wl => wl._id === wishlist._id ? res.data : wl));
//     setFavorites(prev => new Set(prev).add(stayId));
//   };

//   const createWishlistAndSave = async () => {
//     const wishlist = await apiClient.createWishList({
//       name: wishlistName,
//       isPublic: false
//     });

//     await apiClient.addToWishlist(wishlist.data._id, {
//       itemType: 'Property',
//       itemId: selectedStay
//     });

//     setFavorites(prev => new Set(prev).add(selectedStay!));
//     setWishlists(prev => [...prev, wishlist.data]);
//     setShowWishlistModal(false);
//   };

//   const handleScroll = () => {
//     if (scrollContainerRef.current) {
//       const scrollLeft = scrollContainerRef.current.scrollLeft;
//       const cardWidth = scrollContainerRef.current.offsetWidth;
//       const newIndex = Math.round(scrollLeft / cardWidth);
//       setCurrentCardIndex(newIndex);
      
//       if (stayListings[newIndex]) {
//         setHoveredPropertyId(stayListings[newIndex].id);
//       }
//     }
//   };
  
//   const mapMarkers = useMemo(() => {
//     return allProperties.map((property: any) => ({
//       id: property._id,
//       position: [property.location.coordinates[0], property.location.coordinates[1]] as [number, number],
//       title: property.title,
//       price: property.pricing?.basePrice,
//       image: property.images?.[0]?.url,
//       isHighlighted: hoveredPropertyId === property._id,
//       onClick: () => handlePropertyClick(property._id),
//       property: property
//     }));
//   }, [allProperties, hoveredPropertyId, handlePropertyClick]);

//   const stayListings = useMemo(() => {
//     return listings.map(convertPropertyToStay);
//   }, [listings]);

//   return (
//     <div className="min-h-screen bg-white">
//       <Header 
//         onSearch={handleSearch}
//         searchExpanded={searchExpanded}
//         onSearchToggle={setSearchExpanded}
//         visibleFilter={true}
//         onFilterClick={() => setFilterOpen(true)}
//       />

//       <FilterModal 
//         isOpen={filterOpen} 
//         onClose={() => setFilterOpen(false)} 
//         onApplyFilters={applyFilters} 
//         resultsCount={filteredResultsCount}
//         onResultsCountChange={handleResultsCountChange}
//       />
      
//       {/* Desktop View */}
//       <div className={`hidden lg:block ${hideHeader ? "pt-20" : "pt-40"}`}>
//         <div className="flex h-[calc(100vh-5rem)]">
//           <div className="w-1/2 overflow-y-auto pb-8">
//             <div className="px-6 pt-6 pb-4">
//               <div className="flex items-center justify-between">
//                 <h1 className="text-2xl font-semibold text-gray-900">
//                   {listings.length > 0 ? `Over ${listings.length} homes` : 'No homes found'}
//                 </h1>
//                 <div className="flex items-center gap-1">
//                   <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-sm text-gray-600">Prices include all fees</span>
//                 </div>
//               </div>
//             </div>

//             <div className="px-6 py-4">
//               {loading ? (
//                 <div className="flex items-center justify-center py-16">
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading places...</p>
//                   </div>
//                 </div>
//               ) : stayListings.length > 0 ? (
//                 <div className="grid grid-cols-2 gap-6">
//                   {stayListings.map((stay) => (
//                     <StayCard
//                       key={stay.id}
//                       stay={stay}
//                       onMouseEnter={() => setHoveredPropertyId(stay.id)}
//                       onMouseLeave={() => setHoveredPropertyId(null)}
//                       guests={guests}
//                       checkIn={checkIn}
//                       checkOut={checkOut}
//                       isFavorite={favorites.has(stay.id)}
//                       onFavorite={handleFavorite}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-16">
//                   <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
//                   <p className="text-gray-600 mb-6">Try adjusting your search location or dates.</p>
//                   <button
//                     onClick={() => router.push('/')}
//                     className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
//                   >
//                     Search again
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="w-1/2 p-4 pt-8">
//             <div className="h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
//               <GoogleMapDisplay
//                 center={mapCenter || searchCenter || [78.9629, 20.5937]}
//                 zoom={(mapCenter || searchCenter) ? 14 : 5}
//                 markers={mapMarkers}
//                 onBoundsChange={handleBoundsChange}
//                 onCenterChange={handleCenterChange}
//                 height="100%"
//                 className="w-full h-full rounded-2xl"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile View - Airbnb Style with Draggable Bottom Sheet */}
//       <div className="lg:hidden fixed inset-0 flex flex-col">
//         {/* Full Screen Map */}
//         <div className="flex-1 relative">
//           <GoogleMapDisplay
//             center={mapCenter || searchCenter || [78.9629, 20.5937]}
//             zoom={(mapCenter || searchCenter) ? 14 : 5}
//             markers={mapMarkers}
//             onBoundsChange={handleBoundsChange}
//             onCenterChange={handleCenterChange}
//             height="100%"
//             className="w-full h-full"
//           />

//           {/* Map Header - Prices include all fees */}
//           <div className="absolute top-20 left-0 right-0 z-10 flex justify-center pointer-events-none">
//             <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
//               <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
//               </svg>
//               <span className="text-sm font-medium text-gray-700">Prices include all fees</span>
//             </div>
//           </div>

//           {/* Sticky Map Button - Shows when sheet is full and scrolled */}
//           {sheetState === 'full' && showStickyMapButton && (
//             <button
//               onClick={() => setSheetState('half')}
//               className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold shadow-xl flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//               </svg>
//               Map
//             </button>
//           )}
//         </div>

//         {/* Draggable Bottom Sheet - Airbnb Style */}
//         <div
//           ref={sheetRef}
//           className="absolute left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-40"
//           style={{
//             bottom: 0,
//             height: SHEET_HEIGHTS[sheetState],
//             transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'none'
//           }}
//         >
//           {/* Drag Handle - Always visible */}
//           <div 
//             className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
//             onTouchStart={handleDragStart}
//             onTouchMove={handleDragMove}
//             onTouchEnd={handleDragEnd}
//             onMouseDown={handleDragStart}
//             onMouseMove={handleDragMove}
//             onMouseUp={handleDragEnd}
//             onMouseLeave={handleDragEnd}
//           >
//             <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
//           </div>

//           {/* Sheet Content */}
//           <div className="h-[calc(100%-2.5rem)] overflow-hidden flex flex-col">
//             {/* Peek State - Just text indicator */}
//             {sheetState === 'peek' && (
//               <div className="flex-1 flex items-center justify-center pb-20">
//                 <p className="text-gray-600 text-sm">Pull up to see properties</p>
//               </div>
//             )}

//             {/* Half State - Horizontal Scrolling Cards */}
//             {sheetState === 'half' && (
//               <div className="flex-1 px-4 pb-20">
//                 <div 
//                   ref={scrollContainerRef}
//                   onScroll={handleScroll}
//                   className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide h-full"
//                   style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//                 >
//                   {/* {stayListings.map((stay) => (
//                     <div key={stay.id} className="flex-shrink-0 w-[85vw] snap-center">
//                       <div 
//                         onClick={() => {
//                           const params = new URLSearchParams();
//                           if (guests) params.set('guests', guests);
//                           if (checkIn) params.set('checkIn', checkIn);
//                           if (checkOut) params.set('checkOut', checkOut);
//                           router.push(`/rooms/${stay.id}?${params.toString()}`);
//                         }}
//                         className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 active:scale-[0.98] transition-transform h-full"
//                       >
//                         <div className="relative aspect-[4/3]">
//                           {stay.images && stay.images.length > 0 ? (
//                             <Image src={stay.images[0]} alt={stay.title} fill className="object-cover" />
//                           ) : (
//                             <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                               <MapPin className="w-12 h-12 text-gray-400" />
//                             </div>
//                           )}
                          
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleFavorite(stay.id);
//                             }}
//                             className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md"
//                           >
//                             <svg 
//                               className={`w-5 h-5 ${favorites.has(stay.id) ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-700'}`}
//                               fill="none" 
//                               stroke="currentColor" 
//                               viewBox="0 0 24 24"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                             </svg>
//                           </button>

//                           <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
//                             {stay.images.slice(0, 5).map((_, i) => (
//                               <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
//                             ))}
//                           </div>
//                         </div>

//                         <div className="p-4">
//                           <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{stay.title}</h3>
//                           <p className="text-sm text-gray-600 mb-2 line-clamp-2">
//                             {stay.description || `${stay.bedrooms} bedroom · ${stay.beds} bed`}
//                           </p>
                          
//                           <div className="flex items-center justify-between mt-3">
//                             <div>
//                               <span className="text-lg font-bold text-gray-900">₹{stay.price.amount}</span>
//                               <span className="text-sm text-gray-600"> / night</span>
//                             </div>
                            
//                             {stay.rating > 0 && (
//                               <div className="flex items-center gap-1 text-sm">
//                                 <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
//                                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                 </svg>
//                                 <span className="font-semibold text-gray-900">{stay.rating}</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))} */}

//                    <div className="grid grid-cols-1 gap-6">

//                     <div className='flex-shrink-0 w-[85vw] snap-center'>

//                   {stayListings.map((stay) => (
                    
//                     <StayCard
//                       key={stay.id}
//                       stay={stay}
//                       onMouseEnter={() => setHoveredPropertyId(stay.id)}
//                       onMouseLeave={() => setHoveredPropertyId(null)}
//                       guests={guests}
//                       checkIn={checkIn}
//                       checkOut={checkOut}
//                       isFavorite={favorites.has(stay.id)}
//                       onFavorite={handleFavorite}
//                     />

//                   ))}
//                   </div>
//                 </div>
//                 </div>

//                 <div className="text-center pb-2 pt-2">
//                   <span className="text-xs font-medium text-gray-600">
//                     {currentCardIndex + 1} / {stayListings.length}
//                   </span>
//                 </div>
//               </div>
//             )}

//             {/* Full State - Grid List with Scroll Detection */}
//             {sheetState === 'full' && (
//               <div 
//                 ref={listScrollRef}
//                 onScroll={handleListScroll}
//                 className="flex-1 overflow-y-auto pb-20"
//               >
//                 <div className="px-4 pt-2 pb-4">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                     {listings.length} places
//                   </h2>
//                   <div className="grid grid-cols-1 gap-4">
//                     {stayListings.map((stay) => (
//                       <div
//                         key={stay.id}
//                         onClick={() => {
//                           const params = new URLSearchParams();
//                           if (guests) params.set('guests', guests);
//                           if (checkIn) params.set('checkIn', checkIn);
//                           if (checkOut) params.set('checkOut', checkOut);
//                           router.push(`/rooms/${stay.id}?${params.toString()}`);
//                         }}
//                         className="bg-white rounded-xl overflow-hidden border border-gray-200 active:scale-[0.98] transition-transform"
//                       >
//                         <div className="relative aspect-square">
//                           {stay.images && stay.images.length > 0 ? (
//                             <Image src={stay.images[0]} alt={stay.title} fill className="object-cover" />
//                           ) : (
//                             <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                               <MapPin className="w-8 h-8 text-gray-400" />
//                             </div>
//                           )}
                          
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleFavorite(stay.id);
//                             }}
//                             className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md"
//                           >
//                             <svg 
//                               className={`w-4 h-4 ${favorites.has(stay.id) ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-700'}`}
//                               fill="none" 
//                               stroke="currentColor" 
//                               viewBox="0 0 24 24"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                             </svg>
//                           </button>
//                         </div>

//                         <div className="p-3">
//                           <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{stay.title}</h3>
//                           <div className="flex items-baseline gap-1">
//                             <span className="text-base font-bold text-gray-900">₹{stay.price.amount}</span>
//                             <span className="text-xs text-gray-600">/ night</span>
//                           </div>
//                           {stay.rating > 0 && (
//                             <div className="flex items-center gap-1 text-xs mt-1">
//                               <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                               <span className="font-semibold text-gray-900">{stay.rating}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <Footer />

//       {/* Wishlist Modal */}
//       {showWishlistModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
//             <h3 className="text-lg font-semibold mb-4">Create new list</h3>
//             <input
//               className="border border-gray-300 w-full p-3 rounded-lg mb-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
//               placeholder="My dream stays"
//               value={wishlistName}
//               onChange={e => setWishlistName(e.target.value)}
//             />
//             <div className="flex justify-end gap-3">
//               <button 
//                 onClick={() => setShowWishlistModal(false)}
//                 className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50"
//                 onClick={createWishlistAndSave}
//                 disabled={!wishlistName.trim()}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function SearchPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     }>
//       <SearchPageContent />
//     </Suspense>
//   );
// }

"use client";
import React, { useEffect, useState, Suspense, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';
import GoogleMapDisplay from '@/components/shared/GoogleMapDisplay';
import StayCard from '@/components/trips/StayCard';
import { Stay, Property } from '@/types';
import FilterModal from '@/components/shared/FilterModal';
import { useUI } from '@/core/store/uiContext';

// Helper function to convert Property to Stay type for StayCard
const convertPropertyToStay = (property: any): Stay => {
  return {
    id: property._id,
    title: property.title,
    description: property.description,
    images: property.images?.map((img: any) => img.url || img) || [],
    location: {
      city: property.location?.city || '',
      state: property.location?.state || '',
      country: property.location?.country || 'India',
      coordinates: property.location?.coordinates || [0, 0]
    },
    price: {
      amount: property.pricing?.basePrice || 0,
      currency: property.pricing?.currency || 'INR'
    },
    rating: property.rating?.average || 0,
    reviewCount: property.reviewCount || 0,
    host: {
      id: property.host?._id || property.host?.id || '',
      name: property.host?.name || 'Unknown Host',
      avatar: property.host?.profileImage || '',
      isSuperhost: false
    },
    amenities: property.amenities || [],
    tags: property.tags || [],
    maxGuests: property.maxGuests || 1,
    bedrooms: property.bedrooms || 0,
    beds: property.beds || 0,
    bathrooms: property.bathrooms || 0,
    instantBookable: property.instantBookable || false,
    createdAt: new Date(property.createdAt),
    updatedAt: new Date(property.updatedAt)
  };
};

// Property Image Carousel Component
const PropertyImageCarousel = ({ images, onFavorite, isFavorite, onClick }: { 
  images: string[], 
  onFavorite: () => void, 
  isFavorite: boolean,
  onClick: () => void 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageScrollRef = useRef<HTMLDivElement>(null);

  const handleImageScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (imageScrollRef.current) {
      const scrollLeft = imageScrollRef.current.scrollLeft;
      const imageWidth = imageScrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / imageWidth);
      setCurrentImageIndex(newIndex);
    }
  };

  return (
    <div className="relative aspect-[4/3] group" onClick={onClick}>
      {/* Horizontal Scrolling Images */}
      <div 
        ref={imageScrollRef}
        onScroll={handleImageScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        // onClick={(e) => e.stopPropagation()} // Prevent click from bubbling when scrolling images
      >
        {images && images.length > 0 ? (
          images.map((image, idx) => (
            <div key={idx} className="flex-shrink-0 w-full h-full snap-center relative">
              <Image
                src={image}
                alt={`Property image ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md z-10"
      >
        <svg 
          className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-700'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Image Pagination Dots */}
      {images && images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentImageIndex ? 'bg-white w-2' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows - Desktop only */}
      {images && images.length > 1 && (
        <>
          {currentImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                imageScrollRef.current?.scrollBy({ left: -imageScrollRef.current.offsetWidth, behavior: 'smooth' });
              }}
              className="hidden group-hover:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white transition-all shadow-md z-10"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {currentImageIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                imageScrollRef.current?.scrollBy({ left: imageScrollRef.current.offsetWidth, behavior: 'smooth' });
              }}
              className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white transition-all shadow-md z-10"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [listings, setListings] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [searchCenter, setSearchCenter] = useState<[number, number] | undefined>();
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>();
  const [mapBounds, setMapBounds] = useState<{
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  } | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const isFetchingRef = useRef(false);
  const initialPropertiesRef = useRef<any[]>([]);

  const lng = searchParams.get('lng');
  const lat = searchParams.get('lat');
  const city = searchParams.get('city');
  const guests = searchParams.get('guests');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [selectedStay, setSelectedStay] = useState<string | null>(null);
  const [wishlistName, setWishlistName] = useState('');
  const [wishlists, setWishlists] = useState<any[]>([]);
  
  // Bottom sheet states
  const [sheetState, setSheetState] = useState<'peek' | 'half' | 'full'>('half');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [showStickyMapButton, setShowStickyMapButton] = useState(false);
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  // const { hideHeader, setHideHeader } = useUI();
   const { hideHeader, setHideHeader ,hideBottomNav, setHideBottomNav } = useUI();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const SHEET_HEIGHTS = {
    peek: '12vh',
    half: '50vh',
    full: '92vh'
  };

  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowStickyMapButton(scrollTop > 100);
    setHideBottomNav(scrollTop > 100);
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (sheetState === 'full' && listScrollRef.current) {
      const scrollTop = listScrollRef.current.scrollTop;
      if (scrollTop > 0) return;
    }

    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setCurrentY(clientY);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCurrentY(clientY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaY = currentY - startY;
    const threshold = 80;
    
    if (sheetState === 'peek') {
      if (deltaY < -threshold) {
        setSheetState('half');
      }
    } else if (sheetState === 'half') {
      if (deltaY > threshold) {
        setSheetState('peek');
      } else if (deltaY < -threshold) {
        setSheetState('full');
      }
    } else if (sheetState === 'full') {
      if (deltaY > threshold) {
        setSheetState('half');
      }
    }
  };

  const applyFilters = async (filters: any) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      if (filters.priceRange.min) params.append('minPrice', filters.priceRange.min);
      if (filters.priceRange.max) params.append('maxPrice', filters.priceRange.max);
      if (filters.bedrooms) params.append('guests', filters.bedrooms);
      if (filters.beds) params.append('beds', filters.beds);
      if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
      if (filters.propertyTypes.length > 0) params.append('type', filters.propertyTypes.join(','));
      if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
      if (filters.instantBook) params.append('instantBook', 'true');
      if (filters.selfCheckIn) params.append('selfCheckIn', 'true');
      if (filters.freeCancel) params.append('freeCancel', 'true');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/listings?${params}`);
      const data = await response.json();
      
      if (data.success) {
        let listingsData = data.data;
        if (data.data && data.data.listings) listingsData = data.data.listings;
        if (!Array.isArray(listingsData)) listingsData = [];
        setListings(listingsData);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultsCountChange = (count: number) => {
    setFilteredResultsCount(count);
  };

  useEffect(() => {
    setHideHeader(true);
    return () => {
      setHideHeader(false);
    };
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      if (isFetchingRef.current) return;
      
      try {
        isFetchingRef.current = true;
        setLoading(true);
      
        const params: any = {
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };

        if (guests) params.guests = guests;
        if (checkIn) params.checkIn = checkIn;
        if (checkOut) params.checkOut = checkOut;
        if (city) params.city = city;

        if (lng && lat) {
          params.lng = lng;
          params.lat = lat;
          
          const defaultRadius = city && ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'].includes(city.toLowerCase()) 
            ? '50000' : '25000';
          params.radius = searchParams.get('radius') || defaultRadius;
          
          const center = [parseFloat(lng), parseFloat(lat)] as [number, number];
          setSearchCenter(center);
          setMapCenter(center);
          setMapInitialized(false);
        }

        const response = await apiClient.getListings(params);
      
        if (response.success && response.data) {
          const properties = response.data.listings || [];
          
          if (properties.length < 3 && city && lng && lat) {
            try {
              const fallbackParams = { ...params };
              delete fallbackParams.lng;
              delete fallbackParams.lat;
              delete fallbackParams.radius;
              fallbackParams.city = city;
              
              const fallbackResponse = await apiClient.getListings(fallbackParams);
              if (fallbackResponse.success && fallbackResponse.data) {
                const fallbackProperties = fallbackResponse.data.listings || [];
                initialPropertiesRef.current = fallbackProperties;
                setAllProperties(fallbackProperties);
                setListings(fallbackProperties);
              } else {
                initialPropertiesRef.current = properties;
                setAllProperties(properties);
                setListings(properties);
              }
            } catch (fallbackError) {
              initialPropertiesRef.current = properties;
              setAllProperties(properties);
              setListings(properties);
            }
          } else {
            initialPropertiesRef.current = properties;
            setAllProperties(properties);
            setListings(properties);
          }
          
          setTimeout(() => {
            setInitialLoadComplete(true);
            setMapInitialized(true);
          }, 1000);
        } else {
          setListings([]);
          setAllProperties([]);
        }
      } catch (error) {
        console.error('❌ Error fetching properties:', error);
        setListings([]);
        setAllProperties([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchProperties();
  }, [lng, lat, city, guests, checkIn, checkOut]);

  const handleBoundsChange = useCallback((bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => {
    if (mapBounds) {
      const latDiff = Math.abs(mapBounds.ne.lat - bounds.ne.lat) + Math.abs(mapBounds.sw.lat - bounds.sw.lat);
      const lngDiff = Math.abs(mapBounds.ne.lng - bounds.ne.lng) + Math.abs(mapBounds.sw.lng - bounds.sw.lng);
      if (latDiff < 0.01 && lngDiff < 0.01) return;
    }
    setMapBounds(bounds);
  }, [mapBounds]);

  const handleCenterChange = useCallback((center: [number, number]) => {
    setMapCenter(center);
  }, []);

  const handlePropertyClick = useCallback((propertyId: string) => {
    const property = allProperties.find(p => p._id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setShowPropertyModal(true);
    }
  }, [allProperties]);

  useEffect(() => {
    if (mapBounds && initialLoadComplete) {
      const bounds = `${mapBounds.sw.lng},${mapBounds.sw.lat},${mapBounds.ne.lng},${mapBounds.ne.lat}`;
      fetchPropertiesWithBounds(bounds);
    }
  }, [mapBounds, initialLoadComplete]);

  useEffect(() => {
    const loadWishlists = async () => {
      const res = await apiClient.getMyWishlists();
      setWishlists(res.data);

      const favSet = new Set<string>();
      res.data.forEach((wl: any) => {
        wl.items.forEach((item: any) => {
          favSet.add(item.itemId.id.toString());
        });
      });
      setFavorites(favSet);
    };

    loadWishlists();
  }, []);

  const fetchPropertiesWithBounds = async (bounds: string) => {
    try {
      const params = new URLSearchParams({ bounds });
      if (guests) params.append('guests', guests);
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/listings/map?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success && data.data) {
        const properties = data.data.listings || [];
        if (properties.length > 0) {
          setListings(properties);
          setAllProperties(properties);
        } else {
          if (initialPropertiesRef.current.length > 0) {
            setListings(initialPropertiesRef.current);
            setAllProperties(initialPropertiesRef.current);
          }
        }
      } else {
        if (initialPropertiesRef.current.length > 0) {
          setListings(initialPropertiesRef.current);
          setAllProperties(initialPropertiesRef.current);
        }
      }
    } catch (error) {
      if (initialPropertiesRef.current.length > 0) {
        setListings(initialPropertiesRef.current);
        setAllProperties(initialPropertiesRef.current);
      }
    }
  };

  const handleSearch = (location: any, guestsCount?: number, checkInDate?: string, checkOutDate?: string) => {
    const params = new URLSearchParams();
    params.set('lng', location.coordinates[0].toString());
    params.set('lat', location.coordinates[1].toString());
    params.set('city', location.value || location.label || '');
    if (guestsCount) params.set('guests', guestsCount.toString());
    if (checkInDate) params.set('checkIn', checkInDate);
    if (checkOutDate) params.set('checkOut', checkOutDate);
    router.push(`/search?${params.toString()}`);
  };

  const findWishlistItem = (stayId: string) => {
    for (const wl of wishlists) {
      const item = wl.items.find((i: any) => (i.itemId._id || i.itemId) === stayId);
      if (item) return { wishlistId: wl._id, wishlistItemId: item._id };
    }
    return null;
  };

  const handleFavorite = async (stayId: string) => {
    if (favorites.has(stayId)) {
      const found = findWishlistItem(stayId);
      if (!found) return;

      await apiClient.removeFromWishlist(found.wishlistId, found.wishlistItemId);
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
      return;
    }

    if (wishlists.length === 0) {
      setSelectedStay(stayId);
      setShowWishlistModal(true);
      return;
    }

    const wishlist = wishlists[0];
    const res = await apiClient.addToWishlist(wishlist._id, {
      itemType: 'Property',
      itemId: stayId
    });

    setWishlists(prev => prev.map(wl => wl._id === wishlist._id ? res.data : wl));
    setFavorites(prev => new Set(prev).add(stayId));
  };

  const createWishlistAndSave = async () => {
    const wishlist = await apiClient.createWishList({
      name: wishlistName,
      isPublic: false
    });

    await apiClient.addToWishlist(wishlist.data._id, {
      itemType: 'Property',
      itemId: selectedStay
    });

    setFavorites(prev => new Set(prev).add(selectedStay!));
    setWishlists(prev => [...prev, wishlist.data]);
    setShowWishlistModal(false);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentCardIndex(newIndex);
      
      if (stayListings[newIndex]) {
        setHoveredPropertyId(stayListings[newIndex].id);
      }
    }
  };
  
  const mapMarkers = useMemo(() => {
    return allProperties.map((property: any) => ({
      id: property._id,
      position: [property.location.coordinates[0], property.location.coordinates[1]] as [number, number],
      title: property.title,
      price: property.pricing?.basePrice,
      image: property.images?.[0]?.url,
      isHighlighted: hoveredPropertyId === property._id,
      onClick: () => handlePropertyClick(property._id),
      property: property
    }));
  }, [allProperties, hoveredPropertyId, handlePropertyClick]);

  const stayListings = useMemo(() => {
    return listings.map(convertPropertyToStay);
  }, [listings]);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onSearch={handleSearch}
        searchExpanded={searchExpanded}
        onSearchToggle={setSearchExpanded}
        visibleFilter={true}
        onFilterClick={() => setFilterOpen(true)}
      />

      <FilterModal 
        isOpen={filterOpen} 
        onClose={() => setFilterOpen(false)} 
        onApplyFilters={applyFilters} 
        resultsCount={filteredResultsCount}
        onResultsCountChange={handleResultsCountChange}
      />
      
      {/* Desktop View */}
      <div className={`hidden lg:block ${hideHeader ? "pt-20" : "pt-20"}`}>
        <div className="flex h-[calc(100vh-5rem)]">
          <div className="w-1/2 overflow-y-auto pb-8">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {listings.length > 0 ? `Over ${listings.length} homes` : 'No homes found'}
                </h1>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Prices include all fees</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading places...</p>
                  </div>
                </div>
              ) : stayListings.length > 0 ? (
                <div className="grid grid-cols-3 gap-6">
                  {stayListings.map((stay) => (
                    <StayCard
                      key={stay.id}
                      stay={stay}
                      onMouseEnter={() => setHoveredPropertyId(stay.id)}
                      onMouseLeave={() => setHoveredPropertyId(null)}
                      guests={guests}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      isFavorite={favorites.has(stay.id)}
                      onFavorite={handleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search location or dates.</p>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Search again
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-1/2 p-4 pt-8">
            <div className="h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <GoogleMapDisplay
                center={mapCenter || searchCenter || [78.9629, 20.5937]}
                zoom={(mapCenter || searchCenter) ? 14 : 5}
                markers={mapMarkers}
                onBoundsChange={handleBoundsChange}
                onCenterChange={handleCenterChange}
                height="100%"
                className="w-full h-full rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden fixed inset-0 flex flex-col">
        <div className="flex-1 relative">
          <GoogleMapDisplay
            center={mapCenter || searchCenter || [78.9629, 20.5937]}
            zoom={(mapCenter || searchCenter) ? 14 : 5}
            markers={mapMarkers}
            onBoundsChange={handleBoundsChange}
            onCenterChange={handleCenterChange}
            height="100%"
            className="w-full h-full"
          />

          <div className="absolute top-20 left-0 right-0 z-10 flex justify-center pointer-events-none">
            <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Prices include all fees</span>
            </div>
          </div>

          {sheetState === 'full' && showStickyMapButton && (
            <button
              onClick={() => setSheetState('half')}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold shadow-xl flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </button>
          )}
        </div>

        {/* Bottom Sheet */}
        <div
          ref={sheetRef}
          className="absolute left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-40"
          style={{
            bottom: 0,
            height: SHEET_HEIGHTS[sheetState],
            transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'none'
          }}
        >
          <div 
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          <div className="h-[calc(100%-2.5rem)] overflow-hidden flex flex-col">
            {sheetState === 'peek' && (
              <div className="flex-1 flex items-center justify-center pb-20">
                <p className="text-gray-600 text-sm">Pull up to see properties</p>
              </div>
            )}

            {sheetState === 'half' && (
              <div className="flex-1 px-4 pb-20">
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide h-full"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {stayListings.map((stay) => (
                    <div key={stay.id} className="flex-shrink-0 w-[85vw] snap-center">
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 h-full">
                        <PropertyImageCarousel
                          images={stay.images}
                          onFavorite={() => handleFavorite(stay.id)}
                          isFavorite={favorites.has(stay.id)}
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (guests) params.set('guests', guests);
                            if (checkIn) params.set('checkIn', checkIn);
                            if (checkOut) params.set('checkOut', checkOut);
                            router.push(`/rooms/${stay.id}?${params.toString()}`);
                          }}
                        />

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{stay.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {stay.description || `${stay.bedrooms} bedroom · ${stay.beds} bed`}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <span className="text-lg font-bold text-gray-900">₹{stay.price.amount}</span>
                              <span className="text-sm text-gray-600"> / night</span>
                            </div>
                            
                            {stay.rating > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold text-gray-900">{stay.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pb-2 pt-2">
                  <span className="text-xs font-medium text-gray-600">
                    {currentCardIndex + 1} / {stayListings.length}
                  </span>
                </div>
              </div>
            )}

            {sheetState === 'full' && (
              <div 
                ref={listScrollRef}
                onScroll={handleListScroll}
                className="flex-1 overflow-y-auto pb-20"
              >
                <div className="px-4 pt-2 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {listings.length} places
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {stayListings.map((stay) => (
                      <div
                        key={stay.id}
                        className="bg-white rounded-xl overflow-hidden border border-gray-200"
                      >
                        <PropertyImageCarousel
                          images={stay.images}
                          onFavorite={() => handleFavorite(stay.id)}
                          isFavorite={favorites.has(stay.id)}
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (guests) params.set('guests', guests);
                            if (checkIn) params.set('checkIn', checkIn);
                            if (checkOut) params.set('checkOut', checkOut);
                            router.push(`/rooms/${stay.id}?${params.toString()}`);
                          }}
                        />

                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{stay.title}</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-gray-900">₹{stay.price.amount}</span>
                            <span className="text-xs text-gray-600">/ night</span>
                          </div>
                          {stay.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs mt-1">
                              <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-semibold text-gray-900">{stay.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {showWishlistModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Create new list</h3>
            <input
              className="border border-gray-300 w-full p-3 rounded-lg mb-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              placeholder="My dream stays"
              value={wishlistName}
              onChange={e => setWishlistName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowWishlistModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50"
                onClick={createWishlistAndSave}
                disabled={!wishlistName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}