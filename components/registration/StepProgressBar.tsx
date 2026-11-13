import React from 'react';

interface Step {
  num: number;
  label: string;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function StepProgressBar({
  steps,
  currentStep,
  className = '',
}: StepProgressBarProps) {
  return (
    <div className={`grid grid-cols-3 gap-2 sm:gap-4 mb-10 ${className}`}>
      {steps.map((s) => {
        const isPassed = currentStep > s.num;
        const isCurrent = currentStep === s.num;

        return (
          <div
            key={s.num}
            className={`p-3 text-center border font-mono text-xs transition-colors clip-tactical ${
              isCurrent
                ? 'bg-olive/20 border-olive text-sand font-bold shadow-[0_2px_10px_rgba(24,30,24,0.6)]'
                : isPassed
                ? 'bg-surface/60 border-gunmetal text-sand'
                : 'bg-card/40 border-gunmetal text-mutedKhaki/60'
            }`}
          >
            <div className="text-[10px] opacity-70">STEP 0{s.num}</div>
            <div className="font-display font-bold uppercase tracking-wider text-xs sm:text-sm truncate">
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

