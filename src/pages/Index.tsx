
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Settings, AlertTriangle, Eye, Gauge } from 'lucide-react';
import FacialTracker from '../components/FacialTracker';
import Dashboard from '../components/Dashboard';
import SettingsPanel from '../components/SettingsPanel';
import AlertSystem from '../components/AlertSystem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface AlertSettings {
  drowsinessThreshold: number;
  distractionThreshold: number;
  voiceAlertsEnabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
}

export interface AlertData {
  type: 'drowsiness' | 'distraction' | 'normal';
  severity: number;
  timestamp: number;
  eyeAspectRatio: number;
  headPose: { yaw: number; pitch: number; roll: number };
}

const Index = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [alertData, setAlertData] = useState<AlertData>({
    type: 'normal',
    severity: 0,
    timestamp: Date.now(),
    eyeAspectRatio: 0.3,
    headPose: { yaw: 0, pitch: 0, roll: 0 }
  });
  
  const [settings, setSettings] = useState<AlertSettings>({
    drowsinessThreshold: 0.25,
    distractionThreshold: 30,
    voiceAlertsEnabled: true,
    sensitivity: 'medium'
  });

  const [sessionStats, setSessionStats] = useState({
    sessionDuration: 0,
    drowsinessEvents: 0,
    distractionEvents: 0,
    lastAlert: null as string | null
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setSessionStats(prev => ({
          ...prev,
          sessionDuration: prev.sessionDuration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const handleStartTracking = () => {
    setIsTracking(true);
    setSessionStats({
      sessionDuration: 0,
      drowsinessEvents: 0,
      distractionEvents: 0,
      lastAlert: null
    });
  };

  const handleStopTracking = () => {
    setIsTracking(false);
  };

  const handleAlertUpdate = (newAlertData: AlertData) => {
    setAlertData(newAlertData);
    
    // Update session stats
    if (newAlertData.type === 'drowsiness' && alertData.type !== 'drowsiness') {
      setSessionStats(prev => ({
        ...prev,
        drowsinessEvents: prev.drowsinessEvents + 1,
        lastAlert: 'Drowsiness detected'
      }));
    } else if (newAlertData.type === 'distraction' && alertData.type !== 'distraction') {
      setSessionStats(prev => ({
        ...prev,
        distractionEvents: prev.distractionEvents + 1,
        lastAlert: 'Driver distraction detected'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Co-Pilot</h1>
                <p className="text-blue-300 text-sm">Driver Alertness Monitor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              {!isTracking ? (
                <Button
                  onClick={handleStartTracking}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Monitoring
                </Button>
              ) : (
                <Button
                  onClick={handleStopTracking}
                  variant="destructive"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  Stop Monitoring
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Camera View */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-blue-400" />
                    Camera Feed
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    <span className="text-sm text-gray-300">
                      {isTracking ? 'Monitoring Active' : 'Monitoring Inactive'}
                    </span>
                  </div>
                </div>
                
                <FacialTracker
                  isActive={isTracking}
                  settings={settings}
                  onAlertUpdate={handleAlertUpdate}
                />
              </div>
            </Card>
            
            {/* Alert Status */}
            <Card className="mt-4 bg-black/40 border-blue-500/30 backdrop-blur-sm">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                  Alert Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Driver State</div>
                    <div className={`text-lg font-semibold ${
                      alertData.type === 'normal' ? 'text-green-400' :
                      alertData.type === 'drowsiness' ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {alertData.type === 'normal' ? 'Alert' :
                       alertData.type === 'drowsiness' ? 'Drowsy' : 'Distracted'}
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Alert Level</div>
                    <div className="text-lg font-semibold text-white">
                      {Math.round(alertData.severity * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Dashboard */}
            <Dashboard
              alertData={alertData}
              sessionStats={sessionStats}
              isTracking={isTracking}
            />
            
            {/* Settings Panel */}
            {showSettings && (
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                onClose={() => setShowSettings(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Alert System */}
      <AlertSystem
        alertData={alertData}
        settings={settings}
        isActive={isTracking}
      />
    </div>
  );
};

export default Index;
