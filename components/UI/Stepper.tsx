import { Fragment } from "react";

type StepperProps = {
  steps: number;
  currentStep: number;
  className?: string;
};

export default function Stepper({ steps, currentStep, className = "" }: StepperProps) {
  const stepsFromNumber = Array.from({ length: steps });

  return (
    <div className={`flex flex-row items-start ${className}`}>
      {stepsFromNumber.map((_, index) => {
        const formattedIndex = index + 1;
        const isCompleted = formattedIndex < currentStep;
        const isActive = formattedIndex === currentStep;
        const circleBase = isCompleted ? "bg-sky-600 text-white" : isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600";
        const lineBase = isCompleted ? "bg-sky-600" : "bg-gray-200";

        return (
          <Fragment key={index}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${circleBase}`}>
              {isCompleted ? (
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 8.5L6.5 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                formattedIndex
              )}
            </div>

            {index < steps - 1 && (
              <div className="flex-1 items-center flex h-10 mx-4">
                <span className={`h-0.5 w-full ${lineBase}`} />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
