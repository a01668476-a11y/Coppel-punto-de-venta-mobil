import React from 'react';
import { AisleInventory, Product } from '../types';
import { calculateCoppelCredit, formatMXN } from '../utils/creditCalculator';
import { MapPin, Plus, Check, Eye, SlidersHorizontal, AlertCircle, Warehouse } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  inventory?: AisleInventory;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  isCompared: boolean;
  isInCart: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inventory,
  onAddToCart,
  onViewDetails,
  onToggleCompare,
  isCompared,
  isInCart,
}) => {
  const quote = calculateCoppelCredit(product.priceCash, product.defaultQuincenas);

  const aisleStock = inventory ? inventory.stockInAisle : product.stockInStore;
  const warehouseStock = inventory ? inventory.stockInWarehouse : product.stockInWarehouse;
  const isLowStock = inventory ? inventory.isLowStock : aisleStock <= 2;
  const isOutOfStock = inventory ? inventory.isOutOfStock : aisleStock === 0;

  return (
    <div className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden group ${
      isLowStock 
        ? 'border-red-300 ring-1 ring-red-400/30 shadow-xs' 
        : 'border-slate-200 hover:border-[#005BAB]/50 hover:shadow-md'
    }`}>
      
      {/* Product Image & Aisle Locator Tag */}
      <div className="relative bg-slate-50 p-3 flex items-center justify-center min-h-[170px] overflow-hidden border-b border-slate-100">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-36 object-contain mix-blend-multiply group-hover:scale-102 transition-transform duration-200"
          loading="lazy"
        />

        {/* Location in store - floor advisor vital info */}
        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-[#FFD000]" />
          <span className="truncate max-w-[170px]">{product.aisleLocation}</span>
        </div>

        {/* Stock status indicator pill */}
        <div className={`absolute bottom-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded shadow-2xs border backdrop-blur-xs ${
          isLowStock
            ? 'bg-red-50/95 border-red-300 text-red-700'
            : isOutOfStock
            ? 'bg-slate-100 border-slate-300 text-slate-500'
            : 'bg-white/95 border-slate-200/80 text-slate-700'
        }`}>
          {isLowStock ? (
            <span className="font-extrabold text-red-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              {aisleStock} {aisleStock === 1 ? 'en exhibición' : 'en piso'}
            </span>
          ) : (
            <span className="text-emerald-700 font-bold">
              {aisleStock} en piso
            </span>
          )}
          <span className="text-slate-400 mx-1">·</span>
          <span className="text-slate-500 font-medium">{warehouseStock} en bodega</span>
        </div>
      </div>

      {/* Red Low Stock Banner Alert */}
      {isLowStock && (
        <div className="bg-red-50 border-b border-red-200 px-3 py-1.5 flex items-center justify-between text-xs text-red-700 font-semibold animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="font-bold text-red-800">¡Pocas piezas!</span>
          </div>
          <span className="text-[11px] text-red-600 font-medium">
            Solo {aisleStock} {aisleStock === 1 ? 'disponible' : 'disponibles'} en pasillo
          </span>
        </div>
      )}

      {/* Product Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & SKU unboxed text */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 uppercase tracking-wide">{product.brand}</span>
            <span className="font-mono text-[11px]">SKU: {product.sku}</span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 hover:text-[#005BAB] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>
        </div>

        {/* Coppel Pricing Block: Contado vs Crédito Coppel */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs text-slate-500">Precio de Contado</span>
            <span className="text-sm font-extrabold text-slate-800 tabular-nums">
              {formatMXN(product.priceCash)}
            </span>
          </div>

          {/* Iconic Coppel Abonos Quincenales highlight */}
          <div className="bg-[#FFFBE6] border border-[#FFD000] rounded-lg p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#005BAB] uppercase tracking-wider block">
                Crédito Coppel
              </span>
              <div className="text-xs text-slate-600">
                <span className="font-black text-sm text-[#004889] tabular-nums">
                  {formatMXN(quote.quincenalPayment)}
                </span>
                <span className="text-[11px] text-slate-500"> quincenal</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-600 font-medium block">
                a {product.defaultQuincenas} quincenas
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold">
                Enganche $0
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons for Mobile Floor Associate */}
        <div className="mt-3.5 grid grid-cols-5 gap-1.5 pt-1">
          <button
            onClick={() => onToggleCompare(product)}
            title={isCompared ? 'Quitar de comparador' : 'Comparar artículo'}
            className={`col-span-1 rounded-lg border text-xs flex items-center justify-center min-h-[44px] transition-colors ${
              isCompared
                ? 'bg-blue-50 border-[#005BAB] text-[#005BAB]'
                : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewDetails(product)}
            className="col-span-1 rounded-lg border border-slate-200 text-slate-600 hover:text-[#005BAB] hover:bg-blue-50/50 text-xs flex items-center justify-center min-h-[44px] transition-colors"
            title="Ver ficha técnica completa y consultar stock"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onAddToCart(product)}
            className={`col-span-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] shadow-2xs transition-all active:scale-95 ${
              isInCart
                ? 'bg-[#005BAB] text-white'
                : 'bg-[#FFD000] hover:bg-[#F2C400] text-[#004889]'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" />
                <span>En Carrito</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
