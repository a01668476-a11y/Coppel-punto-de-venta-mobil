import React from 'react';
import { CartItem, CustomerCredit, DeliveryType } from '../types';
import { calculateCoppelCredit, formatMXN } from '../utils/creditCalculator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Store,
  CreditCard,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customer: CustomerCredit | null;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  onStartCheckout: () => void;
  onOpenCustomerModal: () => void;
  isPinnedSidebar?: boolean; // When in landscape tablet mode
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  customer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryType,
  setDeliveryType,
  onStartCheckout,
  onOpenCustomerModal,
  isPinnedSidebar = false,
}) => {
  if (!isOpen && !isPinnedSidebar) return null;

  const totalCash = cartItems.reduce(
    (sum, item) => sum + item.product.priceCash * item.quantity,
    0
  );

  // Overall credit quote for all items combined
  const defaultCartQuincenas = cartItems.length > 0
    ? Math.max(...cartItems.map((i) => i.selectedQuincenas))
    : 24;

  const discountPercent = customer?.onTimePaymentDiscount || 0;
  const totalCreditQuote = calculateCoppelCredit(totalCash, defaultCartQuincenas, 0, discountPercent);

  // Credit limit check
  const exceedsCredit = customer
    ? totalCreditQuote.totalCreditPrice > customer.availableCredit
    : false;

  const content = (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      
      {/* Header */}
      <div className="bg-[#005BAB] text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FFD000] flex items-center justify-center text-[#004889]">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Carrito de Venta Móvil</h3>
            <span className="text-[11px] text-blue-200">
              {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'} seleccionados
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {cartItems.length > 0 && (
            <button
              onClick={onClearCart}
              title="Vaciar carrito"
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg text-xs transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {!isPinnedSidebar && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Quick Banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs">
        {customer ? (
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Cliente Asignado</span>
              <span className="font-bold text-slate-800 truncate block">{customer.fullName}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-500 block">Crédito Disponible</span>
              <span className="font-extrabold text-[#005BAB] tabular-nums">
                {formatMXN(customer.availableCredit)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700 block">Sin cliente para crédito</span>
              <span className="text-[10px] text-slate-500">¿Desea calcular en pagos quincenales?</span>
            </div>
            <button
              onClick={onOpenCustomerModal}
              className="px-2.5 py-1 text-xs font-bold text-[#004889] bg-[#FFD000] hover:bg-[#F2C400] rounded-md transition-colors"
            >
              Identificar
            </button>
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-sm text-slate-700">El carrito está vacío</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
              Escanea la etiqueta de un producto o agrégalo desde el catálogo para iniciar la venta.
            </p>
          </div>
        ) : (
          cartItems.map((item) => {
            const itemQuote = calculateCoppelCredit(item.product.priceCash, item.selectedQuincenas);
            return (
              <div
                key={item.product.id}
                className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-contain bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                        title="Eliminar artículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span>SKU: {item.product.sku}</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span className="text-slate-600 font-medium">{item.product.aisleLocation}</span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1.5">
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {formatMXN(item.product.priceCash * item.quantity)}
                      </span>
                      <span className="text-[11px] font-semibold text-[#005BAB] bg-blue-50 px-1.5 py-0.5 rounded">
                        {formatMXN(itemQuote.quincenalPayment * item.quantity)}/qna
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper & Plazo */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-bold text-slate-800 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Plazo sugerido: <strong className="text-slate-700">{item.selectedQuincenas} qnas</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fulfillment Toggle (Llevar en piso vs Entrega Domicilio) */}
      {cartItems.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200">
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Modalidad de Entrega:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setDeliveryType('tienda_inmediata')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                deliveryType === 'tienda_inmediata'
                  ? 'bg-[#005BAB] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Llevar en Tienda</span>
            </button>

            <button
              onClick={() => setDeliveryType('domicilio_gratis')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                deliveryType === 'domicilio_gratis'
                  ? 'bg-[#005BAB] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Envío Gratis</span>
            </button>
          </div>
        </div>
      )}

      {/* Totals & Coppel Credit Summary */}
      {cartItems.length > 0 && (
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          
          {/* Cash price subtotal */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Total de Contado:</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {formatMXN(totalCash)}
            </span>
          </div>

          {/* Crédito Coppel Big Abono Card */}
          <div className="bg-[#FFFBE6] border-2 border-[#FFD000] p-3 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#005BAB] uppercase tracking-wider">
                Abono Total Crédito Coppel
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                {defaultCartQuincenas} Quincenas
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-black text-[#004889] tabular-nums">
                  {formatMXN(totalCreditQuote.quincenalPayment)}
                </span>
                <span className="text-xs text-slate-600 font-medium"> / quincena</span>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <span>Total: {formatMXN(totalCreditQuote.totalCreditPrice)}</span>
              </div>
            </div>

            {totalCreditQuote.onTimeDiscountAmount > 0 && (
              <div className="text-[11px] text-emerald-800 font-semibold mt-1 pt-1 border-t border-amber-200 flex justify-between">
                <span>Ahorro por pago puntual:</span>
                <span className="tabular-nums">-{formatMXN(totalCreditQuote.onTimeDiscountAmount)}</span>
              </div>
            )}
          </div>

          {/* Credit Limit Exceeded Warning */}
          {exceedsCredit && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Línea de crédito insuficiente:</strong> El total supera el crédito disponible de {customer?.fullName}. Puede solicitar un enganche o solicitar ampliación.
              </div>
            </div>
          )}

          {/* Primary Checkout CTA */}
          <button
            onClick={onStartCheckout}
            className="w-full h-13 rounded-xl bg-[#FFD000] hover:bg-[#F2C400] text-[#004889] font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all min-h-[48px]"
          >
            <CreditCard className="w-5 h-5 text-[#004889]" />
            <span>Cobrar en Pasillo · {formatMXN(totalCash)}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transacción móvil segura cifrada Coppel Pay</span>
          </div>

        </div>
      )}

    </div>
  );

  if (isPinnedSidebar) {
    return (
      <aside className="w-80 xl:w-96 shrink-0 h-[calc(100vh-6.5rem)] sticky top-24 overflow-hidden rounded-xl border border-slate-200 shadow-sm flex flex-col">
        {content}
      </aside>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {content}
      </div>
    </div>
  );
};
