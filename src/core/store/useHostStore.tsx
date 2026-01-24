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

interface HostContextType {
  host: Host | null;
  loading: boolean;
  error: string | null;
  fetchHost: (hostId: string) => Promise<void>;
  clearHost: () => void;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

interface HostProviderProps {
  children: ReactNode;
}

export function HostProvider({ children }: HostProviderProps) {
  const [host, setHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Fetch host's listings as well
        const listingsResponse = await apiClient.getHostListings(hostId);
        
        const hostData = {
          ...response.data,
          listings: listingsResponse.success ? listingsResponse.data.listings || [] : []
        };
        
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

  const clearHost = useCallback(() => {
    setHost(null);
    setError(null);
    setLoading(false);
  }, []);

  const value: HostContextType = {
    host,
    loading,
    error,
    fetchHost,
    clearHost,
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