"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient } from '@/infrastructure/api/clients/api-client';

export interface EditContextType {
  propertyId: string;
  propertyData: any;
  isEditMode: boolean;
  loading: boolean;
  error: string | null;
  updatePropertyData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export function EditProvider({ 
  children, 
  propertyId 
}: { 
  children: ReactNode; 
  propertyId: string; 
}) {
  const [propertyData, setPropertyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode] = useState(true);

  // Load existing property data
  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getListing(propertyId);
        
        if (response.success) {
          setPropertyData(response.data);
        } else {
          setError(response.message || 'Failed to load property');
        }
      } catch (err) {
        setError('Error loading property');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      loadPropertyData();
    }
  }, [propertyId]);

  const updatePropertyData = (newData: any) => {
    setPropertyData(prev => ({ ...prev, ...newData }));
  };

  const value: EditContextType = {
    propertyId,
    propertyData,
    isEditMode,
    loading,
    error,
    updatePropertyData,
    setLoading,
    setError,
  };

  return (
    <EditContext.Provider value={value}>
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const context = useContext(EditContext);
  if (context === undefined) {
    throw new Error('useEdit must be used within an EditProvider');
  }
  return context;
}