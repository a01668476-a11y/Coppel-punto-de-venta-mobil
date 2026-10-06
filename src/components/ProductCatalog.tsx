import React, { useState, useMemo } from 'react';
import { AisleInventory, Department, Product } from '../types';
import { DEPARTMENTS, MOCK_PRODUCTS } from '../data/mockData';
import { ProductCard } from './ProductCard';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  QrCode, 
  X, 
  Tv, 
  Smartphone, 
  Refrigerator, 
  Armchair, 
  Footprints, 
  Bike, 
  LayoutGrid,
  RefreshCw,
  AlertTriangle,
  Boxes,
  CheckCircle2
} from 'lucide-react';

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  comparedProductIds: string[];
  cartProductIds: string[];
  onOpenScanner: () => void;
  inventoryMap: Record<string, AisleInventory>;
  isRefreshingInventory: boolean;
  lastSyncTimestamp: string;
  onRefreshInventory: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onAddToCart,
  onViewDetails,
  onToggleCompare,
  comparedProductIds,
  cartProductIds,
  onOpenScanner,
  inventoryMap,
  isRefreshingInventory,
  lastSyncTimestamp,
  onRefreshInventory,
}) => {
  const [selectedDept, setSelectedDept] = useState<Department>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [inFloorOnly, setInFloorOnly] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [selectedAisleFilter, setSelectedAisleFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'stock_asc'>('popular');

  // Compute low stock total count across store
  const lowStockCount = useMemo(() => {
    return Object.values(inventoryMap).filter((item) => item.isLowStock).length;
  }, [inventoryMap]);

  // Unique aisles list
  const availableAisles = useMemo(() => {
    const aisles = new Set<string>();
    MOCK_PRODUCTS.forEach((p) => {
      const inv = inventoryMap[p.id];
      if (inv) aisles.add(inv.aisleLocation);
      else aisles.add(p.aisleLocation);
    });
    return Array.from(aisles);
  }, [inventoryMap]);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((prod) => {
      const inv = inventoryMap[prod.id];
      const aisleStock = inv ? inv.stockInAisle : prod.stockInStore;

      // Department match
      if (selectedDept !== 'todos' && prod.department !== selectedDept) {
        return false;
      }
      // Floor filter
      if (inFloorOnly && aisleStock <= 0) {
        return false;
      }
      // Only low stock filter
      if (onlyLowStock) {
        const isLow = inv ? inv.isLowStock : aisleStock <= 2;
        if (!isLow) return false;
      }
      // Aisle filter
      if (selectedAisleFilter !== 'todos') {
        const aisleLoc = inv ? inv.aisleLocation : prod.aisleLocation;
        if (aisleLoc !== selectedAisleFilter) return false;
      }
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchSku = prod.sku.toLowerCase().includes(q);
        const matchBrand = prod.brand.toLowerCase().includes(q);
        const matchAisle = prod.aisleLocation.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchBrand && !matchAisle) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceCash - b.priceCash;
      if (sortBy === 'price_desc') return b.priceCash - a.priceCash;
      if (sortBy === 'stock_asc') {
        const stockA = inventoryMap[a.id]?.stockInAisle ?? a.stockInStore;
        const stockB = inventoryMap[b.id]?.stockInAisle ?? b.stockInStore;
        return stockA - stockB;
      }
      return b.rating - a.rating;
    });
  }, [selectedDept, inFloorOnly, onlyLowStock, selectedAisleFilter, searchQuery, sortBy, inventoryMap]);

  const renderDeptIcon = (id: Department) => {
    switch (id) {
      case 'electronica': return <Tv className="w-3.5 h-3.5" />;
      case 'telefonia': return <Smartphone className="w-3.5 h-3.5" />;
      case 'linea_blanca': return <Refrigerator className="w-3.5 h-3.5" />;
      case 'muebles': return <Armchair className="w-3.5 h-3.5" />;
      case 'calzado_moda': return <Footprints className="w-3.5 h-3.5" />;
      case 'motos_movilidad': return <Bike className="w-3.5 h-3.5" />;
      default: return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Real-time Inventory API Status Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                API Inventario en Tiempo Real por Pasillo
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sucursal #104 Culiacán
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Última consulta al servidor de inventarios: <strong className="font-mono text-slate-700">{lastSyncTimestamp || 'En vivo'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefreshInventory}
            disabled={isRefreshingInventory}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#005BAB] bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors min-h-[38px] disabled:opacity-60"
            title="Consultar API de existencias en tiempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingInventory ? 'animate-spin text-[#005BAB]' : ''}`} />
            <span>{isRefreshingInventory ? 'Consultando API...' : 'Actualizar Stock'}</span>
          </button>
        </div>
      </div>

      {/* Red Low Stock Global Banner if low stock items detected */}
      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-red-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong>Alerta de Inventario en Piso:</strong> Se detectaron <strong className="font-extrabold text-red-900">{lowStockCount} artículos</strong> con <strong>Pocas piezas</strong> (1 a 2 unidades restantes en exhibición).
            </span>
          </div>

          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors min-h-[32px] ${
              onlyLowStock
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white text-red-700 border border-red-300 hover:bg-red-100/50'
            }`}
          >
            {onlyLowStock ? 'Ver todos los artículos' : `Filtrar las ${lowStockCount} alertas`}
          </button>
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar artículo por nombre, SKU, marca o pasillo..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005BAB] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Scanner Shortcut */}
          <button
            onClick={onOpenScanner}
            className="px-4 py-2.5 bg-[#005BAB] hover:bg-[#004889] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 min-h-[44px]"
            title="Abrir escáner de tableta"
          >
            <QrCode className="w-4 h-4 text-[#FFD000]" />
            <span>Escanear Etiqueta</span>
          </button>
        </div>

        {/* Filter controls strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Low stock quick toggle button */}
            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[36px] ${
                onlyLowStock
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pocas Piezas ({lowStockCount})</span>
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none hover:text-slate-900">
              <input
                type="checkbox"
                checked={inFloorOnly}
                onChange={(e) => setInFloorOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#005BAB] focus:ring-[#005BAB] accent-[#005BAB]"
              />
              <span>Sólo en piso de tienda</span>
            </label>

            {/* Aisle Filter Selector */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedAisleFilter}
                onChange={(e) => setSelectedAisleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#005BAB] max-w-[190px] truncate"
              >
                <option value="todos">Todos los Pasillos</option>
                {availableAisles.map((aisle) => (
                  <option key={aisle} value={aisle}>
                    {aisle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'price_asc' | 'price_desc' | 'stock_asc')}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#005BAB]"
            >
              <option value="popular">Más Populares</option>
              <option value="stock_asc">Menor Stock en Piso (Urgente)</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DEPARTMENTS.map((dept) => {
          const isActive = selectedDept === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 min-h-[42px] ${
                isActive
                  ? 'bg-[#005BAB] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span className={isActive ? 'text-[#FFD000]' : 'text-slate-500'}>
                {renderDeptIcon(dept.id)}
              </span>
              <span>{dept.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Mostrando <strong className="text-slate-800 font-semibold">{filteredProducts.length}</strong> artículos con stock verificado en pasillo</span>
        {onlyLowStock && (
          <span className="text-red-700 font-bold">Filtro: Mostrando únicamente artículos con pocas piezas</span>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800">No se encontraron artículos con los filtros aplicados</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {onlyLowStock 
              ? 'No hay más artículos en estado crítico de pocas piezas en esta selección.'
              : 'Prueba ajustando la búsqueda o revisa en otro pasillo o departamento.'
            }
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('todos');
              setInFloorOnly(false);
              setOnlyLowStock(false);
              setSelectedAisleFilter('todos');
            }}
            className="px-4 py-2 bg-[#005BAB] text-white rounded-lg text-xs font-semibold hover:bg-[#004889]"
          >
            Ver Todo el Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              inventory={inventoryMap[prod.id]}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
              onToggleCompare={onToggleCompare}
              isCompared={comparedProductIds.includes(prod.id)}
              isInCart={cartProductIds.includes(prod.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};

