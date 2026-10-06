import React, { useState } from 'react';
import { SaleOrder } from '../types';
import { formatMXN } from '../utils/creditCalculator';
import { 
  Printer, 
  Share2, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  X, 
  Sparkles, 
  Download,
  Store,
  Truck
} from 'lucide-react';

interface ReceiptModalProps {
  order: SaleOrder | null;
  onClose: () => void;
  onNewSale: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  onNewSale,
}) => {
  const [printStatus, setPrintStatus] = useState<string>('');
  const [shareStatus, setShareStatus] = useState<string>('');

  if (!order) return null;

  const handlePrintBeltPrinter = () => {
    setPrintStatus('Enviando a mini-impresora Bluetooth Zebra...');
    setTimeout(() => {
      setPrintStatus('¡Ticket impreso en cinturón exitosamente!');
      setTimeout(() => setPrintStatus(''), 2500);
    }, 1200);
  };

  const handleSendWhatsApp = () => {
    setShareStatus('Enviando comprobante digital al WhatsApp del cliente...');
    setTimeout(() => {
      setShareStatus('¡Comprobante enviado por WhatsApp al ' + (order.customer?.phone || 'cliente') + '!');
      setTimeout(() => setShareStatus(''), 2500);
    }, 1000);
  };

  const handleSendEmail = () => {
    setShareStatus('Enviando factura y ticket digital por correo...');
    setTimeout(() => {
      setShareStatus('¡Ticket enviado a ' + (order.customer?.email || 'correo del cliente') + '!');
      setTimeout(() => setShareStatus(''), 2500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Success Banner */}
        <div className="bg-[#005BAB] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFD000] text-[#005BAB] flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Venta en Piso Finalizada con Éxito</h3>
              <p className="text-[11px] text-blue-200">Folio Oficial: {order.folio}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification toast */}
        {(printStatus || shareStatus) && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 text-center animate-in fade-in">
            {printStatus || shareStatus}
          </div>
        )}

        {/* Thermal Receipt Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="w-full max-w-sm bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-slate-800 text-xs font-mono space-y-3">
            
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
              <div className="font-black text-lg text-[#005BAB] tracking-wider">COPPEL</div>
              <div className="text-[10px] text-slate-500">COPPEL S.A. DE C.V. · RFC: COP-920428-Q20</div>
              <div className="text-[10px] text-slate-500">SUCURSAL #104 · CULIACÁN CENTRO</div>
              <div className="text-[10px] text-slate-500">TERMINAL MÓVIL PISO: TAB-08</div>
              <div className="text-[10px] text-slate-500">ASESOR: CARLOS MENDOZA (84920)</div>
              <div className="text-[10px] text-slate-600 font-semibold pt-1">
                FOLIO: {order.folio} · {order.timestamp}
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-b border-dashed border-slate-300 pb-2 text-[11px]">
              {order.customer ? (
                <div>
                  <div>CLIENTE: <strong className="text-slate-900">{order.customer.fullName}</strong></div>
                  <div>NO. CLIENTE: <strong className="text-slate-900">{order.customer.clientNumber}</strong></div>
                  <div className="text-[10px] text-slate-500">NIVEL: {order.customer.tier}</div>
                </div>
              ) : (
                <div className="text-slate-600 font-semibold">VENTA AL PÚBLICO GENERAL (CONTADO)</div>
              )}
              <div className="text-[10px] text-slate-500 mt-1">
                MODO: {order.deliveryType === 'tienda_inmediata' ? 'ENTREGA INMEDIATA EN PISO' : 'ENVÍO GRATIS A DOMICILIO'}
              </div>
            </div>

            {/* Itemized list */}
            <div className="border-b border-dashed border-slate-300 pb-2 space-y-2 text-[11px]">
              <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1">
                <span>CANT / ARTÍCULO</span>
                <span>TOTAL</span>
              </div>
              {order.items.map((item) => (
                <div key={item.product.id} className="space-y-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="line-clamp-1">{item.quantity}x {item.product.name}</span>
                    <span className="tabular-nums font-bold">
                      {formatMXN(item.product.priceCash * item.quantity)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    SKU: {item.product.sku} · {item.product.aisleLocation}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>SUBTOTAL:</span>
                <span className="tabular-nums font-bold">{formatMXN(order.totalCash * 0.862)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA TRASLADADO (16%):</span>
                <span className="tabular-nums font-bold">{formatMXN(order.totalCash * 0.138)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL CONTADO:</span>
                <span className="tabular-nums">{formatMXN(order.totalCash)}</span>
              </div>

              {/* Crédito Coppel Schedule if applicable */}
              {order.selectedPaymentMethod === 'credito_coppel' && (
                <div className="bg-[#FFFBE6] p-2.5 rounded border border-[#FFD000] mt-2 space-y-1">
                  <div className="font-bold text-[#005BAB] text-[11px] uppercase">
                    PAGARÉ CRÉDITO COPPEL
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>PLAZO AUTORIZADO:</span>
                    <strong className="text-slate-900">{order.selectedQuincenas} Quincenas</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>PAGO QUINCENAL:</span>
                    <strong className="text-[#004889] text-xs font-black tabular-nums">
                      {formatMXN(order.quincenalPayment)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>TOTAL A CRÉDITO:</span>
                    <span className="tabular-nums font-semibold">{formatMXN(order.totalCredit)}</span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-semibold pt-1">
                    *Paga puntual antes de tu fecha de corte y ahorra intereses.
                  </div>
                </div>
              )}
            </div>

            {/* Customer Signature preview */}
            {order.signatureDataUrl && (
              <div className="border-t border-dashed border-slate-300 pt-2 text-center">
                <span className="text-[10px] text-slate-400 block mb-1">FIRMA DIGITAL REGISTRADA</span>
                <img
                  src={order.signatureDataUrl}
                  alt="Firma Digital"
                  className="h-12 max-w-full mx-auto object-contain border border-slate-200 rounded bg-slate-50"
                />
                <span className="text-[9px] text-slate-400 block mt-1">CÓDIGO AUT: {order.authorizationCode}</span>
              </div>
            )}

            {/* Barcode representation */}
            <div className="text-center pt-2 border-t border-dashed border-slate-300 space-y-1">
              <div className="font-mono tracking-widest text-[9px] text-slate-400">
                |||||||||||||||||||||||||||||||||||||||||||||||||||
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{order.folio}</div>
              <div className="text-[9px] text-slate-400">¡GRACIAS POR SU COMPRA EN COPPEL!</div>
              <div className="text-[9px] text-[#005BAB] font-semibold">MEJORA TU VIDA</div>
            </div>

          </div>
        </div>

        {/* Action Buttons for Associate */}
        <div className="bg-white border-t border-slate-200 p-4 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePrintBeltPrinter}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-[#005BAB]" />
              <span className="hidden sm:inline">Imprimir Cinturón</span>
              <span className="sm:hidden">Imprimir</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-[#005BAB] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
            >
              <Mail className="w-4 h-4 text-[#005BAB]" />
              <span>Correo</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cerrar Comprobante
            </button>

            <button
              onClick={onNewSale}
              className="px-6 py-2.5 bg-[#FFD000] hover:bg-[#F2C400] text-[#004889] font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 min-h-[44px]"
            >
              Comenzar Nueva Venta en Piso
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
