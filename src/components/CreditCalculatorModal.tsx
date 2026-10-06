import React, { useState } from 'react';
import { CustomerCredit } from '../types';
import { calculateCoppelCredit, formatMXN } from '../utils/creditCalculator';
import { Calculator, X, Sparkles, TrendingUp } from 'lucide-react';

interface CreditCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerCredit | null;
}

export const CreditCalculatorModal: React.FC<CreditCalculatorModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  if (!isOpen) return null;

  const [amount, setAmount] = useState<number>(10000);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const discountPercent = customer?.onTimePaymentDiscount || 0;

  const quincenaTerms = [12, 18, 24, 36, 48];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#005BAB] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFD000] flex items-center justify-center text-[#005BAB]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Calculadora de Crédito Coppel en Piso</h3>
              <p className="text-[11px] text-blue-200">Cotizador rápido para clientes en pasillo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {customer && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs text-[#004889]">
              <span>Cliente Activo: <strong>{customer.fullName}</strong></span>
              <span className="font-semibold text-emerald-800">
                Beneficio {customer.tier} (-{customer.onTimePaymentDiscount}% pronto pago)
              </span>
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Monto Total de Compra (Contado):
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">$</span>
              <input
                type="number"
                min="500"
                max="150000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-slate-900 focus:ring-2 focus:ring-[#005BAB] focus:outline-none tabular-nums"
              />
            </div>
            {/* Quick amount presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[3000, 6000, 10000, 15000, 25000, 40000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    amount === preset
                      ? 'bg-[#005BAB] text-white border-[#005BAB]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {formatMXN(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Initial payment / Enganche slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Pago Inicial / Enganche Voluntario:</span>
              <span className="text-[#005BAB] font-mono tabular-nums">{formatMXN(initialPayment)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.min(amount * 0.7, 20000)}
              step="500"
              value={initialPayment}
              onChange={(e) => setInitialPayment(Number(e.target.value))}
              className="w-full accent-[#005BAB] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$0 (Sin enganche inicial)</span>
              <span>{formatMXN(Math.min(amount * 0.7, 20000))}</span>
            </div>
          </div>

          {/* Table of Quincena Terms */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#005BAB]" />
              <span>Tabla de Abonos Quincenales Coppel</span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {quincenaTerms.map((term) => {
                const quote = calculateCoppelCredit(amount, term, initialPayment, discountPercent);
                return (
                  <div
                    key={term}
                    className="p-3 bg-white hover:bg-amber-50/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{term} quincenas</span>
                        <span className="text-[11px] text-slate-500">({term / 2} meses)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Total financiado: {formatMXN(quote.totalCreditPrice)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-[#004889] tabular-nums">
                        {formatMXN(quote.quincenalPayment)}
                      </span>
                      <span className="text-[11px] text-slate-600 block">/ quincenal</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>*Cálculos sujetos a aprobación de Crédito Coppel</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FFD000] text-[#004889] font-bold rounded-lg hover:bg-[#F2C400]"
          >
            Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};
