
import React from 'react';
import { AlertSettings } from '../pages/Index';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Settings, Volume2, Eye, AlertTriangle } from 'lucide-react';

interface SettingsPanelProps {
  settings: AlertSettings;
  onSettingsChange: (settings: AlertSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const updateSettings = (key: keyof AlertSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-400" />
            Settings
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Drowsiness Threshold */}
          <div>
            <Label className="text-white flex items-center mb-3">
              <Eye className="w-4 h-4 mr-2 text-blue-400" />
              Drowsiness Threshold
            </Label>
            <div className="space-y-2">
              <Slider
                value={[settings.drowsinessThreshold]}
                onValueChange={([value]) => updateSettings('drowsinessThreshold', value)}
                min={0.15}
                max={0.35}
                step={0.01}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Sensitive (0.15)</span>
                <span className="text-white">{settings.drowsinessThreshold.toFixed(2)}</span>
                <span>Relaxed (0.35)</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Lower values trigger alerts sooner when eyes close
            </p>
          </div>

          {/* Distraction Threshold */}
          <div>
            <Label className="text-white flex items-center mb-3">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
              Distraction Threshold
            </Label>
            <div className="space-y-2">
              <Slider
                value={[settings.distractionThreshold]}
                onValueChange={([value]) => updateSettings('distractionThreshold', value)}
                min={15}
                max={45}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Sensitive (15°)</span>
                <span className="text-white">{settings.distractionThreshold}°</span>
                <span>Relaxed (45°)</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Angle at which head turning triggers distraction alert
            </p>
          </div>

          {/* Sensitivity Level */}
          <div>
            <Label className="text-white mb-3 block">Overall Sensitivity</Label>
            <Select
              value={settings.sensitivity}
              onValueChange={(value: 'low' | 'medium' | 'high') => 
                updateSettings('sensitivity', value)
              }
            >
              <SelectTrigger className="bg-black/20 border-blue-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="low">Low - Fewer alerts</SelectItem>
                <SelectItem value="medium">Medium - Balanced</SelectItem>
                <SelectItem value="high">High - More alerts</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 mt-1">
              Adjusts overall sensitivity of all detection systems
            </p>
          </div>

          {/* Voice Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white flex items-center">
                <Volume2 className="w-4 h-4 mr-2 text-green-400" />
                Voice Alerts
              </Label>
              <p className="text-xs text-gray-400 mt-1">
                Enable spoken warnings for alerts
              </p>
            </div>
            <Switch
              checked={settings.voiceAlertsEnabled}
              onCheckedChange={(checked) => updateSettings('voiceAlertsEnabled', checked)}
            />
          </div>

          {/* Quick Presets */}
          <div>
            <Label className="text-white mb-3 block">Quick Presets</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSettingsChange({
                  drowsinessThreshold: 0.2,
                  distractionThreshold: 20,
                  voiceAlertsEnabled: true,
                  sensitivity: 'high'
                })}
                className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 text-left justify-start"
              >
                🚗 City Driving - High Alert
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSettingsChange({
                  drowsinessThreshold: 0.25,
                  distractionThreshold: 30,
                  voiceAlertsEnabled: true,
                  sensitivity: 'medium'
                })}
                className="border-green-500/50 text-green-300 hover:bg-green-500/10 text-left justify-start"
              >
                🛣️ Highway - Balanced
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSettingsChange({
                  drowsinessThreshold: 0.3,
                  distractionThreshold: 40,
                  voiceAlertsEnabled: true,
                  sensitivity: 'low'
                })}
                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 text-left justify-start"
              >
                🌙 Night Driving - Relaxed
              </Button>
            </div>
          </div>

          {/* Reset to Defaults */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSettingsChange({
              drowsinessThreshold: 0.25,
              distractionThreshold: 30,
              voiceAlertsEnabled: true,
              sensitivity: 'medium'
            })}
            className="w-full border-gray-500/50 text-gray-300 hover:bg-gray-500/10"
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SettingsPanel;
