import React from 'react';
import { CustomerCredit } from '../types';
import { formatMXN } from '../utils/creditCalculator';
import { User, Fingerprint, Award, CreditCard, ChevronRight, UserPlus, X } from 'lucide-react';

interface CustomerHeaderBarProps {
  currentCustomer: CustomerCredit | null;
  onOpenCustomerModal: () => void;
  onClearCustomer: () => void;
  onOpenBiometricModal: () => void;
}

export const CustomerHeaderBar: React.FC<CustomerHeaderBarProps> = ({
  currentCustomer,
  onOpenCustomerModal,
  onClearCustomer,
  onOpenBiometricModal,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {currentCustomer ? (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Customer Avatar & Tier */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#005BAB] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {currentCustomer.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 leading-tight">
                    {currentCustomer.fullName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Award className="w-3 h-3 text-amber-600" />
                    {currentCustomer.tier}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Cliente Coppel: <strong className="font-mono text-slate-700">{currentCustomer.clientNumber}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>{currentCustomer.phone}</span>
                </div>
              </div>
            </div>

            {/* Credit Metrics Strip */}
            <div className="flex items-center gap-4 bg-[#FFFBE6] border border-[#FFD000]/60 px-3.5 py-1.5 rounded-lg text-xs">
              <div>
                <span className="text-[11px] text-slate-600 block">Crédito Disponible</span>
                <span className="font-extrabold text-sm text-[#005BAB] tabular-nums">
                  {formatMXN(currentCustomer.availableCredit)}
                </span>
              </div>
              <div className="h-6 w-px bg-amber-200"></div>
              <div>
                <span className="text-[11px] text-slate-600 block">Límite Total</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  {formatMXN(currentCustomer.creditLimit)}
                </span>
              </div>
              <div className="h-6 w-px bg-amber-200"></div>
              <div>
                <span className="text-[11px] text-emerald-700 font-semibold block">Pronto Pago</span>
                <span className="font-bold text-emerald-800 tabular-nums">
                  -{currentCustomer.onTimePaymentDiscount}%
                </span>
              </div>
            </div>

            {/* Actions for active customer */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={onOpenCustomerModal}
                className="px-3 py-1.5 text-xs font-semibold text-[#005BAB] hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1 min-h-[38px]"
              >
                <span>Cambiar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearCustomer}
                title="Quitar cliente y cobrar de contado"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Sin cliente identificado (Venta de Contado)
                </span>
                <span className="text-[11px] text-slate-500">
                  Identifica al cliente para consultar su Crédito Coppel y pagos quincenales
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenBiometricModal}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#005BAB] bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors min-h-[42px]"
              >
                <Fingerprint className="w-4 h-4 text-[#005BAB]" />
                <span className="hidden sm:inline">Lector de Huella</span>
              </button>

              <button
                onClick={onOpenCustomerModal}
                className="px-4 py-2 text-xs font-bold text-[#004889] bg-[#FFD000] hover:bg-[#F2C400] rounded-lg flex items-center gap-1.5 transition-all shadow-xs min-h-[42px]"
              >
                <CreditCard className="w-4 h-4 text-[#004889]" />
                <span>Identificar Cliente Coppel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
