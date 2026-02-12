// // "use client";

// // import { useOnboarding } from "@/core/context/OnboardingContext";

// // export default function ServiceDescriptionPage() {
// //   const { data, updateData } = useOnboarding();

// //   return (
// //     <div className="max-w-xl">
// //       <h1 className="text-3xl font-semibold mb-3">
// //         Describe your service
// //       </h1>

// //       <p className="text-gray-500 mb-8">
// //         Tell guests what they’ll experience. Be clear and welcoming.
// //       </p>

// //       <textarea
// //         value={data.description ?? ""}
// //         onChange={(e) =>
// //           updateData({ description: e.target.value })
// //         }
// //         placeholder="What will guests do? What makes your service special?"
// //         rows={6}
// //         className="
// //           w-full text-lg
// //           outline-none
// //           border-b
// //           resize-none
// //           pb-3
// //           focus:border-black
// //           transition
// //         "
// //       />

// //       {/* Airbnb-style helper text */}
// //       <p className="text-sm text-gray-400 mt-4">
// //         Minimum 20 characters
// //       </p>
// //     </div>
// //   );
// // }

// "use client";

// import { useRouter } from "next/navigation";
// import { useOnboarding } from "@/core/context/OnboardingContext";
// import OnboardingLayout from '@/components/host/OnboardingLayout';
// import { useState } from "react";

// export default function ServiceDescriptionPage() {
//   const router = useRouter();
//   const { data, updateData, goToNextSubStep } = useOnboarding();
//   const [description, setDescription] = useState(data.description || "");

//   const MIN_LENGTH = 40;
//   const MAX_LENGTH = 50;


//   const trimmedDescription = description.trim();
  
//   const isValid =
//   trimmedDescription.length >= MIN_LENGTH &&
//   trimmedDescription.length <= MAX_LENGTH;
 
 
 
//     const handleNext = () => {
//     if (!data.description?.trim()) return;
//     updateData({ description: trimmedDescription });
//     router.push('/host/service/new/location');
//   };
//   return (
//     <OnboardingLayout
//       currentMainStep={2}
//      currentSubStep="description"
//       nextDisabled={!isValid}
//       onNext={handleNext}
//     >
//       <h1 className="text-3xl font-semibold mb-3">
//         Describe your service
//       </h1>

//       <p className="text-gray-500 mb-8">
//         Tell guests what they’ll experience.
//       </p>

//     <div className="max-w-lg">
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value.slice(0, MAX_LENGTH))}
//             placeholder="You'll have a great time at this comfortable place to stay."
//             rows={6}
//             className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
//           />
//           <div className="flex justify-end mt-2">
//             <span className="text-sm text-gray-500">
//               {description.length}/{MAX_LENGTH}
//             </span>
//           </div>
//         </div>

//       <p className="text-sm text-gray-400 mt-4">
//         Minimum {MIN_LENGTH} characters
//       </p>
//     </OnboardingLayout>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/host/OnboardingLayout";

import { useState } from "react";
import { serviceOnboarding,  } from "@/core/context/ServiceContext";

export default function ServiceDescriptionPage() {
  const router = useRouter();
  const { data, updateData, goToNextSubStep } = serviceOnboarding();

  const [description, setDescription] = useState(data.description || "");

  const MIN_LENGTH = 40;
  const MAX_LENGTH = 50;

  const trimmedDescription = description.trim();
  const isValid =
    trimmedDescription.length >= MIN_LENGTH &&
    trimmedDescription.length <= MAX_LENGTH;

  const handleNext = () => {
    if (!isValid) return;

    updateData({ description: trimmedDescription });

    const next = goToNextSubStep();
    if (next) router.push(next);
  };

  return (
    <OnboardingLayout
     flow="service"
      currentMainStep={2}
      currentSubStep="description"
      nextDisabled={!isValid}
      onNext={handleNext}
    >
      <h1 className="text-3xl font-semibold mb-3">
        Describe your service
      </h1>

      <p className="text-gray-500 mb-8">
        Tell guests what they’ll experience.
      </p>

      <div className="max-w-lg">
        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value.slice(0, MAX_LENGTH))
          }
          placeholder="Describe what guests will do, learn, or enjoy."
          rows={6}
          className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
        />

        <div className="flex justify-end mt-2">
          <span className="text-sm text-gray-500">
            {trimmedDescription.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-4">
        Minimum {MIN_LENGTH} characters
      </p>
    </OnboardingLayout>
  );
}
