"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiClient } from '@/infrastructure/api/clients/api-client';

interface Host {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
  };
  languages?: string[];
  phone?: string;
  rating?: number;
  reviewCount?: number;
  responseRate?: number;
  responseTime?: string;
  isSuperhost?: boolean;
  createdAt: string;
  listings?: any[];
}

interface HostListings {
  _id: string;
  title: string;
  images: string[];
  pricing: {
      basePrice: number,
      currency: string,
    },
  host:{
    _id: string,
    name: string,
    email: string,
    profileImage?: string,
    bio?: string,
    location?: {
      city: string,
      state: string,
    },
    languages?: string[],
    phone?: string,
    rating?: number,
    reviewCount?: number,
    responseRate?: number,
    responseTime?: string,
    isSuperhost?: boolean,
    createdAt: string,
  }
}

interface HostContextType {
  host: Host | null;
  hostListings: HostListings[];
  loading: boolean;
  error: string | null;
  fetchHost: (hostId: string) => Promise<void>;
  clearHost: () => void;
  fetchHostListings: (hostId: string) => Promise<void>;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

interface HostProviderProps {
  children: ReactNode;
}

export function HostProvider({ children }: HostProviderProps) {
  const [host, setHost] = useState<Host | null>(null);
  const [hostListings, setHostListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const fetchHost = useCallback(async (hostId: string) => {
  //   // Return early if we already have the host data
  //   if (host?._id === hostId) {
  //     return;
  //   }

  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await apiClient.getHostById(hostId);
      
  //     if (response.success && response.data) {
  //       // Fetch host's listings as well
  //       const listingsResponse = await apiClient.getHostListings(hostId);
        
  //       const hostData = {
  //         ...response.data,
  //         listings: listingsResponse.success ? listingsResponse.data.listings || [] : []
  //       };
        
  //       setHost(hostData);
  //       setLoading(false);
  //     } else {
  //       setError('Host not found');
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     setError('Failed to load host profile');
  //     setLoading(false);
  //   }
  // }, [host?._id]);


  const fetchHost = useCallback(async (hostId: string) => {
  // Return early if we already have the host data
  if (host?._id === hostId) {
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await apiClient.getHostById(hostId);
      
    if (response.success && response.data) {
      // Only use the host data from getHostById, don't fetch listings separately
      const hostData = {
        ...response.data,
        listings: [] // Empty listings for now
      };

      console.log("hostData",hostData); 
      
      setHost(hostData);
      setLoading(false);
    } else {
      setError('Host not found');
      setLoading(false);
    }
  } catch (error) {
    setError('Failed to load host profile');
    setLoading(false);
  }
}, [host?._id]);

  const fetchHostListings = useCallback(async (hostId: string) => {
    console.log("fetchHostListings called",hostId);  
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getHostListing(hostId);
      console.log("hostListings",response);   
      if (response.success && response.data) {
        console.log("hostListings",response.data);  
        setHostListings(response.data);
        setLoading(false);
      } else {
        setError('Host not found');
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to load host profile');
      setLoading(false);
    }
  }, [host?._id]); 

  const clearHost = useCallback(() => {
    setHost(null);
    setError(null);
    setLoading(false);
  }, [host?._id]);

  const value: HostContextType = {
    host,
    hostListings,
    loading,
    error,
    fetchHost,
    clearHost,
    fetchHostListings
  };



  return (
    <HostContext.Provider value={value}>
      {children}
    </HostContext.Provider>
  );
}

export function useHostContext() {
  const context = useContext(HostContext);
  if (context === undefined) {
    throw new Error('useHostContext must be used within a HostProvider');
  }
  return context;
}

// Export alias for backward compatibility with existing imports
export const useHostStore = useHostContext;