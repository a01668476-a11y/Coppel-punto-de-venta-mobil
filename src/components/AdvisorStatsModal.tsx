import React from 'react';
import { SaleOrder } from '../types';
import { formatMXN } from '../utils/creditCalculator';
import { BarChart3, X, TrendingUp, Award, DollarSign, Receipt, Printer } from 'lucide-react';

interface AdvisorStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders: SaleOrder[];
  onSelectOrderForReceipt: (order: SaleOrder) => void;
}

export const AdvisorStatsModal: React.FC<AdvisorStatsModalProps> = ({
  isOpen,
  onClose,
  recentOrders,
  onSelectOrderForReceipt,
}) => {
  if (!isOpen) return null;

  const totalSalesToday = recentOrders.reduce((sum, ord) => sum + ord.totalCash, 24990);
  const dailyGoal = 35000;
  const progressPercent = Math.min(100, Math.round((totalSalesToday / dailyGoal) * 100));
  const estimatedCommission = Math.round(totalSalesToday * 0.03); // 3% comisión promedio asesor Coppel

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#005BAB] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFD000] flex items-center justify-center text-[#005BAB]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Rendimiento en Piso · Carlos Mendoza</h3>
              <p className="text-[11px] text-blue-200">Sucursal #104 Culiacán Centro · Turno Vespertino</p>
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
          
          {/* Daily Goal & Progress */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Meta de Venta Diaria en Piso</span>
              </span>
              <span className="font-black text-[#005BAB] text-sm tabular-nums">
                {progressPercent}% Alcanzado
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#005BAB] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-slate-600 pt-1">
              <span>Venta Real: <strong className="text-slate-900 font-mono">{formatMXN(totalSalesToday)}</strong></span>
              <span>Meta: <strong className="text-slate-900 font-mono">{formatMXN(dailyGoal)}</strong></span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 bg-[#FFFBE6] border border-[#FFD000] rounded-xl">
              <span className="text-[11px] text-slate-600 font-medium block">Comisión Estimada Turno</span>
              <span className="text-xl font-black text-[#004889] tabular-nums mt-0.5 block">
                {formatMXN(estimatedCommission)}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">Tasa 3.0% piso de venta</span>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[11px] text-slate-600 font-medium block">Ventas Registradas Hoy</span>
              <span className="text-xl font-black text-[#005BAB] tabular-nums mt-0.5 block">
                {recentOrders.length + 3} tickets
              </span>
              <span className="text-[10px] text-[#005BAB] font-semibold">Terminal TAB-08</span>
            </div>
          </div>

          {/* Recent floor sales list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>Últimas Ventas Emitidas en Tableta</span>
            </h4>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {recentOrders.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">
                  Completa tu primera venta de la sesión para verla listada aquí.
                </div>
              ) : (
                recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onSelectOrderForReceipt(ord);
                      onClose();
                    }}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#005BAB] group-hover:underline">
                          {ord.folio}
                        </span>
                        <span className="text-[11px] text-slate-400">· {ord.timestamp}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        {ord.customer ? ord.customer.fullName : 'Público General'}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 tabular-nums block">
                        {formatMXN(ord.totalCash)}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                        <Printer className="w-3 h-3 text-slate-400" />
                        <span>Ver comprobante</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
