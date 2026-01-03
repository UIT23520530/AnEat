"use client";

import { Check } from "lucide-react";

interface CheckoutProgressProps {
  currentStep: 1 | 2 | 3;
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    { number: 1, label: "Thông tin đơn hàng" },
    { number: 2, label: "Thanh toán" },
    { number: 3, label: "Hoàn tất" },
  ];

  return (
    <div className="bg-white border-b shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step.number < currentStep
                      ? "bg-green-500 text-white"
                      : step.number === currentStep
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.number < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <p
                  className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${
                    step.number === currentStep
                      ? "text-orange-500"
                      : step.number < currentStep
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 transition-all ${
                    step.number < currentStep
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
