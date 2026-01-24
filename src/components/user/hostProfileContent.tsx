"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useHostContext } from "@/core/store/useHostStore";
import { ShieldCheck, Star, MapPin, Globe, Phone, Mail, Calendar, Home, Users } from "lucide-react";
import ImageGallery from "@/components/rooms/gallery/ImageGallery";
// import HostReviews from "@/components/rooms/host-section/HostReviews";

interface Props {
  hostId: string;
}

export default function HostProfileContent({ hostId }: Props) {
  const { host, loading, error, fetchHost } = useHostContext();
  const router = useRouter();

  useEffect(() => {
    fetchHost(hostId);
  }, [hostId, fetchHost]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading host profile...</p>
        </div>
      </div>
    );
  }

  if (error || !host) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Host not found'}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                {host.profileImage ? (
                  <img 
                    src={host.profileImage} 
                    alt={host.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Users className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Host Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{host.name}</h1>
                {host.isSuperhost && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Superhost
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{host.rating || 4.5}</span>
                  <span>· {host.reviewCount || 0} reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Host since {new Date(host.createdAt).getFullYear()}</span>
                </div>
              </div>

              {host.bio && (
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {host.bio}
                </p>
              )}

              {/* Host Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {host.responseRate && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{host.responseRate}%</p>
                    <p className="text-sm text-gray-600">Response rate</p>
                  </div>
                )}
                {host.responseTime && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{host.responseTime}</p>
                    <p className="text-sm text-gray-600">Response time</p>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{host.listings?.length || 0}</p>
                  <p className="text-sm text-gray-600">Properties</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                {host.location?.city && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{host.location.city}, {host.location.state}</span>
                  </div>
                )}
                {host.languages && host.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>Speaks {host.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Host Listings */}
      {host.listings && host.listings.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold mb-6">{host.name}'s Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {host.listings.map((listing) => (
              <div 
                key={listing._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/rooms/${listing._id}`)}
              >
                <div className="aspect-video bg-gray-200">
                  {listing.images?.[0] && (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{listing.location?.city}</p>
                  <p className="font-semibold">
                    ${listing.price?.base || 0} <span className="font-normal text-gray-600">/night</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {/* <div className="max-w-6xl mx-auto px-6 py-8">
        <HostReviews hostId={host._id} />
      </div> */}
    </div>
  );
}