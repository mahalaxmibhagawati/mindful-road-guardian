
import React, { useRef, useEffect, useState } from 'react';
import { AlertData, AlertSettings } from '../pages/Index';
import { Card } from '@/components/ui/card';
import { Eye, AlertTriangle } from 'lucide-react';

interface FacialTrackerProps {
  isActive: boolean;
  settings: AlertSettings;
  onAlertUpdate: (alertData: AlertData) => void;
}

const FacialTracker: React.FC<FacialTrackerProps> = ({
  isActive,
  settings,
  onAlertUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);

  // Mock facial detection - in a real implementation, this would use ML models
  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simulate facial analysis (replace with actual ML model)
    const mockAnalysis = simulateFacialAnalysis();
    
    // Draw face detection overlay
    drawFaceOverlay(ctx, mockAnalysis);
    
    // Update alert data
    onAlertUpdate(mockAnalysis);
    setFaceDetected(mockAnalysis.eyeAspectRatio > 0.1);
  };

  const simulateFacialAnalysis = (): AlertData => {
    // Simulate realistic variations in eye aspect ratio and head pose
    const baseEAR = 0.3;
    const earVariation = Math.sin(Date.now() / 3000) * 0.05;
    const eyeAspectRatio = baseEAR + earVariation + (Math.random() - 0.5) * 0.02;
    
    // Simulate head pose
    const headPose = {
      yaw: (Math.random() - 0.5) * 20,
      pitch: (Math.random() - 0.5) * 15,
      roll: (Math.random() - 0.5) * 10
    };

    // Determine alert type and severity
    let type: 'drowsiness' | 'distraction' | 'normal' = 'normal';
    let severity = 0;

    // Check for drowsiness (low eye aspect ratio)
    if (eyeAspectRatio < settings.drowsinessThreshold) {
      type = 'drowsiness';
      severity = (settings.drowsinessThreshold - eyeAspectRatio) / settings.drowsinessThreshold;
    }
    
    // Check for distraction (head turned away)
    const headTurnAngle = Math.abs(headPose.yaw);
    if (headTurnAngle > settings.distractionThreshold) {
      type = 'distraction';
      severity = (headTurnAngle - settings.distractionThreshold) / 30;
    }

    // Apply sensitivity multiplier
    const sensitivityMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.3
    }[settings.sensitivity];

    severity = Math.min(severity * sensitivityMultiplier, 1);

    return {
      type,
      severity,
      timestamp: Date.now(),
      eyeAspectRatio,
      headPose
    };
  };

  const drawFaceOverlay = (ctx: CanvasRenderingContext2D, analysis: AlertData) => {
    const { width, height } = ctx.canvas;
    
    // Draw face bounding box (simulated)
    const faceX = width * 0.3;
    const faceY = height * 0.2;
    const faceWidth = width * 0.4;
    const faceHeight = height * 0.5;

    // Set stroke color based on alert type
    const strokeColor = analysis.type === 'normal' ? '#22c55e' :
                       analysis.type === 'drowsiness' ? '#ef4444' :
                       '#f59e0b';

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(faceX, faceY, faceWidth, faceHeight);

    // Draw eye markers
    const leftEyeX = faceX + faceWidth * 0.25;
    const rightEyeX = faceX + faceWidth * 0.75;
    const eyeY = faceY + faceHeight * 0.3;
    const eyeSize = 8;

    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize, 0, 2 * Math.PI);
    ctx.arc(rightEyeX, eyeY, eyeSize, 0, 2 * Math.PI);
    ctx.fill();

    // Draw alert indicator
    if (analysis.type !== 'normal') {
      ctx.fillStyle = strokeColor;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      const alertText = analysis.type === 'drowsiness' ? 'DROWSY' : 'DISTRACTED';
      ctx.fillText(alertText, width / 2, height - 30);
    }

    // Draw metrics
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`EAR: ${analysis.eyeAspectRatio.toFixed(3)}`, 10, height - 60);
    ctx.fillText(`Head: ${analysis.headPose.yaw.toFixed(1)}°`, 10, height - 40);
    ctx.fillText(`Alert: ${(analysis.severity * 100).toFixed(0)}%`, 10, height - 20);
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setFaceDetected(false);
  };

  useEffect(() => {
    let animationFrame: number;

    if (isActive) {
      startCamera();
      
      const processFrame = () => {
        analyzeFrame();
        animationFrame = requestAnimationFrame(processFrame);
      };
      
      // Start processing once video is loaded
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          processFrame();
        };
      }
    } else {
      stopCamera();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      stopCamera();
    };
  }, [isActive, settings]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white">Initializing camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white mb-2">Camera Error</p>
            <p className="text-gray-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          width={640}
          height={480}
        />

        {/* Status indicators */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
            {faceDetected ? 'Face Detected' : 'No Face'}
          </span>
        </div>

        {/* Night mode indicator */}
        <div className="absolute top-4 right-4">
          <div className="bg-black/50 text-white text-sm px-2 py-1 rounded flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            Night Vision
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacialTracker;
