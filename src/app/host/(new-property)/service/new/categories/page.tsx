// // "use client";

// // import { useRouter } from "next/navigation";

// // const categories = [
// //   { id: "chef", label: "Private chef" },
// //   { id: "photography", label: "Photography" },
// //   { id: "ransportation", label: "Transportation" },
// //   { id: "tour Guide", label: "Tour Guide"},
// //   { id: "catering", label: "Catering"},
// //   { id: "entertainment", label: "Entertainment"},
// //   { id: "wellness", label: "Wellness"},
// //   { id: "adventure", label: "Adventure"},
// //   { id: "wellness", label: "Wellness"},
// //   { id: "cultural", label: "Cultural"},
// // ];




// // export default function ServiceCategoryPage() {
// //   const router = useRouter();

// //   return (
// //     <>
// //       <h1 className="text-3xl font-semibold mb-6">
// //         What service do you offer?
// //       </h1>

// //       <div className="space-y-4">
// //         {categories.map(cat => (
// //           <button
// //             key={cat.id}
// //             onClick={() => {
// //               // save to store / backend draft
// //               router.push("/host/service/new/title");
// //             }}
// //             className="w-full p-6 border rounded-xl text-left hover:border-black transition"
// //           >
// //             {cat.label}
// //           </button>
// //         ))}
// //       </div>
// //     </>
// //   );
// // }

// "use client";

// import { useRouter } from "next/navigation";
// import { useServiceDraft } from "@/components/host/ServiceContext";

// const SERVICES = [
//   { id: "catering", label: "Catering", icon: "🍱" },
//   { id: "chef", label: "Chef", icon: "👨‍🍳" },
//   { id: "photography", label: "Photography", icon: "📸" },
//   { id: "transportation", label: "Transportation", icon: "🚗" },
//   { id: "tour-guide", label: "Tour guide", icon: "🗺️" },
//   { id: "entertainment", label: "Entertainment", icon: "🎭" },
//   { id: "wellness", label: "Wellness", icon: "🧘‍♀️" },
//   { id: "massage", label: "Massage", icon: "💆" },
// ];

// export default function ServiceCategoryPage() {
//   const router = useRouter();
//   const { draft, setField } = useServiceDraft();

//   return (
//     <>
//       <h1 className="text-3xl font-semibold text-center mb-10">
//         What service will you provide?
//       </h1>

//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
//         {SERVICES.map((service) => {
//           const isSelected = draft.serviceType === service.id;

//           return (
//             <button
//               key={service.id}
//               onClick={() => {
//                 setField("serviceType", service.id);
//                 router.push("/host/service/new/title");
//               }}
//               className={`
//                 flex flex-col items-center justify-center
//                 p-6 rounded-2xl border
//                 transition-all duration-200
//                 hover:shadow-md hover:border-black
//                 ${
//                   isSelected
//                     ? "border-black shadow-md"
//                     : "border-gray-200"
//                 }
//               `}
//             >
//               {/* Icon */}
//               <div className="text-4xl mb-4">
//                 {service.icon}
//               </div>

//               {/* Label */}
//               <div className="text-base font-medium text-gray-900">
//                 {service.label}
//               </div>
//             </button>
//           );
//         })}
//       </div>
//     </>
//   );
// }


"use client";

import { useParams, useRouter ,useSearchParams} from "next/navigation";
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { serviceOnboarding } from "@/core/context/ServiceContext";

import {
  ChefHat,
  Camera,
  Sparkles,
  Dumbbell,
  Music,
  Car,
  Paintbrush,
  Briefcase,
} from "lucide-react";

const SERVICE_CATEGORIES = [
  { id: "chef", label: "Chef", icon: ChefHat },
  { id: "photographer", label: "Photography", icon: Camera },
  { id: "cleaning", label: "Cleaning", icon: Sparkles },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "music", label: "Music", icon: Music },
  { id: "transport", label: "Transport", icon: Car },
  { id: "art", label: "Art & Craft", icon: Paintbrush },
  { id: "tour-guide", label: "Business", icon: Briefcase },
];

export default function ServiceCategoryPage() {
  const router = useRouter();
  const { data, updateData, goToNextSubStep } = serviceOnboarding();

  const selected = data.serviceCategory;
  const params = useParams();
const searchParams = useSearchParams();

const id = params.id;
const isEditMode = searchParams.get("mode") === "edit";



  //  const handleNext = () => {
  //   updateData({ serviceCategory: selected });
  //   // Move to Step 3: pricing
  //   router.push('/host/service/new/title');
  // };

  const handleNext = () => {
  updateData({ serviceCategory: selected });

  if (isEditMode && id) {
    router.push(`/host/service/${id}/title?mode=edit`);
  } else {
    router.push("/host/service/new/title");
  }
};

  return (
    <OnboardingLayout
    flow="service"
      currentMainStep={1}
      currentSubStep="categories"
      nextDisabled={!selected}
      onNext={handleNext}
    >
      <h1 className="text-3xl font-semibold mb-3">
        What service do you provide?
      </h1>

      <p className="text-gray-500 mb-8">
        Choose the category that best describes your service.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SERVICE_CATEGORIES.map(({ id, label, icon: Icon }) => {
          const isActive = selected === id;

          return (
            <button
              key={id}
              onClick={() => updateData({ serviceCategory: id })}
              className={`
                border rounded-xl p-6 text-left transition
                hover:border-black
                ${
                  isActive
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }
              `}
            >
              <Icon className="w-7 h-7 mb-4" />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
