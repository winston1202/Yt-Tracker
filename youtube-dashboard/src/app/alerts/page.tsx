'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { alertsApi } from '@/lib/api';
import { AlertSettings } from '@/types';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Settings, TestTube, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';

export default function AlertsPage() {
  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<{ [key: string]: 'idle' | 'testing' | 'success' | 'error' }>({});

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await alertsApi.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          outlierThreshold: 10,
          discordWebhook: { enabled: false, url: '' },
          emailAlerts: { enabled: false, email: '', frequency: '12hours' },
          categories: [],
          minViews: 1000
        };
        setSettings(defaultSettings as any);
      }
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      // Set default settings on error
      const defaultSettings = {
        outlierThreshold: 10,
        discordWebhook: { enabled: false, url: '' },
        emailAlerts: { enabled: false, email: '', frequency: '12hours' },
        categories: [],
        minViews: 1000
      };
      setSettings(defaultSettings as any);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (updates: Partial<AlertSettings>) => {
    try {
      setIsSaving(true);
      const response = await alertsApi.updateSettings(updates);
      setSettings(response.data);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testAlert = async (type: 'discord' | 'email') => {
    try {
      setTestStatus(prev => ({ ...prev, [type]: 'testing' }));
      await alertsApi.testAlert(type);
      setTestStatus(prev => ({ ...prev, [type]: 'success' }));
      setTimeout(() => {
        setTestStatus(prev => ({ ...prev, [type]: 'idle' }));
      }, 3000);
    } catch (error) {
      console.error(`Error testing ${type} alert:`, error);
      setTestStatus(prev => ({ ...prev, [type]: 'error' }));
      setTimeout(() => {
        setTestStatus(prev => ({ ...prev, [type]: 'idle' }));
      }, 3000);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <Layout onRefresh={fetchSettings} isLoading={isLoading}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onRefresh={fetchSettings} isLoading={isLoading}>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Bell className="w-8 h-8 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Viral Alert Settings</h1>
          </div>
          <p className="text-gray-600">
            Configure notifications for viral videos and trending content
          </p>
        </motion.div>

        {settings && (
          <>
            {/* General Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
            >
              <div className="flex items-center mb-6">
                <Settings className="w-6 h-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outlier Threshold
                  </label>
                  <select
                    value={settings.outlierThreshold}
                    onChange={(e) => saveSettings({ outlierThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={5}>5x (More alerts)</option>
                    <option value={10}>10x (Balanced)</option>
                    <option value={25}>25x (Fewer alerts)</option>
                    <option value={50}>50x (Only extreme viral)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Videos performing {settings.outlierThreshold}x above channel average will trigger alerts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Views
                  </label>
                  <input
                    type="number"
                    value={settings.minViews}
                    onChange={(e) => saveSettings({ minViews: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Only alert for videos with at least this many views
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Discord Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MessageSquare className="w-6 h-6 text-indigo-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Discord Alerts</h2>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => testAlert('discord')}
                    disabled={!settings.discordWebhook.enabled || testStatus.discord === 'testing'}
                    className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testStatus.discord === 'testing' ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-indigo-600 border-t-transparent rounded-full" />
                        Testing...
                      </>
                    ) : testStatus.discord === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Success!
                      </>
                    ) : testStatus.discord === 'error' ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                        Failed
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Alert
                      </>
                    )}
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.discordWebhook.enabled}
                      onChange={(e) => saveSettings({
                        discordWebhook: { ...settings.discordWebhook, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discord Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.discordWebhook.url}
                  onChange={(e) => saveSettings({
                    discordWebhook: { ...settings.discordWebhook, url: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Get your webhook URL from Discord Server Settings → Integrations → Webhooks
                </p>
              </div>
            </motion.div>

            {/* Email Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Email Alerts</h2>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => testAlert('email')}
                    disabled={!settings.emailAlerts.enabled || testStatus.email === 'testing'}
                    className="flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testStatus.email === 'testing' ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-green-600 border-t-transparent rounded-full" />
                        Testing...
                      </>
                    ) : testStatus.email === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Success!
                      </>
                    ) : testStatus.email === 'error' ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                        Failed
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Alert
                      </>
                    )}
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailAlerts.enabled}
                      onChange={(e) => saveSettings({
                        emailAlerts: { ...settings.emailAlerts, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.emailAlerts.email}
                    onChange={(e) => saveSettings({
                      emailAlerts: { ...settings.emailAlerts, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={settings.emailAlerts.frequency}
                    onChange={(e) => saveSettings({
                      emailAlerts: { ...settings.emailAlerts, frequency: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="6hours">Every 6 hours</option>
                    <option value="12hours">Every 12 hours</option>
                    <option value="daily">Daily digest</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Save Status */}
            {isSaving && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg"
              >
                Saving settings...
              </motion.div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}