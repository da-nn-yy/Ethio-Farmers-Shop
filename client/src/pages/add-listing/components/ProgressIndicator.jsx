import React from 'react';

const ProgressIndicator = ({ currentStep, totalSteps, currentLanguage }) => {
  const steps = [
    {
      number: 1,
      title: currentLanguage === 'en' ? 'Product Details' : 'የምርት ዝርዝሮች',
      titleAm: 'የምርት ዝርዝሮች'
    },
    {
      number: 2,
      title: currentLanguage === 'en' ? 'Pricing & Quantity' : 'ዋጋ እና ብዛት',
      titleAm: 'ዋጋ እና ብዛት'
    },
    {
      number: 3,
      title: currentLanguage === 'en' ? 'Images' : 'ምስሎች',
      titleAm: 'ምስሎች'
    },
    {
      number: 4,
      title: currentLanguage === 'en' ? 'Location' : 'አካባቢ',
      titleAm: 'አካባቢ'
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.number <= currentStep
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className={`text-sm font-medium ${
                  step.number <= currentStep ? 'text-primary' : 'text-gray-500'
                }`}>
                  {currentLanguage === 'en' ? step.title : step.titleAm}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-4 ${
                  step.number < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
