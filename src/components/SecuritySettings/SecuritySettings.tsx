import React, { useState } from 'react';
import { Save, Shield } from 'lucide-react';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import { Select } from '../common/Select/Select';

interface SecuritySettings {
  sessionTimeout: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  twoFactorAuth: boolean;
}

export const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorAuth: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save security settings logic here
      console.log('Security settings saved:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to save security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Session Management */}
      <div className="bg-white shadow-sm border rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Session Management</h3>
        </div>
        <div className="space-y-4">
          <Select
            label="Session Timeout (minutes)"
            options={[
              { value: 15, label: '15 minutes' },
              { value: 30, label: '30 minutes' },
              { value: 60, label: '1 hour' },
              { value: 120, label: '2 hours' },
              { value: 480, label: '8 hours' },
            ]}
            value={settings.sessionTimeout}
            onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-white shadow-sm border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
        <div className="space-y-4">
          <Input
            label="Minimum Password Length"
            type="number"
            min="6"
            max="50"
            value={settings.passwordMinLength.toString()}
            onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
          />
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.requireSpecialChars}
                onChange={(e) => updateSetting('requireSpecialChars', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-900">
                Require special characters (!@#$%^&*)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.requireNumbers}
                onChange={(e) => updateSetting('requireNumbers', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-900">
                Require numbers (0-9)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Login Security */}
      <div className="bg-white shadow-sm border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Login Security</h3>
        <div className="space-y-4">
          <Input
            label="Maximum Login Attempts"
            type="number"
            min="3"
            max="10"
            value={settings.maxLoginAttempts.toString()}
            onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
          />
          <Input
            label="Account Lockout Duration (minutes)"
            type="number"
            min="5"
            max="60"
            value={settings.lockoutDuration.toString()}
            onChange={(e) => updateSetting('lockoutDuration', parseInt(e.target.value))}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-900">
              Enable Two-Factor Authentication (2FA)
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={loading}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Security Settings
        </Button>
      </div>
    </div>
  );
};