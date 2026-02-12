"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/host/OnboardingLayout";
import { serviceOnboarding } from "@/core/context/ServiceContext";


const MIN_PRICE = 100;

export default function ServicePricingPage() {
  const router = useRouter();
  const { data, updateData, goToNextSubStep } = serviceOnboarding();

  const [basePrice, setBasePrice] = useState<number>(
    data.pricing?.basePrice || 0
  );
  const [perPersonPrice, setPerPersonPrice] = useState<number>(
    data.pricing?.perPersonPrice || 0
  );
  const [currency, setCurrency] = useState<"INR" | "USD">(
    data.pricing?.currency as "INR" | "USD" || "INR"
  );

  const isValid = basePrice >= MIN_PRICE;

  const handleNext = () => {
    if (!isValid) return;

    updateData({
      pricing: {
        basePrice,
        currency: "INR",
        perPersonPrice,
        minPrice: MIN_PRICE,
        maxPrice: basePrice + perPersonPrice,
      },
    });

    const nextUrl = goToNextSubStep();
    if (nextUrl) router.push(nextUrl);
  };

  return (
    <OnboardingLayout
      flow="service"
      currentMainStep={3}
      currentSubStep="pricing"
      nextDisabled={!isValid}
      onNext={handleNext}
    >
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-3">
        Set your price
      </h1>

      <p className="text-gray-500 mb-8">
        You can change this anytime.
      </p>

      <div className="max-w-md space-y-8">
        {/* Base price */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Base price
          </label>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-medium">
              { currency}
            </span>

            <input
              type="number"
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full text-2xl px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none"
              placeholder="0"
            />
          </div>

          <p className="text-sm text-gray-400 mt-2">
            Minimum {currency === "INR" ? "₹100" : "$10"}
          </p>

          {!isValid && (
            <p className="text-sm text-red-500 mt-1">
              Base price must be at least {currency === "INR" ? "₹100" : "$10"}
            </p>
          )}
        </div>

        {/* Per person price (optional) */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Additional price per person (optional)
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xl">
              {currency === "INR" ? "₹" : "$"}
            </span>

            <input
              type="number"
              min={0}
              value={perPersonPrice}
              onChange={(e) => setPerPersonPrice(Number(e.target.value))}
              className="w-full text-xl px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none"
              placeholder="0"
            />
          </div>

          <p className="text-sm text-gray-400 mt-2">
            Charged for each additional guest
          </p>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Currency
          </label>

          <select
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value as "INR" | "USD")
            }
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-black"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>
        </div>

        {/* Earnings preview (Airbnb-style hint) */}
        {isValid && (
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              Guests will pay
            </p>
            <p className="text-2xl font-semibold">
              {currency === "INR" ? "₹" : "$"}
              {basePrice}
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
