import React, { useState } from 'react';
import { AisleInventory, CustomerCredit, Product } from '../types';
import { calculateCoppelCredit, formatMXN } from '../utils/creditCalculator';
import { 
  X, 
  MapPin, 
  Check, 
  Plus, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Sliders, 
  AlertCircle, 
  Boxes, 
  ArrowDownToLine, 
  CheckCircle2 
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  customer: CustomerCredit | null;
  inventory?: AisleInventory;
  onClose: () => void;
  onAddToCart: (product: Product, quincenas?: number, initialPayment?: number) => void;
  onRequestRestock?: (productId: string) => Promise<void> | void;
  isInCart: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  customer,
  inventory,
  onClose,
  onAddToCart,
  onRequestRestock,
  isInCart,
}) => {
  if (!product) return null;

  const [selectedQuincenas, setSelectedQuincenas] = useState<number>(product.defaultQuincenas);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [restockStatus, setRestockStatus] = useState<string>('');
  const [isRestocking, setIsRestocking] = useState(false);

  const discountPercent = customer?.onTimePaymentDiscount || 0;
  const quote = calculateCoppelCredit(product.priceCash, selectedQuincenas, initialPayment, discountPercent);

  const quincenaOptions = [12, 18, 24, 36, 48];

  const aisleStock = inventory ? inventory.stockInAisle : product.stockInStore;
  const warehouseStock = inventory ? inventory.stockInWarehouse : product.stockInWarehouse;
  const cedisStock = inventory ? inventory.stockInCedis : 120;
  const isLowStock = inventory ? inventory.isLowStock : aisleStock <= 2;

  const handleAddAndClose = () => {
    onAddToCart(product, selectedQuincenas, initialPayment);
    onClose();
  };

  const handleRestockClick = async () => {
    setIsRestocking(true);
    if (onRequestRestock) {
      await onRequestRestock(product.id);
    }
    setRestockStatus(`¡Solicitud enviada a Bodega Interna! Un almacenista surtirá el ${inventory?.aisleLocation || product.aisleLocation} en breve.`);
    setIsRestocking(false);
    setTimeout(() => setRestockStatus(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#005BAB] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFD000] text-[#005BAB] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
              {product.brand}
            </span>
            <span className="text-xs text-blue-200 font-mono">SKU: {product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left: Product Image & Physical Floor Location */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-56 object-contain mix-blend-multiply"
                />
              </div>

              {/* Exact Store Location Block with Real-Time Stock API breakdown */}
              <div className={`rounded-xl p-3.5 text-xs border ${
                isLowStock 
                  ? 'bg-red-50/70 border-red-300' 
                  : 'bg-blue-50/70 border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <MapPin className={`w-4 h-4 ${isLowStock ? 'text-red-600' : 'text-[#005BAB]'}`} />
                    <span className={isLowStock ? 'text-red-900' : 'text-[#005BAB]'}>
                      Ubicación en Piso de Tienda
                    </span>
                  </div>
                  {isLowStock && (
                    <span className="text-[10px] font-extrabold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded animate-pulse">
                      ¡Pocas piezas!
                    </span>
                  )}
                </div>

                <div className="text-slate-800 font-semibold text-sm">
                  {inventory?.aisleLocation || product.aisleLocation}
                </div>
                {inventory?.shelfLevel && (
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Estante: {inventory.shelfLevel}
                  </div>
                )}

                {/* Real-time Aisle Stock Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-2.5 border-t border-slate-200/80">
                  <div className={`p-2 rounded-lg ${isLowStock ? 'bg-red-100/80 border border-red-300 text-red-900' : 'bg-white text-slate-800'}`}>
                    <span className="text-[10px] text-slate-500 block uppercase">En Pasillo</span>
                    <strong className={`text-sm tabular-nums ${isLowStock ? 'text-red-700 font-black' : 'text-emerald-700 font-bold'}`}>
                      {aisleStock} pza{aisleStock === 1 ? '' : 's'}
                    </strong>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">En Bodega</span>
                    <strong className="text-sm tabular-nums text-slate-800 font-bold">
                      {warehouseStock} pzas
                    </strong>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">En CEDIS</span>
                    <strong className="text-sm tabular-nums text-slate-800 font-bold">
                      {cedisStock} pzas
                    </strong>
                  </div>
                </div>

                {/* Restock trigger button */}
                <div className="mt-3 pt-2 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleRestockClick}
                    disabled={isRestocking}
                    className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-[#005BAB]" />
                    <span>{isRestocking ? 'Notificando a bodega...' : 'Solicitar Resurtido a Bodega Interna'}</span>
                  </button>

                  {restockStatus && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{restockStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Warranties & Free Home Delivery */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#005BAB] shrink-0" />
                  <span className="text-slate-700 font-medium">Garantía oficial Coppel {product.warrantyMonths} meses</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#005BAB] shrink-0" />
                  <span className="text-slate-700 font-medium">Envío gratis a domicilio disponible</span>
                </div>
              </div>
            </div>

            {/* Right: Pricing & Interactive Crédito Coppel Simulator */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {product.name}
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price comparison */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Precio de Contado</span>
                  <span className="text-xl font-black text-slate-900 tabular-nums">
                    {formatMXN(product.priceCash)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Ahorro pagando hoy</span>
                  <span className="text-xs font-bold text-emerald-700">
                    Sin intereses de financiamiento
                  </span>
                </div>
              </div>

              {/* Interactive Credit Term Simulator */}
              <div className="bg-[#FFFBE6] border-2 border-[#FFD000] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#005BAB]" />
                    <span className="text-xs font-black text-[#005BAB] uppercase tracking-wide">
                      Simulador de Crédito Coppel
                    </span>
                  </div>
                  {customer && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Beneficio {customer.tier}
                    </span>
                  )}
                </div>

                {/* Quincenas selector buttons */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Seleccionar plazo de quincenas:
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {quincenaOptions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setSelectedQuincenas(q)}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all min-h-[42px] ${
                          selectedQuincenas === q
                            ? 'bg-[#005BAB] text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-amber-100/60 border border-amber-200'
                        }`}
                      >
                        {q} qnas
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Down Payment Input */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>Pago Inicial / Enganche voluntario:</span>
                    <span className="text-slate-500 font-mono">{formatMXN(initialPayment)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.min(product.priceCash * 0.6, 6000)}
                    step="200"
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(Number(e.target.value))}
                    className="w-full accent-[#005BAB] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>$0 (Sin enganche)</span>
                    <span>{formatMXN(Math.min(product.priceCash * 0.6, 6000))}</span>
                  </div>
                </div>

                {/* Result Highlight */}
                <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-600 block">Pago Quincenal Estimado</span>
                    <span className="text-2xl font-black text-[#004889] tabular-nums">
                      {formatMXN(quote.quincenalPayment)}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    <span>Total a crédito: <strong className="text-slate-900">{formatMXN(quote.totalCreditPrice)}</strong></span>
                    {quote.onTimeDiscountAmount > 0 && (
                      <span className="text-emerald-700 font-semibold block text-[10px]">
                        Ahorro puntual: -{formatMXN(quote.onTimeDiscountAmount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Key Specs list */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Características Destacadas
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#005BAB]"></div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>¿El cliente tiene dudas? Usa el comparador o muestra la ubicación en piso.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl min-h-[44px]"
            >
              Cerrar
            </button>
            <button
              onClick={handleAddAndClose}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 min-h-[44px] ${
                isInCart
                  ? 'bg-[#005BAB] text-white'
                  : 'bg-[#FFD000] hover:bg-[#F2C400] text-[#004889]'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Actualizar en Carrito</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Agregar al Carrito de Venta</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
