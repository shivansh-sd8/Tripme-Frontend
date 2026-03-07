"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/core/store/auth-context';
import { apiClient } from '@/lib/api';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  CreditCard,
  Users,
  Home,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Download,
  Upload,
  Key,
  Server,
  Network,
  HardDrive
} from 'lucide-react';

interface SystemSettings {
  platform: {
    name: string;
    description: string;
    maintenance: boolean;
    registration: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    require2FA: boolean;
    ipWhitelist: string[];
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    adminAlerts: boolean;
  };
  payments: {
    currency: string;
    commission: number;
    platformFeeRate: number;
    platformFeePercentage: number;
    gstRate: number;
    gstPercentage: number;
    processingFeeRate: number;
    processingFeePercentage: number;
    processingFeeFixed: number;
    autoPayout: boolean;
    minPayout: number;
  };
  limits: {
    maxPropertiesPerHost: number;
    maxBookingsPerUser: number;
    maxImagesPerProperty: number;
    maxFileSize: number;
  };
}

export default function AdminSettings() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    platform: {
      name: '',
      description: '',
      maintenance: false,
      registration: true
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      require2FA: false,
      ipWhitelist: []
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      adminAlerts: true
    },
    payments: {
      currency: 'INR',
      commission: 15,
      platformFeeRate: 0.10, // decimal form
      platformFeePercentage: 10,
      gstRate: 0.18,
      gstPercentage: 18,
      processingFeeRate: 0.029,
      processingFeePercentage: 2.9,
      processingFeeFixed: 30,
      autoPayout: false,
      minPayout: 1000
    },
    limits: {
      maxPropertiesPerHost: 10,
      maxBookingsPerUser: 50,
      maxImagesPerProperty: 20,
      maxFileSize: 5
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch general settings
      const settingsResponse = await apiClient.get('/admin/settings');
      if (settingsResponse.success) {
        setSettings(prev => ({
          ...prev,
          ...settingsResponse.data,
          // Ensure platform object exists
          platform: {
            name: '',
            description: '',
            maintenance: false,
            registration: true,
            ...prev.platform,
            ...settingsResponse.data.platform
          }
        }));
      }
      
      // Fetch current platform/fee rates
      try {
        const feeResponse = await apiClient.get('/admin/pricing/platform-fee');
        if (feeResponse.success) {
          const data = feeResponse.data;
          setSettings(prev => ({
            ...prev,
            payments: {
              ...prev.payments,
              platformFeeRate: data.platformFeeRate,
              platformFeePercentage: Number(data.platformFeeRate * 100),
              gstRate: data.gstRate ?? prev.payments.gstRate,
              gstPercentage: Number((data.gstRate ?? prev.payments.gstRate) * 100),
              processingFeeRate: data.processingFeeRate ?? prev.payments.processingFeeRate,
              processingFeePercentage: Number((data.processingFeeRate ?? prev.payments.processingFeeRate) * 100),
              processingFeeFixed: data.processingFeeFixed ?? prev.payments.processingFeeFixed
            }
          }));
        }
      } catch (feeError) {
        console.warn('Could not fetch platform fee rate:', feeError);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/admin/settings', settings);
      if (response.success) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePlatformFeeRate = async (newRate: number, changeReason: string) => {
    try {
      setSaving(true);
      const response = await apiClient.put('/admin/pricing/platform-fee', {
        platformFeeRate: newRate / 100, // percentage -> decimal
        gstRate: settings.payments.gstPercentage / 100,
        processingFeeRate: settings.payments.processingFeePercentage / 100,
        processingFeeFixed: settings.payments.processingFeeFixed,
        changeReason: changeReason || 'Platform fee configuration updated via admin panel'
      });
      
      if (response.success) {
        // Update local state
        setSettings(prev => ({
          ...prev,
          payments: {
            ...prev.payments,
            platformFeeRate: response.data.newConfig?.platformFeeRate ?? newRate / 100,
            platformFeePercentage: Number(response.data.newConfig?.platformFeePercentage ?? newRate.toFixed(1)),
            gstRate: response.data.newConfig?.gstRate ?? (settings.payments.gstPercentage / 100),
            gstPercentage: Number(response.data.newConfig?.gstPercentage ?? settings.payments.gstPercentage),
            processingFeeRate: response.data.newConfig?.processingFeeRate ?? (settings.payments.processingFeePercentage / 100),
            processingFeePercentage: Number(response.data.newConfig?.processingFeePercentage ?? settings.payments.processingFeePercentage),
            processingFeeFixed: response.data.newConfig?.processingFeeFixed ?? settings.payments.processingFeeFixed
          }
        }));
        console.log('Platform fee rate updated successfully');
        return true;
      }
    } catch (error) {
      console.error('Error updating platform fee rate:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };
  const [activeTab, setActiveTab] = useState('platform');

  const handleReset = () => {
    // Reset to default settings
    fetchSettings();
  };

  const tabs = [
    { id: 'platform', name: 'Platform', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'limits', name: 'Limits', icon: Users },
    { id: 'system', name: 'System', icon: Server }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure platform settings, security, and system parameters
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2  border-b-2 font-small text-xs flex items-center ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Platform Settings */}
        {activeTab === 'platform' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <Input
                    value={settings.platform?.name || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, name: e.target.value }
                    })}
                    placeholder="TripMe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Description
                  </label>
                  <Input
                    value={settings.platform?.description || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, description: e.target.value }
                    })}
                    placeholder="Platform description"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      platform: { ...settings.platform, maintenance: !settings.platform?.maintenance }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.platform?.maintenance ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.platform?.maintenance ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">User Registration</h4>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      platform: { ...settings.platform, registration: !settings.platform?.registration }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.platform?.registration ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.platform?.registration ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="72"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                    min="3"
                    max="10"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      security: { ...settings.security, require2FA: !settings.security.require2FA }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security.require2FA ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security.require2FA ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Send email notifications to users</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: !settings.notifications.email }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.email ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Send SMS notifications to users</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, sms: !settings.notifications.sms }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.sms ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Send push notifications to users</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, push: !settings.notifications.push }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.push ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Admin Alerts</h4>
                  <p className="text-sm text-gray-500">Send alerts to admin for important events</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, adminAlerts: !settings.notifications.adminAlerts }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.adminAlerts ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.adminAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Settings */}
        {activeTab === 'payments' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Configuration</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.payments.currency}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, currency: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.payments.commission}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, commission: parseFloat(e.target.value) }
                    })}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>
              </div>
              
              {/* Platform / Tax / Processing Fees */}
              <div className="border-t pt-6 space-y-4">
                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Platform & Fee Management
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Platform Fee (%)</p>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.payments.platformFeePercentage}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || '0');
                        setSettings(prev => ({
                          ...prev,
                          payments: {
                            ...prev.payments,
                            platformFeePercentage: val,
                            platformFeeRate: val / 100
                          }
                        }));
                      }}
                    />
                    <p className="text-xs text-blue-700 mt-1">TripMe service fee applied to booking subtotal.</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">GST (%)</p>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.payments.gstPercentage}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || '0');
                        setSettings(prev => ({
                          ...prev,
                          payments: {
                            ...prev.payments,
                            gstPercentage: val,
                            gstRate: val / 100
                          }
                        }));
                      }}
                    />
                    <p className="text-xs text-blue-700 mt-1">Applied on subtotal (including security deposit).</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Processing Fee (%)</p>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={settings.payments.processingFeePercentage}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || '0');
                        setSettings(prev => ({
                          ...prev,
                          payments: {
                            ...prev.payments,
                            processingFeePercentage: val,
                            processingFeeRate: val / 100
                          }
                        }));
                      }}
                    />
                    <p className="text-xs text-blue-700 mt-1">Percent applied on subtotal for payment processing.</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Processing Fee (₹ fixed)</p>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={settings.payments.processingFeeFixed}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || '0');
                        setSettings(prev => ({
                          ...prev,
                          payments: {
                            ...prev.payments,
                            processingFeeFixed: val
                          }
                        }));
                      }}
                    />
                    <p className="text-xs text-blue-700 mt-1">Flat fee added per booking.</p>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    onClick={() => updatePlatformFeeRate(settings.payments.platformFeePercentage, '')}
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Save Fee Settings
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  These fees apply to all new bookings immediately after saving.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Payout Amount
                  </label>
                  <Input
                    type="number"
                    value={settings.payments.minPayout}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, minPayout: parseInt(e.target.value) }
                    })}
                    min="100"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Auto Payout</h4>
                    <p className="text-sm text-gray-500">Automatically process payouts when threshold is met</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      payments: { ...settings.payments, autoPayout: !settings.payments.autoPayout }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.payments.autoPayout ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.payments.autoPayout ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Limits Settings */}
        {activeTab === 'limits' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Limits</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Properties per Host
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxPropertiesPerHost}
                    onChange={(e) => setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxPropertiesPerHost: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Bookings per User
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxBookingsPerUser}
                    onChange={(e) => setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxBookingsPerUser: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Images per Property
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxImagesPerProperty}
                    onChange={(e) => setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxImagesPerProperty: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxFileSize}
                    onChange={(e) => setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxFileSize: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Database Status</h4>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Connected</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Server Status</h4>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Running</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export System Logs
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
} 
