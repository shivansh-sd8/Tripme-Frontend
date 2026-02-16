

"use client";

import { serviceOnboarding } from "@/core/context/ServiceContext";
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from "@/core/context/OnboardingContext";
import { useRouter ,useParams,useSearchParams } from "next/navigation";
import { useState

 } from "react";

 
export default function TitlePage() {
     const router = useRouter();
  // const { draft, setField } = serviceOnboarding();
  const { data, updateData, goToNextSubStep } = serviceOnboarding();
  const [title, setTitle] = useState(data.title || '');
  const MIN_TITLE_LENGTH = 15;
  const MAX_TITLE_LENGTH = 25;
    const selected = data.serviceCategory;
    const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params.id;
  const isEditMode = searchParams.get("mode") === "edit";


  const trimmedTitle = title.trim();
  
  const isTitleValid =
  trimmedTitle.length >= MIN_TITLE_LENGTH &&
  trimmedTitle.length <= MAX_TITLE_LENGTH;
  
  // const handleNext = () => {
  //   if (!title.trim()) return;
  //   updateData({ title: title.trim() });
  //   router.push('/host/service/new/description');
  // };

   const handleNext = () => {

     if (!title.trim()) return;
  updateData({ title: title.trim() });

  if (isEditMode && id) {
    router.push(`/host/service/${id}/description?mode=edit`);
  } else {
    router.push("/host/service/new/description");
  }
};

  

  return (
     <OnboardingLayout
      flow="service"
          currentMainStep={2}
          currentSubStep="title"
          nextDisabled={!isTitleValid}
          onNext={handleNext}
        >
      <h1 className="text-3xl font-semibold mb-6">
        Give your service a title
      </h1>

      <div className="max-w-lg">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
            placeholder="ENTER TITLE OF SERVICE"
            rows={3}
            className="w-full px-4 py-4 text-2xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm text-gray-500">
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
          </div>
        </div>
    </OnboardingLayout>
  );
}
