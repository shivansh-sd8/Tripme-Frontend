// import HostProfileCard from "./HostProfileCard";
// import HostReviews from "./HostReviews";

// export default function HostDesktopLayout() {
//   return (
//     <div className="max-w-6xl mx-auto px-8 py-12">
//       <div className="grid grid-cols-[380px_1fr] gap-12">
//         <HostProfileCard />
//         <HostReviews />
//       </div>
//     </div>
//   );
// }

import HostProfileCard from "./HostProfileCard";
import HostReviews from "./HostReviews";

export default function HostDesktopLayout({ host }: { host: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full page host profile content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <HostProfileCard host={host} />
        <HostReviews hostId={host._id} />
      </div>
    </div>
  );
}