// "use client";

// import { useRouter } from "next/navigation";
// import OnboardingLayout from "@/components/host/OnboardingLayout";
// serviceOnboarding
// import Button from "@/components/ui/Button";
// import { serviceOnboarding } from "@/core/context/ServiceContext";

// export default function ServiceReviewPage() {
//   const router = useRouter();
//   const { data } = serviceOnboarding();

//   const isReady =
//     data.title &&
//     data.description &&
//     data.pricing?.basePrice &&
//     data.duration?.minDuration &&
//     data.location;

//   const handlePublish = async () => {
//     if (!isReady) return;

//     // TODO: replace with real API call
//     console.log("Publishing service:", data);

//     router.push("/host/dashboard");
//   };

//   return (
//     <OnboardingLayout
//       flow="service"
//       currentMainStep={3}
//       currentSubStep="review"
//       showNextButton={false}
//     >
//       <h1 className="text-3xl font-semibold mb-3">
//         Review your service
//       </h1>

//       <p className="text-gray-500 mb-8">
//         Make sure everything looks right before publishing.
//       </p>

//       <div className="space-y-6">
//         {/* Title */}
//         <ReviewSection label="Title">
//           {data.title}
//         </ReviewSection>

//         {/* Description */}
//         <ReviewSection label="Description">
//           {data.description}
//         </ReviewSection>

//         {/* Location */}
//         <ReviewSection label="Location">
//           {data.location?.address}, {data.location?.city},{" "}
//           {data.location?.state}
//         </ReviewSection>

//         {/* Duration */}
//         <ReviewSection label="Duration">
//           {data.duration?.minDuration}–{data.duration?.maxDuration}{" "}
//           {data.duration?.unit}
//         </ReviewSection>

//         {/* Pricing */}
//         <ReviewSection label="Price">
//           {data.pricing?.currency === "INR" ? "₹" : "$"}
//           {data.pricing?.basePrice}
//           {data.pricing?.perPersonPrice
//             ? ` + ${data.pricing.currency === "INR" ? "₹" : "$"}${data.pricing.perPersonPrice} / person`
//             : ""}
//         </ReviewSection>

//         {/* Media */}
//         <ReviewSection label="Photos">
//           {data.photos?.images.length
//             ? `${data.photos.images.length} photos uploaded`
//             : "No photos added"}
//         </ReviewSection>
//       </div>

//       {/* Publish button */}
//       <div className="mt-10">
//         <Button
//           disabled={!isReady}
//           onClick={handlePublish}
//           className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-xl text-lg font-medium disabled:opacity-50"
//         >
//           Publish service
//         </Button>

//         {!isReady && (
//           <p className="text-sm text-red-500 mt-3">
//             Please complete all required steps before publishing.
//           </p>
//         )}
//       </div>
//     </OnboardingLayout>
//   );
// }

// function ReviewSection({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="border border-gray-200 rounded-xl p-5">
//       <p className="text-sm text-gray-500 mb-1">{label}</p>
//       <p className="text-lg font-medium text-gray-900">
//         {children || "—"}
//       </p>
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/host/OnboardingLayout";
import Button from "@/components/ui/Button";
import { serviceOnboarding } from "@/core/context/ServiceContext";
import { Edit, Image as ImageIcon } from "lucide-react";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import { useParams, useSearchParams } from "next/navigation";



export default function ServiceReviewPage() {
  const router = useRouter();
  const { data } = serviceOnboarding();

  const params = useParams();
const searchParams = useSearchParams();

const serviceId = params.id;
const isEditMode = searchParams.get("mode") === "edit";

  const isReady =
    data.title &&
    data.description &&
    data.pricing?.basePrice &&
    data.duration?.minDuration &&
    data.location &&
    data.groupSize;


    const getEditUrl = (path: string) => {
  if (isEditMode && serviceId) {
    return `/host/service/${serviceId}/${path}?mode=edit`;
  }
  return `/host/service/new/${path}`;
};

const handlePublish = async () => {
  if (!isReady) return;
   console.log('Publishing service:', data.location);
  try {
    // ✅ Fix data structure to match backend expectations
    const serviceData = {
      title: data.title,
      description: data.description,
      serviceType: data.serviceCategory, // ✅ Use serviceCategory as serviceType
      location: {
        address: data.location?.address,
        city: data.location?.city,
        state: data.location?.state,
        country: data.location?.country,
        pincode: data.location?.pincode,
        coordinates: data.location?.coordinates,

        type: "Point" // ✅ Add required type
      },
      groupSize: {
        min: data.groupSize?.min,
        max: data.groupSize?.max
      },
      pricing: {
        basePrice: data.pricing?.basePrice,
        currency: data.pricing?.currency || "INR",
        perPersonPrice: data.pricing?.perPersonPrice || 0,
        minPrice: data.pricing?.minPrice || 100,
        maxPrice: data.pricing?.maxPrice || 1000
      },
      duration: {
        minDuration: data.duration?.minDuration,
        maxDuration: data.duration?.maxDuration,
        unit: data.duration?.unit || "hours", // ✅ Ensure valid enum value
        value: 60 // ✅ Add required value field
      },
    media: [
    ...(data.photos?.images?.map(url => ({
      url,
      type: 'image',
      caption: ''
    })) || []),
    ...(data.photos?.videos?.map(url => ({
      url,
      type: 'video',
      caption: ''
    })) || [])
  ],
      status: 'published'
    };

    console.log('📤 Publishing service data:', serviceData);
    let response;
    if(isEditMode && serviceId){
      console.log('Updating service:', serviceData);
    response = await apiClient.updateService(serviceId, serviceData);
   }else{
    response = await apiClient.createService(serviceData);
   }

    if (response.success) {
      console.log('✅ Service published successfully:', response.data);
      router.push('/host/dashboard');
    } else {
      console.error('❌ Failed to publish service:', response.message);
      alert(response.message || 'Failed to publish service');
    }
  } catch (error) {
    console.error('❌ Error publishing service:', error);
    alert('An error occurred while publishing your service');
  }
};
  return (
    <OnboardingLayout
      flow="service"
      currentMainStep={3}
      currentSubStep="review"
      showNextButton={false}
    >
      <h1 className="text-3xl font-semibold mb-3">
        Review your service
      </h1>

      <p className="text-gray-500 mb-8">
        Make sure everything looks right before publishing.
      </p>

      <div className="space-y-6">
        {/* Title */}
        <ReviewSection 
          label="Title"
          onEdit={() => router.push(getEditUrl('title'))}
        >
          {data.title || "—"}
        </ReviewSection>

        {/* Description */}
        <ReviewSection 
          label="Description"
          onEdit={() => router.push(getEditUrl('description'))}
        >
          {data.description || "—"}
        </ReviewSection>

        {/* Location */}
        <ReviewSection 
          label="Location"
          onEdit={() => router.push(getEditUrl('location'))}
        >
          {data.location?.address ? (
            <div>
              <p>{data.location.address}</p>
              <p className="text-sm text-gray-600 mt-1">
                {data.location.city}, {data.location.state}, {data.location.country}
              </p>
            </div>
          ) : (
            "—"
          )}
        </ReviewSection>

        {/* Duration */}
        <ReviewSection 
          label="Duration"
          onEdit={() => router.push(getEditUrl('duration'))}
        >
          {data.duration?.minDuration && data.duration?.maxDuration ? (
            `${data.duration.minDuration}–${data.duration.maxDuration} ${data.duration.unit}`
          ) : (
            "—"
          )}
        </ReviewSection>

        <ReviewSection 
  label="Group size"
  onEdit={() => router.push(getEditUrl('groupSize'))}
>
  {data.groupSize?.min && data.groupSize?.max 
    ? `${data.groupSize.min}–${data.groupSize.max} people`
    : "Not set"
  }
</ReviewSection>

        {/* Pricing */}
        <ReviewSection 
          label="Price"
          onEdit={() => router.push(getEditUrl('pricing'))}
        >
          {data.pricing?.basePrice ? (
            <div>
              <p className="text-lg">
                {data.pricing.currency === "INR" ? "₹" : "$"}
                {data.pricing.basePrice}
              </p>
              {data.pricing.perPersonPrice && (
                <p className="text-sm text-gray-600">
                  + {data.pricing.currency === "INR" ? "₹" : "$"}
                  {data.pricing.perPersonPrice} / person
                </p>
              )}
            </div>
          ) : (
            "—"
          )}
        </ReviewSection>

        {/* Media - Photos Grid */}
        <ReviewSection 
          label="Photos"
          onEdit={() => router.push(getEditUrl('media'))}
        >
          {data.photos?.images && data.photos.images.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-3">
              {data.photos.images.slice(0, 8).map((url, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={url}
                    alt={`Service photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {data.photos.images.length > 8 && (
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    +{data.photos.images.length - 8} more
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No photos added</p>
            </div>
          )}
        </ReviewSection>
      </div>

      {/* Publish button */}
      <div className="mt-10">
        <Button
          disabled={!isReady}
          onClick={handlePublish}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-xl text-lg font-medium disabled:opacity-50"
        >
          Publish service
        </Button>

        {!isReady && (
          <p className="text-sm text-red-500 mt-3">
            Please complete all required steps before publishing.
          </p>
        )}
      </div>
    </OnboardingLayout>
  );
}

function ReviewSection({
  label,
  children,
  onEdit,
}: {
  label: string;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>
      <div className="text-lg font-medium text-gray-900">
        {children}
      </div>
    </div>
  );
}
