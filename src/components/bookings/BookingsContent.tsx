"use client";
import React, { useState } from 'react';
import { Calendar, MapPin, Users, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatDate, formatPrice } from '@/shared/utils/pricingUtils';

// Mock booking data
const mockBookings = [
  {
    id: '1',
    stayTitle: 'Beachfront Villa, Goa',
    location: 'Arambol, North Goa',
    checkIn: new Date('2024-02-15'),
    checkOut: new Date('2024-02-18'),
    guests: 4,
    totalPrice: 12000,
    status: 'confirmed' as const,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    stayTitle: 'Mountain Retreat, Manali',
    location: 'Old Manali',
    checkIn: new Date('2024-03-20'),
    checkOut: new Date('2024-03-25'),
    guests: 2,
    totalPrice: 8000,
    status: 'pending' as const,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    stayTitle: 'Heritage Haveli, Udaipur',
    location: 'City Palace Area',
    checkIn: new Date('2024-01-10'),
    checkOut: new Date('2024-01-12'),
    guests: 3,
    totalPrice: 15000,
    status: 'completed' as const,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

const BookingsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-blue-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = mockBookings.filter(booking => {
    if (activeTab === 'upcoming') {
      return booking.status === 'confirmed' || booking.status === 'pending';
    } else if (activeTab === 'past') {
      return booking.status === 'completed';
    }
    return false; // No cancelled bookings in mock data
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">My Bookings</h1>
        <p className="text-gray-600">Manage your upcoming and past stays</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'cancelled'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {filteredBookings.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} bookings</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming bookings yet."
                : activeTab === 'past'
                ? "You don't have any past bookings yet."
                : "You don't have any cancelled bookings."
              }
            </p>
            <Button>
              Start Exploring
            </Button>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="md:w-48 md:h-32 flex-shrink-0">
                  <img
                    src={booking.image}
                    alt={booking.stayTitle}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {booking.stayTitle}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin size={16} className="mr-1" />
                        <span className="text-sm">{booking.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{formatDate(booking.checkOut)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        <span className="font-medium">{booking.guests}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium">{formatPrice(booking.totalPrice)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {booking.status === 'confirmed' && (
                      <Button size="sm" variant="outline">
                        Contact Host
                      </Button>
                    )}
                    {booking.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline">
                          Cancel Booking
                        </Button>
                        <Button size="sm">
                          Pay Now
                        </Button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingsContent; 