import React from 'react';
import { ShoppingCart, QrCode, Calculator, Columns, BarChart3, Tablet, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'catalogo' | 'scanner' | 'calculadora' | 'comparador' | 'ventas';
  setActiveTab: (tab: 'catalogo' | 'scanner' | 'calculadora' | 'comparador' | 'ventas') => void;
  cartItemCount: number;
  openCart: () => void;
  orientation: 'landscape' | 'portrait';
  toggleOrientation: () => void;
  resetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartItemCount,
  openCart,
  orientation,
  toggleOrientation,
  resetDemoData,
}) => {
  return (
    <header className="bg-[#005BAB] text-white border-b border-[#004889] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark with iconic Coppel accent */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('catalogo')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded-full bg-[#FFD000] flex items-center justify-center shadow-sm">
              <span className="text-[#005BAB] font-black text-xl tracking-tighter">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                Coppel <span className="text-[#FFD000] font-normal text-sm tracking-normal">POS Móvil</span>
              </span>
              <span className="text-[11px] text-blue-200 tracking-wide font-medium">Terminal Asesor de Piso</span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links with active state indicator */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'catalogo'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>Catálogo en Piso</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#FFD000]" />
            <span>Escáner SKU</span>
          </button>

          <button
            onClick={() => setActiveTab('calculadora')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calculadora'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#FFD000]" />
            <span>Calculadora Crédito</span>
          </button>

          <button
            onClick={() => setActiveTab('comparador')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'comparador'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-blue-200" />
            <span>Comparar</span>
          </button>

          <button
            onClick={() => setActiveTab('ventas')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ventas'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-200" />
            <span>Mis Ventas</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {/* Orientation switch for tablet testing */}
          <button
            onClick={toggleOrientation}
            title={orientation === 'landscape' ? 'Cambiar a modo Tableta Vertical' : 'Cambiar a modo Tableta Horizontal'}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors min-h-[44px] min-w-[44px] justify-center"
          >
            <Tablet className={`w-4 h-4 transition-transform ${orientation === 'portrait' ? 'rotate-90 text-[#FFD000]' : ''}`} />
            <span className="hidden sm:inline text-[11px] capitalize">{orientation}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={resetDemoData}
            title="Reiniciar simulador"
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg text-xs transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Cart CTA */}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 bg-[#FFD000] text-[#004889] hover:bg-[#F2C400] active:scale-95 transition-all font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm min-h-[44px]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Carrito</span>
            {cartItemCount > 0 && (
              <span className="bg-[#005BAB] text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center tabular-nums">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
