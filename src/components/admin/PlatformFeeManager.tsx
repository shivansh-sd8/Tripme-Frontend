'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  History, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface PlatformFeeData {
  platformFeeRate: number;
  platformFeePercentage: string;
  lastUpdated: string;
}

interface PlatformFeeHistory {
  id: string;
  platformFeeRate: number;
  platformFeePercentage: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  changeReason: string;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  version: number;
}

export default function PlatformFeeManager() {
  const [currentFee, setCurrentFee] = useState<PlatformFeeData | null>(null);
  const [history, setHistory] = useState<PlatformFeeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [newRate, setNewRate] = useState<string>('');
  const [changeReason, setChangeReason] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  // Fetch current platform fee rate
  const fetchCurrentFee = async () => {
    try {
      const response = await fetch('/api/admin/pricing/platform-fee', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch platform fee rate');
      }
      
      const data = await response.json();
      setCurrentFee(data.data);
      setNewRate(data.data.platformFeePercentage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch platform fee rate');
    }
  };

  // Fetch platform fee history
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/admin/pricing/platform-fee/history?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch platform fee history');
      }
      
      const data = await response.json();
      setHistory(data.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  // Update platform fee rate
  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const rateValue = parseFloat(newRate);
      
      if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
        throw new Error('Platform fee rate must be between 0 and 100');
      }

      const response = await fetch('/api/admin/pricing/platform-fee', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          platformFeeRate: rateValue / 100, // Convert percentage to decimal
          changeReason: changeReason.trim() || 'Platform fee rate updated via admin panel'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update platform fee rate');
      }

      const data = await response.json();
      setSuccess(`Platform fee rate updated from ${data.data.previousPercentage}% to ${data.data.newPercentage}%`);
      
      // Refresh data
      await fetchCurrentFee();
      await fetchHistory();
      
      // Reset form
      setChangeReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update platform fee rate');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCurrentFee(), fetchHistory()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading platform fee settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Fee Management</h2>
          <p className="text-gray-600">Manage platform fee rates across the entire system</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Settings className="h-4 w-4 mr-1" />
          Admin Only
        </Badge>
      </div>

      {/* Current Rate Display */}
      {currentFee && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Current Platform Fee Rate</h3>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {currentFee.platformFeePercentage}%
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Last updated: {new Date(currentFee.lastUpdated).toLocaleString()}
          </p>
        </Card>
      )}

      {/* Update Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Update Platform Fee Rate</h3>
        
        <form onSubmit={handleUpdateFee} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newRate">New Platform Fee Rate (%)</Label>
              <Input
                id="newRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="e.g., 15.0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a value between 0 and 100 (e.g., 15 for 15%)
              </p>
            </div>
            
            <div>
              <Label htmlFor="changeReason">Change Reason (Optional)</Label>
              <Textarea
                id="changeReason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="e.g., Reduced for holiday promotion"
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              type="submit" 
              disabled={saving || !newRate}
              className="flex items-center"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Updating...' : 'Update Platform Fee'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center"
            >
              <History className="h-4 w-4 mr-2" />
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </form>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* History */}
      {showHistory && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Platform Fee History
          </h3>
          
          {history.length === 0 ? (
            <p className="text-gray-500">No history available</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant={item.isActive ? "default" : "secondary"}>
                      {item.platformFeePercentage}%
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {item.changeReason || 'No reason provided'}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {item.createdBy} • {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Version {item.version}
                    </p>
                    {item.effectiveTo && (
                      <p className="text-xs text-gray-400">
                        Ended: {new Date(item.effectiveTo).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
