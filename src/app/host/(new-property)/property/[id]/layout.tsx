

"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { OnboardingProvider, useOnboarding } from "@/core/context/OnboardingContext";

export default function ServiceEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <EditLoader>{children}</EditLoader>
    </OnboardingProvider>
  );
}

function EditLoader({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { updateData } = useOnboarding();

  const [loading, setLoading] = useState(true);
  const isEditMode = searchParams.get("mode") === "edit";

  useEffect(() => {
    if (!isEditMode || !id) {
      setLoading(false);
      return;
    }

    async function loadListing() {
      const response = await apiClient.getListing(id as string);

      if (response.success && response.data) {
        const l = response.data.listing;

        // Map backend Property → OnboardingContext shape (complete mapping)
        const mappedData = {
          listingId: l._id,

          // ── Step 1: structure ──────────────────────────────────────────────
          // Backend field `type` maps to structureType (e.g. 'house', 'villa')
          structureType: l.type,

          // ── Step 1: privacy / place type ──────────────────────────────────
          // OnboardingContext uses `propertyType` for what the backend calls `placeType`
          propertyType: l.placeType,   // 'entire' | 'room' | 'shared'

          // ── Step 1: floor plan ─────────────────────────────────────────────
          floorPlan: {
            guests:    l.maxGuests  || 1,
            bedrooms:  l.bedrooms   || 1,
            beds:      l.beds       || 1,
            bathrooms: l.bathrooms  || 1,
          },

          // ── Step 1: location ───────────────────────────────────────────────
          // Backend uses GeoJSON [lng, lat]; OnboardingContext uses { lat, lng }
          location: l.location ? {
            address:  l.location.address   || '',
            city:     l.location.city      || '',
            state:    l.location.state     || '',
            country:  l.location.country   || 'India',
            pincode:  l.location.postalCode || '',
            coordinates: l.location.coordinates?.length === 2
              ? { lat: l.location.coordinates[1], lng: l.location.coordinates[0] }
              : { lat: 20.5937, lng: 78.9629 },
          } : undefined,

          // ── Step 2: photos / title / description ───────────────────────────
          photos: (l.images || []).map((img: any) => ({
            url:       img.url,
            category:  img.category  || 'other',
            isPrimary: img.isPrimary || false,
          })),
          title:       l.title       || '',
          description: l.description || '',

          // ── Step 2: amenities ──────────────────────────────────────────────
          amenities: l.amenities || [],

          // ── Step 3: pricing ────────────────────────────────────────────────
          pricing: {
            basePrice:           l.pricing?.basePrice        || 0,
            currency:            l.pricing?.currency         || 'INR',
            extraGuestPrice:     l.pricing?.extraGuestPrice  || 0,
            cleaningFee:         l.pricing?.cleaningFee      || 0,
            securityDeposit:     l.pricing?.securityDeposit  || 0,
            serviceFee:          l.pricing?.serviceFee       || 0,
            weeklyDiscount:      l.pricing?.weeklyDiscount   || 0,
            monthlyDiscount:     l.pricing?.monthlyDiscount  || 0,
            // Anytime check-in: enabled if enable24HourBooking=true OR basePrice24Hour > 0
            anytimeCheckInEnabled: !!(l.enable24HourBooking || (l.pricing?.basePrice24Hour > 0)),
            anytimeCheckInPrice:   l.pricing?.basePrice24Hour || 0,
          },

          // ── Step 3: booking settings ───────────────────────────────────────
          checkInTime:        l.checkInTime        || '15:00',
          checkOutTime:       l.checkOutTime       || '11:00',
          cancellationPolicy: l.cancellationPolicy || 'moderate',

          // ── Step 3: availability / trip length ─────────────────────────────
          availability: {
            instantBook: l.bookingSettings?.instantBookable ?? true,
            minNights:   l.bookingSettings?.minStay  || l.minNights  || 1,
            maxNights:   l.bookingSettings?.maxStay  || l.maxNights  || 365,
          },

          // ── Step 3: house rules ────────────────────────────────────────────
          houseRules: l.houseRules || { common: [], additional: {} },

          // ── Step 3: hourly booking ─────────────────────────────────────────
          hourlyBooking: {
            enabled:      l.hourlyBooking?.enabled      || false,
            minStayDays:  l.hourlyBooking?.minStayDays  || 1,
            hourlyRates: {
              sixHours:      l.hourlyBooking?.hourlyRates?.sixHours      || 0.30,
              twelveHours:   l.hourlyBooking?.hourlyRates?.twelveHours   || 0.60,
              eighteenHours: l.hourlyBooking?.hourlyRates?.eighteenHours || 0.75,
            },
          },
        };

        console.log('✅ EditLoader: mapped property data into OnboardingContext →', mappedData);
        updateData(mappedData);
      }

      setLoading(false);
    }

    loadListing();
  }, [id, isEditMode]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return <ProtectedRoute requireHost>{children}</ProtectedRoute>;
}
