'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { adminApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Settings, Server, RefreshCw, Play, Pause, Activity } from 'lucide-react';

export default function SettingsPage() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getStatus();
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualFetch = async () => {
    try {
      await adminApi.triggerFetch();
      // Refresh status after fetch
      await fetchSystemStatus();
    } catch (error) {
      console.error('Error triggering manual fetch:', error);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Layout onRefresh={fetchSystemStatus} isLoading={isLoading}>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Settings className="w-8 h-8 text-gray-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          </div>
          <p className="text-gray-600">
            Monitor system status and manage data fetching operations
          </p>
        </motion.div>

        {systemStatus && (
          <>
            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <Server className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Environment</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {systemStatus.environment}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-4">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatUptime(systemStatus.uptime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-4">
                    <RefreshCw className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Requests</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {systemStatus.youtubeApiRequests}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Scheduled Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Scheduled Jobs</h2>
              
              <div className="space-y-4">
                {Object.entries(systemStatus.scheduledJobs).map(([jobName, jobStatus]: [string, any]) => (
                  <div key={jobName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 ${
                        jobStatus.running ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {jobStatus.running ? (
                          <Play className="w-5 h-5 text-green-600" />
                        ) : (
                          <Pause className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {jobName.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {jobStatus.running ? 'Running' : 'Stopped'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      jobStatus.running 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {jobStatus.running ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Manual Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Manual Actions</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Trigger Data Fetch</h3>
                    <p className="text-sm text-gray-500">
                      Manually fetch the latest trending videos from YouTube
                    </p>
                  </div>
                  <button
                    onClick={triggerManualFetch}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch Now
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">System Information</h3>
                    <p className="text-sm text-gray-500">
                      View detailed system logs and performance metrics
                    </p>
                  </div>
                  <button
                    disabled
                    className="flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Coming Soon
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </Layout>
  );
}