// "use client";

// import { useState } from "react";
// import { Home, Users, Clock, Heart, Shield, X } from "lucide-react";

// interface HouseRulesProps {
//   houseRules?: string[];
//   customRules?: string[];
//   checkInTime?: string;
//   checkOutTime?: string;
// }

// const ruleIcons: Record<string, any> = {
//   'No smoking': X,
//   'No parties or events': Users,
//   'No pets': Heart,
//   'No unregistered guests': Users,
//   'Quiet hours': Clock,
//   'Check-in time restrictions': Clock,
//   'Check-out time restrictions': Clock,
//   'No food or drink in bedrooms': Home,
//   'Shoes off indoors': Home,
//   'No children': Users,
//   'No filming/photography': Shield,
//   'Additional guests fee': Users,
//   'Security deposit required': Shield,
//   'ID verification required': Shield
// };

// export default function HouseRules({ 
//   houseRules = [], 
//   customRules = [],
//   checkInTime = '15:00',
//   checkOutTime = '11:00'
// }: HouseRulesProps) {
//   const [showAll, setShowAll] = useState(false);

//   const allRules = [...houseRules, ...customRules];
//   const displayRules = showAll ? allRules : allRules.slice(0, 6);

//   return (
//     <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-5 sm:p-8">
//       {/* Header */}
//       <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
//         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center">
//           <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//         </div>
//         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
//           House rules
//         </h2>
//       </div>

//       {/* Check-in/Check-out Times */}
//       <div className="bg-gray-50 rounded-xl p-4 mb-6">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <p className="text-sm text-gray-600 mb-1">Check-in</p>
//             <p className="font-semibold text-gray-900">After {checkInTime}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 mb-1">Check-out</p>
//             <p className="font-semibold text-gray-900">Before {checkOutTime}</p>
//           </div>
//         </div>
//       </div>

//       {/* Rules List */}
//       <div className="space-y-3">
//         {displayRules.map((rule, index) => {
//           const Icon = ruleIcons[rule] || Shield;
//           return (
//             <div key={index} className="flex items-start gap-3">
//               <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
//                 <Icon className="w-3 h-3 text-gray-600" />
//               </div>
//               <p className="text-gray-700 text-sm sm:text-base">{rule}</p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Show More/Less Button */}
//       {allRules.length > 6 && (
//         <button
//           onClick={() => setShowAll(!showAll)}
//           className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
//         >
//           {showAll ? 'Show less rules' : `Show ${allRules.length - 6} more rules`}
//         </button>
//       )}

//       {/* Empty State */}
//       {allRules.length === 0 && (
//         <div className="text-center py-8">
//           <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <p className="text-gray-600">No specific house rules</p>
//           <p className="text-sm text-gray-500 mt-1">Standard Tripme policies apply</p>
//         </div>
//       )}

//       {/* Additional Info */}
//       <div className="mt-6 pt-6 border-t border-gray-200">
//         <p className="text-sm text-gray-600">
//           By booking this property, you agree to these house rules and the Tripme 
//           <a href="#" className="text-indigo-600 hover:underline ml-1">Terms of Service</a> and 
//           <a href="#" className="text-indigo-600 hover:underline ml-1">Guest Refund Policy</a>.
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Home, Users, Clock, Heart, Shield, X } from "lucide-react";

interface HouseRulesProps {
  houseRules?: {
    common: string[];
    additional: Record<string, string>;
  };
  checkInTime?: string;
  checkOutTime?: string;
}

const ruleIcons: Record<string, any> = {
  'noSmoking': X,
  'noParties': Users,
  'noPets': Heart,
  'noUnregisteredGuests': Users,
  'quietHours': Clock,
  'checkInRestrictions': Clock,
  'checkOutRestrictions': Clock,
  'noFoodInBedrooms': Home,
  'shoesOff': Home,
  'noChildren': Users,
  'noFilming': Shield,
  'additionalGuestsFee': Users,
  'securityDeposit': Shield,
  'idVerification': Shield
};

const ruleLabels: Record<string, string> = {
  'noSmoking': 'No smoking',
  'noParties': 'No parties or events',
  'noPets': 'No pets',
  'noUnregisteredGuests': 'No unregistered guests',
  'quietHours': 'Quiet hours',
  'checkInRestrictions': 'Check-in time restrictions',
  'checkOutRestrictions': 'Check-out time restrictions',
  'noFoodInBedrooms': 'No food or drink in bedrooms',
  'shoesOff': 'Shoes off indoors',
  'noChildren': 'No children',
  'noFilming': 'No filming/photography',
  'additionalGuestsFee': 'Additional guests fee',
  'securityDeposit': 'Security deposit required',
  'idVerification': 'ID verification required'
};

import { Dog,  Camera, Car } from "lucide-react";

const additionalRulesConfig = [
  {
    id: "pets",
    icon: Dog,
    options: [
      { value: "allowed", label: "Pets allowed" },
      { value: "not_allowed", label: "No pets" },
      { value: "conditional", label: "Pets considered" }
    ]
  },
  {
    id: "checkIn",
    icon: Clock,
    options: [
      { value: "flexible", label: "Flexible check-in" },
      { value: "strict", label: "Strict check-in time" }
    ]
  },
  {
    id: "photography",
    icon: Camera,
    options: [
      { value: "allowed", label: "Photography allowed" },
      { value: "not_allowed", label: "No photography" },
      { value: "conditional", label: "Photography with permission" }
    ]
  },
  {
    id: "parking",
    icon: Car,
    options: [
      { value: "free", label: "Free parking" },
      { value: "paid", label: "Paid parking" },
      { value: "street", label: "Street parking" },
      { value: "none", label: "No parking" }
    ]
  }
];


export default function HouseRules({ 
  houseRules = { common: [], additional: {} },
  checkInTime = '15:00',
  checkOutTime = '11:00'
}: HouseRulesProps) {
  const [showAll, setShowAll] = useState(false);

  // Convert common rules and additional rules to a flat array
  // const commonRulesWithLabels = houseRules.common.map(rule => ({
  //   key: rule,
  //   label: ruleLabels[rule] || rule.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  // }));

   const commonRulesWithLabels = houseRules.common.map(rule => ({
    key: rule,
    label:
      ruleLabels[rule] ||
      rule
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, str => str.toUpperCase()),
  }));

 const additionalRulesWithLabels = Object.entries(
  houseRules.additional || {}
).map(([key, value]) => {

  // find rule config
  const ruleConfig = additionalRulesConfig.find(
    (rule) => rule.id === key
  );

  // find selected option
  const option = ruleConfig?.options.find(
    (opt) => opt.value === value
  );

  return {
    key,
    label: option?.label || value,
    icon: ruleConfig?.icon || Shield
  };
});


  const allRules = [...commonRulesWithLabels, ...additionalRulesWithLabels];
  const displayRules = showAll ? allRules : allRules.slice(0, 6);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-5 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4285f4] rounded-lg sm:rounded-xl flex items-center justify-center">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          House rules
        </h2>
      </div>

      {/* Check-in/Check-out Times */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Check-in</p>
            <p className="font-semibold text-gray-900">After {checkInTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Check-out</p>
            <p className="font-semibold text-gray-900">Before {checkOutTime}</p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {displayRules.map((rule, index) => {
          const Icon = rule.icon || ruleIcons[rule.key] || Shield;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3 h-3 text-gray-600" />
              </div>
              <p className="text-gray-700 text-sm sm:text-base">{rule.label}</p>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {allRules.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
        >
          {showAll ? 'Show less rules' : `Show ${allRules.length - 6} more rules`}
        </button>
      )}

      {/* Empty State */}
      {allRules.length === 0 && (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No specific house rules</p>
          <p className="text-sm text-gray-500 mt-1">Standard Tripme policies apply</p>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          By booking this property, you agree to these house rules and Tripme 
          <a href="#" className="text-indigo-600 hover:underline ml-1">Terms of Service</a> and 
          <a href="#" className="text-indigo-600 hover:underline ml-1">Guest Refund Policy</a>.
        </p>
      </div>
    </div>
  );
}