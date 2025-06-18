import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels = []
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = stepNumber === totalSteps;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`step-indicator ${
                    isActive ? 'active' : isCompleted ? 'completed' : 'inactive'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                {stepLabels[index] && (
                  <span className="text-xs text-white/70 mt-2 text-center max-w-16 leading-tight">
                    {stepLabels[index]}
                  </span>
                )}
              </div>
              {!isLast && (
                <div
                  className={`progress-line ${
                    isCompleted ? 'completed' : isActive ? 'active' : ''
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};