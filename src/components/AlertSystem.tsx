
import React, { useEffect, useRef, useState } from 'react';
import { AlertData, AlertSettings } from '../pages/Index';
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';

interface AlertSystemProps {
  alertData: AlertData;
  settings: AlertSettings;
  isActive: boolean;
}

const AlertSystem: React.FC<AlertSystemProps> = ({
  alertData,
  settings,
  isActive
}) => {
  const [lastAlertTime, setLastAlertTime] = useState(0);
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Alert messages
  const alertMessages = {
    drowsiness: [
      "Please take a break, you appear drowsy",
      "Driver fatigue detected, consider resting",
      "Your eyes are closing frequently, please pull over safely",
      "Take a coffee break, staying alert is important"
    ],
    distraction: [
      "Please keep your eyes on the road",
      "Driver distraction detected, focus ahead",
      "Look forward, stay focused on driving",
      "Keep your attention on the road"
    ]
  };

  const speakAlert = (message: string) => {
    if (!settings.voiceAlertsEnabled) return;
    
    // Cancel any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    synthRef.current = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Configure voice settings for clarity in noisy environments
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    
    // Try to use a clear, professional voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Microsoft') || voice.name.includes('Google')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    if (!isActive) {
      setCurrentAlert(null);
      return;
    }

    const now = Date.now();
    const timeSinceLastAlert = now - lastAlertTime;
    const alertCooldown = 5000; // 5 seconds between alerts

    // Only trigger alerts if severity is significant and enough time has passed
    if (alertData.severity > 0.5 && timeSinceLastAlert > alertCooldown) {
      if (alertData.type === 'drowsiness' || alertData.type === 'distraction') {
        const messages = alertMessages[alertData.type];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        setCurrentAlert(randomMessage);
        speakAlert(randomMessage);
        setLastAlertTime(now);

        // Clear visual alert after 3 seconds
        setTimeout(() => {
          setCurrentAlert(null);
        }, 3000);
      }
    }
  }, [alertData, settings, isActive, lastAlertTime]);

  // Visual alert overlay
  if (!currentAlert || !isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Alert overlay */}
      <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
      
      {/* Alert message */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <div className={`
          bg-gradient-to-r p-6 rounded-lg shadow-2xl border-2 text-white text-center max-w-md
          ${alertData.type === 'drowsiness' 
            ? 'from-red-600 to-red-700 border-red-500' 
            : 'from-amber-600 to-amber-700 border-amber-500'
          }
          animate-scale-in
        `}>
          <div className="flex items-center justify-center mb-3">
            <AlertTriangle className="w-8 h-8 mr-3" />
            <h3 className="text-xl font-bold">
              {alertData.type === 'drowsiness' ? 'DROWSINESS ALERT' : 'DISTRACTION ALERT'}
            </h3>
          </div>
          
          <p className="text-lg mb-4">{currentAlert}</p>
          
          <div className="flex items-center justify-center text-sm opacity-75">
            {settings.voiceAlertsEnabled ? (
              <>
                <Volume2 className="w-4 h-4 mr-1" />
                Voice alert active
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 mr-1" />
                Voice alerts disabled
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertSystem;
