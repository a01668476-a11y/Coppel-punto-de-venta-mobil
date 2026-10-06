import React, { useState } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockData';
import { playBeepSound } from '../utils/creditCalculator';
import { QrCode, X, Search, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned: (product: Product, addToCartDirectly: boolean) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onProductScanned,
}) => {
  const [manualSku, setManualSku] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastScanned, setLastScanned] = useState<Product | null>(null);

  if (!isOpen) return null;

  const handleScanProduct = (product: Product, directAdd: boolean) => {
    playBeepSound();
    setLastScanned(product);
    setTimeout(() => {
      onProductScanned(product, directAdd);
      if (directAdd) {
        onClose();
      }
    }, 400);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = manualSku.trim().toUpperCase();
    const found = MOCK_PRODUCTS.find(
      (p) => p.sku.toUpperCase() === clean || p.id.toUpperCase() === clean
    );

    if (found) {
      handleScanProduct(found, false);
    } else {
      setErrorMsg(`No se encontró ningún artículo con el código "${manualSku}". Verifica la etiqueta.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div 
        className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#005BAB] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#FFD000]" />
            <div>
              <h3 className="font-bold text-sm text-white">Escáner de Código de Barras / SKU</h3>
              <p className="text-[11px] text-blue-200">Apunta la cámara de la tableta a la etiqueta de precio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="p-6 flex flex-col items-center justify-center bg-black/60 relative overflow-hidden">
          <div className="relative w-64 h-48 border-2 border-[#005BAB] rounded-xl flex items-center justify-center bg-slate-950/40 shadow-inner">
            
            {/* Corner brackets */}
            <div className="absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 border-[#FFD000]"></div>
            <div className="absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 border-[#FFD000]"></div>
            <div className="absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 border-[#FFD000]"></div>
            <div className="absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 border-[#FFD000]"></div>

            {/* Red animated laser scan line */}
            <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_12px_#ff0000] animate-pulse"></div>

            <div className="text-center p-3 pointer-events-none">
              <span className="text-xs text-slate-300 font-mono block">CÁMARA TABLETA POS ACTIVA</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Alinea el código de barras horizontalmente</span>
            </div>
          </div>

          {lastScanned && (
            <div className="mt-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>¡Escaneo exitoso! <strong>{lastScanned.name}</strong></span>
            </div>
          )}
        </div>

        {/* Quick Scan Test Buttons for Floor Associate Demo */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#FFD000]" />
                Etiquetas de Prueba en Piso (Toca para simular escaneo con bip):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOCK_PRODUCTS.slice(0, 4).map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => handleScanProduct(prod, false)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left text-xs flex items-center justify-between group transition-colors min-h-[46px]"
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-[10px] text-[#FFD000] block">{prod.sku}</span>
                    <span className="font-semibold text-slate-200 group-hover:text-white truncate block">
                      {prod.name}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#FFD000] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Manual barcode input */}
          <form onSubmit={handleManualSearch} className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              O ingresa el código SKU manualmente:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualSku}
                  onChange={(e) => setManualSku(e.target.value)}
                  placeholder="Ej. COP-482910 o COP-932145"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005BAB]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#005BAB] hover:bg-[#004889] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors min-h-[44px]"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 mt-2 font-medium">{errorMsg}</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Lector láser 2D Honeywell / Cámara frontal</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white rounded-lg"
          >
            Cerrar Escáner
          </button>
        </div>

      </div>
    </div>
  );
};
