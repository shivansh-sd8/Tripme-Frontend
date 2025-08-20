"use client";
import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft, MapPin, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  const router = useRouter();

  const quickActions = [
    {
      icon: <Home className="w-6 h-6" />,
      title: "Go Home",
      description: "Return to the main page",
      action: () => router.push('/'),
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Search Stays",
      description: "Find amazing accommodations",
      action: () => router.push('/search'),
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Explore Destinations",
      description: "Discover new places",
      action: () => router.push('/search'),
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Become a Host",
      description: "Share your space with travelers",
      action: () => router.push('/become-host'),
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-gray-200 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The page you&apos;re looking for seems to have wandered off on its own adventure. 
            Don&apos;t worry, we&apos;ve got plenty of amazing places for you to explore instead!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => router.back()}
            className="flex items-center px-8 py-4 bg-gray-800 text-white hover:bg-gray-900 transition-all duration-200 rounded-xl shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-200 rounded-xl shadow-lg shadow-purple-500/25"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you believe this is an error or need assistance, our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/support')}
              className="px-6 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors rounded-lg"
            >
              Contact Support
            </Button>
            <Button
              onClick={() => router.push('/help')}
              className="px-6 py-2 bg-green-100 text-green-700 hover:bg-green-200 transition-colors rounded-lg"
            >
              Help Center
            </Button>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 Fun fact: The 404 error was first introduced in 1990 by Tim Berners-Lee at CERN
          </p>
        </div>
      </div>
    </div>
  );
}

