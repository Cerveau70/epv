
import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  id?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, id }) => {
  return (
    <div id={id} className="relative py-4 pr-2">
      {/* Horizontal design on md, vertical layout on mobile */}
      <div className="hidden md:flex justify-between items-start relative w-full mb-8">
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-brand-border z-0" />
        <div
          className="absolute top-5 left-8 h-0.5 bg-brand-gold transition-all duration-500 z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center flex-1 z-10 px-2 text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  isCompleted
                    ? 'bg-brand-blue-deep border-brand-blue-deep text-white shadow-premium'
                    : isActive
                    ? 'bg-brand-gold border-brand-gold text-brand-blue-deep shadow-premium scale-110'
                    : 'bg-white border-brand-border text-brand-muted hover:border-brand-blue-medium'
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : idx + 1}
              </div>
              <h4 className={`mt-3 font-sans font-semibold text-xs transition-colors duration-300 ${isActive ? 'text-brand-blue-deep' : 'text-brand-muted'}`}>
                {step.label}
              </h4>
              <p className="text-[10px] text-brand-muted mt-1 max-w-[124px] select-none mx-auto leading-normal">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Vertical view for Mobile */}
      <div className="md:hidden flex flex-col space-y-6 relative pl-4 border-l-2 border-brand-border ml-3">
        <div
          className="absolute top-0 bottom-0 left-[-2px] w-0.5 bg-brand-gold transition-all duration-500"
          style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={idx} className="flex items-start gap-4 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border-2 ${
                  isCompleted
                    ? 'bg-brand-blue-deep border-brand-blue-deep text-white ml-[-18px]'
                    : isActive
                    ? 'bg-brand-gold border-brand-gold text-brand-blue-deep shadow-premium scale-105 ml-[-18px]'
                    : 'bg-white border-brand-border text-brand-muted ml-[-18px]'
                }`}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </div>
              <div>
                <h4 className={`font-sans font-semibold text-sm ${isActive ? 'text-brand-blue-deep' : 'text-brand-muted'}`}>
                  {step.label}
                </h4>
                <p className="text-xs text-brand-muted mt-0.5 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
