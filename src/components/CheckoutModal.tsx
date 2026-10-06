import React, { useState, useRef, useEffect } from 'react';
import { CartItem, CustomerCredit, DeliveryType, PaymentMethod, SaleOrder } from '../types';
import { calculateCoppelCredit, formatMXN, playBeepSound } from '../utils/creditCalculator';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  Banknote, 
  PenTool, 
  Eraser, 
  Truck, 
  Store, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customer: CustomerCredit | null;
  deliveryType: DeliveryType;
  onCompleteSale: (order: SaleOrder) => void;
  onOpenCustomerModal: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  customer,
  deliveryType,
  onCompleteSale,
  onOpenCustomerModal,
}) => {
  if (!isOpen) return null;

  const totalCash = cartItems.reduce(
    (sum, item) => sum + item.product.priceCash * item.quantity,
    0
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    customer ? 'credito_coppel' : 'tarjeta_terminal'
  );
  const [selectedQuincenas, setSelectedQuincenas] = useState<number>(24);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardTerminalStep, setCardTerminalStep] = useState<
    'idle' | 'waiting_card' | 'processing' | 'approved'
  >('idle');

  // Customer signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const discountPercent = customer?.onTimePaymentDiscount || 0;
  const creditQuote = calculateCoppelCredit(totalCash, selectedQuincenas, 0, discountPercent);

  // Initialize canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#005BAB';
  }, [paymentMethod]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSimulateCardPayment = () => {
    setCardTerminalStep('waiting_card');
    setTimeout(() => {
      setCardTerminalStep('processing');
      setTimeout(() => {
        setCardTerminalStep('approved');
        playBeepSound();
      }, 1200);
    }, 1200);
  };

  const handleFinalizeSale = () => {
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const signatureUrl = canvas ? canvas.toDataURL() : undefined;

    setTimeout(() => {
      setIsProcessing(false);
      playBeepSound();

      const newOrder: SaleOrder = {
        id: `ord-${Date.now()}`,
        folio: `COP-TI104-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        customer,
        items: [...cartItems],
        subtotalCash: totalCash,
        totalCash,
        totalCredit: creditQuote.totalCreditPrice,
        selectedPaymentMethod: paymentMethod,
        selectedQuincenas,
        quincenalPayment: creditQuote.quincenalPayment,
        deliveryType,
        advisorName: 'Carlos Mendoza',
        advisorStoreNumber: '104 Culiacán Centro',
        signatureDataUrl: signatureUrl,
        authorizationCode: `AUTH-CP-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      onCompleteSale(newOrder);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#005BAB] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD000] flex items-center justify-center text-[#005BAB] font-black">
              ✓
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Procesar Venta en Pasillo</h2>
              <p className="text-xs text-blue-200">Terminal Móvil Coppel · Asesor Carlos Mendoza</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Order Snapshot */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Artículos a cobrar:</span>
              <strong className="text-slate-900 text-sm">{cartItems.length} artículos</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Modalidad:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                {deliveryType === 'tienda_inmediata' ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-[#005BAB]" />
                    <span>Llevar en Tienda</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Envío a Domicilio Gratis</span>
                  </>
                )}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Total de Contado:</span>
              <strong className="text-slate-900 text-sm font-mono tabular-nums">{formatMXN(totalCash)}</strong>
            </div>

            {paymentMethod === 'credito_coppel' && (
              <div className="bg-[#FFFBE6] border border-[#FFD000] px-3 py-1 rounded-lg">
                <span className="text-[10px] text-[#005BAB] font-bold block uppercase">Abono Coppel</span>
                <strong className="text-[#004889] text-sm tabular-nums">
                  {formatMXN(creditQuote.quincenalPayment)}/qna
                </strong>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Seleccionar Forma de Pago:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              <button
                type="button"
                onClick={() => setPaymentMethod('credito_coppel')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[76px] ${
                  paymentMethod === 'credito_coppel'
                    ? 'border-[#005BAB] bg-blue-50/70 shadow-xs ring-2 ring-[#005BAB]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <CreditCard className="w-4 h-4 text-[#005BAB]" />
                  <span className="text-[10px] font-bold text-[#005BAB] bg-[#FFD000] px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Crédito Coppel</span>
                  <span className="text-[10px] text-slate-500">Pagos quincenales</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tarjeta_terminal')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[76px] ${
                  paymentMethod === 'tarjeta_terminal'
                    ? 'border-[#005BAB] bg-blue-50/70 shadow-xs ring-2 ring-[#005BAB]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Tarjeta Bancaria</span>
                  <span className="text-[10px] text-slate-500">Pinpad inalámbrico</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo_caja')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[76px] ${
                  paymentMethod === 'efectivo_caja'
                    ? 'border-[#005BAB] bg-blue-50/70 shadow-xs ring-2 ring-[#005BAB]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Ficha Caja Rápida</span>
                  <span className="text-[10px] text-slate-500">QR para pagar efectivo</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('coppel_pay')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[76px] ${
                  paymentMethod === 'coppel_pay'
                    ? 'border-[#005BAB] bg-blue-50/70 shadow-xs ring-2 ring-[#005BAB]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Coppel Pay</span>
                  <span className="text-[10px] text-slate-500">Escanear desde App</span>
                </div>
              </button>

            </div>
          </div>

          {/* Conditional Flow based on Selected Payment Method */}

          {/* 1. CRÉDITO COPPEL */}
          {paymentMethod === 'credito_coppel' && (
            <div className="space-y-4 animate-in fade-in">
              {!customer ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-amber-900 block">Se requiere identificar al cliente</strong>
                    <span className="text-[11px] text-amber-800">
                      Para autorizar la venta a Crédito Coppel necesitas vincular el número de cliente o huella.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenCustomerModal}
                    className="px-4 py-2 bg-[#005BAB] text-white rounded-lg text-xs font-bold"
                  >
                    Identificar Cliente
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quincenas choice */}
                  <div className="bg-[#FFFBE6] border border-[#FFD000] p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#005BAB]">
                        Plazo Quincenal Autorizado para {customer.fullName}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Línea disp: {formatMXN(customer.availableCredit)}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[12, 18, 24, 36].map((q) => {
                        const qQuote = calculateCoppelCredit(totalCash, q, 0, discountPercent);
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setSelectedQuincenas(q)}
                            className={`p-2 rounded-lg text-center transition-all ${
                              selectedQuincenas === q
                                ? 'bg-[#005BAB] text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-amber-100/60 border border-amber-200'
                            }`}
                          >
                            <span className="text-xs font-bold block">{q} quincenas</span>
                            <span className="text-[11px] font-semibold tabular-nums block mt-0.5">
                              {formatMXN(qQuote.quincenalPayment)}/qna
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                      <span>Primer pago quincenal: <strong>15 de Octubre 2026</strong></span>
                      <span>Total financiado: <strong>{formatMXN(creditQuote.totalCreditPrice)}</strong></span>
                    </div>
                  </div>

                  {/* Customer Digital Signature on Tablet */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-[#005BAB]" />
                        <span>Firma Digital del Cliente en Tableta:</span>
                      </label>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Eraser className="w-3 h-3" />
                        <span>Limpiar firma</span>
                      </button>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-28 touch-none cursor-crosshair bg-transparent"
                      />
                      {!hasSignature && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                          Pide al cliente que firme aquí con su dedo o lápiz óptico
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Acepto los términos del pagaré y financiamiento Crédito Coppel S.A. de C.V.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. TARJETA EN TERMINAL MÓVIL */}
          {paymentMethod === 'tarjeta_terminal' && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-center animate-in fade-in">
              <div className="max-w-xs mx-auto space-y-2">
                <CreditCard className="w-10 h-10 text-[#005BAB] mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Terminal Pinpad Móvil Bluetooth</h4>
                <p className="text-xs text-slate-500">
                  Monto a cobrar: <strong className="text-slate-900 font-mono text-sm">{formatMXN(totalCash)}</strong>
                </p>
              </div>

              {cardTerminalStep === 'idle' && (
                <button
                  type="button"
                  onClick={handleSimulateCardPayment}
                  className="px-5 py-2.5 bg-[#005BAB] text-white rounded-xl text-xs font-bold hover:bg-[#004889] transition-colors"
                >
                  Activar Terminal Inalámbrica Pinpad
                </button>
              )}

              {cardTerminalStep === 'waiting_card' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#005BAB] font-semibold animate-pulse">
                  Acerca o inserta la tarjeta bancaria (Chip / Contactless NFC / Apple Pay)...
                </div>
              )}

              {cardTerminalStep === 'processing' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Procesando con banco emisor y validando PIN...</span>
                </div>
              )}

              {cardTerminalStep === 'approved' && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transacción Bancaria Aprobada #TRX-948102</span>
                </div>
              )}
            </div>
          )}

          {/* 3. FICHA CAJA RÁPIDA / EFECTIVO */}
          {paymentMethod === 'efectivo_caja' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-900">Cobro de Efectivo sin Filas</h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Al confirmar, se reservará el inventario en piso y se imprimirá una <strong>Ficha de Turno Preferencial Coppel</strong> con código de barras para que el cliente pase a la ventanilla de caja rápida sin hacer fila general.
              </p>
            </div>
          )}

          {/* 4. COPPEL PAY */}
          {paymentMethod === 'coppel_pay' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 text-center animate-in fade-in">
              <QrCode className="w-12 h-12 text-[#005BAB] mx-auto" />
              <h4 className="text-xs font-bold text-[#004889]">Cobro con App Coppel Móvil</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Muestra la pantalla de la tableta al cliente para que escanee el código QR desde su aplicación Coppel y autorice con su huella o Face ID.
              </p>
            </div>
          )}

        </div>

        {/* Footer CTAs */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleFinalizeSale}
            disabled={
              isProcessing || 
              (paymentMethod === 'credito_coppel' && !customer)
            }
            className="px-6 py-3 bg-[#FFD000] hover:bg-[#F2C400] text-[#004889] font-black text-sm rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[48px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#004889]" />
                <span>Emitiendo Ticket y Foliando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#004889]" />
                <span>Confirmar Venta y Generar Ticket</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
