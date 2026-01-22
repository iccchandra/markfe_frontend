// src/components/FilterPanel.tsx

import React from 'react';
import { X } from 'lucide-react';

interface FilterPanelProps {
  selectedStage: string;
  onStageChange: (stage: string) => void;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedStage,
  onStageChange,
  onClose,
}) => {
  const stages = ['BL', 'RL', 'RC', 'COMPLETED'];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Stage
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStageChange('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStage === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Stages
              </button>
              {stages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => onStageChange(stage)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStage === stage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};