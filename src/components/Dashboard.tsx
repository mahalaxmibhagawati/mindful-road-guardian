
import React from 'react';
import { AlertData } from '../pages/Index';
import { Card } from '@/components/ui/card';
import { Gauge, Clock, AlertTriangle, Eye, TrendingUp } from 'lucide-react';

interface DashboardProps {
  alertData: AlertData;
  sessionStats: {
    sessionDuration: number;
    drowsinessEvents: number;
    distractionEvents: number;
    lastAlert: string | null;
  };
  isTracking: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  alertData,
  sessionStats,
  isTracking
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getAlertLevelColor = (severity: number) => {
    if (severity < 0.3) return 'text-green-400';
    if (severity < 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAlertLevelBg = (severity: number) => {
    if (severity < 0.3) return 'bg-green-500/20';
    if (severity < 0.6) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="space-y-4">
      {/* Alert Level Gauge */}
      <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-blue-400" />
            Alert Level
          </h3>
          
          <div className="relative">
            <div className="w-32 h-32 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-700"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${alertData.severity * 283} 283`}
                  className={getAlertLevelColor(alertData.severity)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getAlertLevelColor(alertData.severity)}`}>
                    {Math.round(alertData.severity * 100)}
                  </div>
                  <div className="text-xs text-gray-400">%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`mt-4 p-2 rounded-lg ${getAlertLevelBg(alertData.severity)}`}>
            <div className="text-center">
              <div className={`font-semibold ${getAlertLevelColor(alertData.severity)}`}>
                {alertData.type === 'normal' ? 'ALERT' :
                 alertData.type === 'drowsiness' ? 'DROWSY' : 'DISTRACTED'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Session Statistics */}
      <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Session Stats
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-300">
                <Clock className="w-4 h-4 mr-2" />
                Duration
              </div>
              <div className="text-white font-semibold">
                {formatDuration(sessionStats.sessionDuration)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-300">
                <Eye className="w-4 h-4 mr-2" />
                Drowsiness Events
              </div>
              <div className="text-red-400 font-semibold">
                {sessionStats.drowsinessEvents}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-300">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Distraction Events
              </div>
              <div className="text-yellow-400 font-semibold">
                {sessionStats.distractionEvents}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Live Metrics */}
      <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Live Metrics</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Eye Aspect Ratio</span>
                <span className="text-white">{alertData.eyeAspectRatio.toFixed(3)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(alertData.eyeAspectRatio * 200, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Head Yaw</span>
                <span className="text-white">{alertData.headPose.yaw.toFixed(1)}°</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(Math.abs(alertData.headPose.yaw) * 2, 100)}%`,
                    backgroundColor: Math.abs(alertData.headPose.yaw) > 30 ? '#f59e0b' : '#06b6d4'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Last Alert */}
      {sessionStats.lastAlert && (
        <Card className="bg-amber-500/20 border-amber-500/50 backdrop-blur-sm">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-amber-200 mb-2 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Last Alert
            </h3>
            <p className="text-amber-100">{sessionStats.lastAlert}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
