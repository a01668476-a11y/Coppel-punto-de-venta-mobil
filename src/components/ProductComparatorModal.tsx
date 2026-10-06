import React from 'react';
import { Product } from '../types';
import { calculateCoppelCredit, formatMXN } from '../utils/creditCalculator';
import { X, Columns, Plus, Check, MapPin } from 'lucide-react';

interface ProductComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductComparatorModal: React.FC<ProductComparatorModalProps> = ({
  isOpen,
  onClose,
  comparedProducts,
  onRemoveProduct,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#005BAB] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns className="w-5 h-5 text-[#FFD000]" />
            <div>
              <h3 className="font-bold text-sm">Comparador de Artículos en Piso</h3>
              <p className="text-[11px] text-blue-200">Asesoría cara a cara con el cliente en pasillo</p>
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
        <div className="p-6 overflow-y-auto flex-1">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Columns className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No has seleccionado artículos para comparar</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Toca el ícono de comparar en las tarjetas de cualquier producto del catálogo para compararlos lado a lado.
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${comparedProducts.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
              {comparedProducts.map((prod) => {
                const quote = calculateCoppelCredit(prod.priceCash, prod.defaultQuincenas);
                return (
                  <div
                    key={prod.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-white bg-[#005BAB] px-2 py-0.5 rounded uppercase">
                          {prod.brand}
                        </span>
                        <button
                          onClick={() => onRemoveProduct(prod.id)}
                          className="text-xs text-slate-400 hover:text-red-500 p-1"
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="h-40 bg-white rounded-lg p-2 flex items-center justify-center border border-slate-100 mb-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="max-h-full object-contain"
                        />
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                        {prod.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        SKU: {prod.sku}
                      </span>

                      {/* Location & Stock */}
                      <div className="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#005BAB]" />
                          <span>{prod.aisleLocation}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Existencia: <strong className="text-emerald-700">{prod.stockInStore} en piso</strong> · {prod.stockInWarehouse} en bodega
                        </div>
                      </div>

                      {/* Prices */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Precio Contado:</span>
                          <span className="font-bold text-slate-900 tabular-nums">
                            {formatMXN(prod.priceCash)}
                          </span>
                        </div>

                        <div className="bg-[#FFFBE6] p-2 rounded-lg border border-[#FFD000] flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-bold text-[#005BAB] block">Crédito Coppel</span>
                            <span className="text-sm font-black text-[#004889] tabular-nums">
                              {formatMXN(quote.quincenalPayment)}
                            </span>
                            <span className="text-[10px] text-slate-600"> / quincenal</span>
                          </div>
                          <span className="text-[10px] text-slate-600">
                            a {prod.defaultQuincenas} qnas
                          </span>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                          Especificaciones:
                        </span>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {prod.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#005BAB] font-bold">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => onAddToCart(prod)}
                      className="w-full py-2.5 bg-[#FFD000] hover:bg-[#F2C400] text-[#004889] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Elegir este artículo para el Carrito</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            Cerrar Comparador
          </button>
        </div>

      </div>
    </div>
  );
};
