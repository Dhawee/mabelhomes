"use client";

import { useState } from "react";

interface MortgageCalculatorProps {
  price: number;
}

export default function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(18);
  const [loanTerm, setLoanTerm] = useState(20);

  const principal = price * (1 - downPayment / 100);
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  const monthlyPayment =
    monthlyRate === 0
      ? principal / numPayments
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - principal;

  return (
    <div className="luxury-card p-6 md:p-8">
      <h3 className="font-heading text-2xl text-navy dark:text-white mb-6">
        Mortgage Calculator
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-sm text-navy/60 dark:text-white/60 mb-2 block">
            Property Price: ₦{price.toLocaleString()}
          </label>
        </div>

        <div>
          <label className="text-sm text-navy/60 dark:text-white/60 mb-2 block">
            Down Payment: {downPayment}%
          </label>
          <input
            type="range"
            min={10}
            max={50}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <p className="text-xs text-navy/40 dark:text-white/40 mt-1">
            ₦{(price * (downPayment / 100)).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="text-sm text-navy/60 dark:text-white/60 mb-2 block">
            Interest Rate: {interestRate}%
          </label>
          <input
            type="range"
            min={10}
            max={30}
            step={0.5}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-gold"
          />
        </div>

        <div>
          <label className="text-sm text-navy/60 dark:text-white/60 mb-2 block">
            Loan Term: {loanTerm} years
          </label>
          <input
            type="range"
            min={5}
            max={30}
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full accent-gold"
          />
        </div>

        <div className="border-t border-gray-100 dark:border-white/10 pt-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-navy/60 dark:text-white/60">Monthly Payment</span>
            <span className="font-heading text-xl text-gold">
              ₦{Math.round(monthlyPayment).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-navy/60 dark:text-white/60">Total Interest</span>
            <span className="text-sm text-navy dark:text-white">
              ₦{Math.round(totalInterest).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-navy/60 dark:text-white/60">Total Payment</span>
            <span className="text-sm text-navy dark:text-white">
              ₦{Math.round(totalPayment).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
