import React, { useState, useEffect } from 'react';
import { 
  AisleInventory,
  CartItem, 
  CustomerCredit, 
  DeliveryType, 
  Product, 
  SaleOrder 
} from './types';
import { MOCK_CUSTOMERS, MOCK_PRODUCTS } from './data/mockData';
import { Header } from './components/Header';
import { AssociateStatusBar } from './components/AssociateStatusBar';
import { CustomerHeaderBar } from './components/CustomerHeaderBar';
import { ProductCatalog } from './components/ProductCatalog';
import { CartDrawer } from './components/CartDrawer';
import { CustomerModal } from './components/CustomerModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CreditCalculatorModal } from './components/CreditCalculatorModal';
import { ProductComparatorModal } from './components/ProductComparatorModal';
import { AdvisorStatsModal } from './components/AdvisorStatsModal';
import { playBeepSound } from './utils/creditCalculator';
import { 
  decrementAisleStock, 
  getAisleInventoryApi, 
  requestAisleRestockApi 
} from './services/inventoryApi';
import { ShoppingCart, QrCode, Calculator, Columns, BarChart3 } from 'lucide-react';

export default function App() {
  // Navigation & view states
  const [activeTab, setActiveTab] = useState<'catalogo' | 'scanner' | 'calculadora' | 'comparador' | 'ventas'>('catalogo');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // Real-time Aisle Inventory API state
  const [inventoryMap, setInventoryMap] = useState<Record<string, AisleInventory>>({});
  const [isRefreshingInventory, setIsRefreshingInventory] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>('');

  // Initial load of simulated inventory API
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const res = await getAisleInventoryApi();
        setInventoryMap(res.data);
        setLastSyncTimestamp(res.timestamp);
      } catch {
        // Fallback
      }
    };
    loadInventory();
  }, []);

  const handleRefreshInventory = async () => {
    setIsRefreshingInventory(true);
    try {
      const res = await getAisleInventoryApi();
      setInventoryMap(res.data);
      setLastSyncTimestamp(res.timestamp);
    } finally {
      setIsRefreshingInventory(false);
    }
  };

  const handleRequestRestock = async (productId: string) => {
    try {
      const res = await requestAisleRestockApi(productId);
      setInventoryMap((prev) => ({
        ...prev,
        [productId]: res.updatedInventory,
      }));
    } catch {
      // Handled
    }
  };

  // Customer state - default to first customer for rich initial demonstration
  const [currentCustomer, setCurrentCustomer] = useState<CustomerCredit | null>(MOCK_CUSTOMERS[0]);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: MOCK_PRODUCTS[0], // Smart TV Samsung 55"
      quantity: 1,
      selectedQuincenas: 24,
      initialPayment: 0,
    }
  ]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('tienda_inmediata');

  // Compared products
  const [comparedProductIds, setComparedProductIds] = useState<string[]>(['prod-01', 'prod-08']);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<SaleOrder | null>(null);
  const [isCreditCalcOpen, setIsCreditCalcOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Completed sales log
  const [recentOrders, setRecentOrders] = useState<SaleOrder[]>([]);

  // Cart operations
  const handleAddToCart = (product: Product, quincenas?: number, initialPayment?: number) => {
    playBeepSound();
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                selectedQuincenas: quincenas || item.selectedQuincenas,
                initialPayment: initialPayment !== undefined ? initialPayment : item.initialPayment,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedQuincenas: quincenas || product.defaultQuincenas,
          initialPayment: initialPayment || 0,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Comparator toggle
  const handleToggleCompare = (product: Product) => {
    setComparedProductIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      if (prev.length >= 2) {
        // Replace second
        return [prev[1], product.id];
      }
      return [...prev, product.id];
    });
    setIsComparatorOpen(true);
  };

  const handleRemoveFromCompare = (productId: string) => {
    setComparedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  // Scan handler
  const handleProductScanned = (product: Product, addToCartDirectly: boolean) => {
    if (addToCartDirectly) {
      handleAddToCart(product);
    } else {
      setSelectedProductForDetail(product);
    }
  };

  // Order finalized - decrement live aisle stock in API!
  const handleCompleteSale = (order: SaleOrder) => {
    order.items.forEach((item) => {
      decrementAisleStock(item.product.id, item.quantity);
    });
    // Immediately refresh local inventory map
    getAisleInventoryApi().then((res) => {
      setInventoryMap(res.data);
      setLastSyncTimestamp(res.timestamp);
    });

    setRecentOrders((prev) => [order, ...prev]);
    setLastCompletedOrder(order);
    setCartItems([]);
    setIsReceiptModalOpen(true);
  };

  // Reset demo data
  const handleResetDemoData = () => {
    setCurrentCustomer(MOCK_CUSTOMERS[0]);
    setCartItems([
      {
        product: MOCK_PRODUCTS[0],
        quantity: 1,
        selectedQuincenas: 24,
        initialPayment: 0,
      }
    ]);
    setActiveTab('catalogo');
    handleRefreshInventory();
  };

  const comparedProducts = MOCK_PRODUCTS.filter((p) => comparedProductIds.includes(p.id));
  const cartProductIds = cartItems.map((item) => item.product.id);
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      
      {/* Associate Store & Device Live Bar */}
      <AssociateStatusBar />

      {/* Main Top Header conforming to 3-Zone Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'scanner') setIsScannerModalOpen(true);
          if (tab === 'calculadora') setIsCreditCalcOpen(true);
          if (tab === 'comparador') setIsComparatorOpen(true);
          if (tab === 'ventas') setIsStatsOpen(true);
        }}
        cartItemCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        orientation={orientation}
        toggleOrientation={() =>
          setOrientation((prev) => (prev === 'landscape' ? 'portrait' : 'landscape'))
        }
        resetDemoData={handleResetDemoData}
      />

      {/* Active Customer Strip */}
      <CustomerHeaderBar
        currentCustomer={currentCustomer}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
        onClearCustomer={() => setCurrentCustomer(null)}
        onOpenBiometricModal={() => setIsCustomerModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className={`flex gap-6 items-start ${orientation === 'landscape' ? 'flex-row' : 'flex-col'}`}>
          
          {/* Left/Main Column: Product Catalog & Floor Navigation */}
          <div className="flex-1 min-w-0 w-full">
            <ProductCatalog
              onAddToCart={handleAddToCart}
              onViewDetails={(prod) => setSelectedProductForDetail(prod)}
              onToggleCompare={handleToggleCompare}
              comparedProductIds={comparedProductIds}
              cartProductIds={cartProductIds}
              onOpenScanner={() => setIsScannerModalOpen(true)}
              inventoryMap={inventoryMap}
              isRefreshingInventory={isRefreshingInventory}
              lastSyncTimestamp={lastSyncTimestamp}
              onRefreshInventory={handleRefreshInventory}
            />
          </div>

          {/* Right Column: Pinned Cart Sidebar on Tablet Landscape */}
          {orientation === 'landscape' && (
            <CartDrawer
              isOpen={true}
              onClose={() => {}}
              cartItems={cartItems}
              customer={currentCustomer}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
              onStartCheckout={() => setIsCheckoutModalOpen(true)}
              onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
              isPinnedSidebar={true}
            />
          )}

        </div>
      </main>

      {/* Slide-out Cart Drawer when in Portrait or mobile viewport */}
      {orientation === 'portrait' && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          customer={currentCustomer}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          deliveryType={deliveryType}
          setDeliveryType={setDeliveryType}
          onStartCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutModalOpen(true);
          }}
          onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
          isPinnedSidebar={false}
        />
      )}

      {/* Bottom Sticky Action Bar in Portrait Mode for 1-Handed Tablet Walking */}
      {orientation === 'portrait' && (
        <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-[#005BAB] rounded-xl flex items-center gap-1.5 text-xs font-bold min-h-[44px]"
            >
              <QrCode className="w-4 h-4 text-[#005BAB]" />
              <span className="hidden sm:inline">Escanear</span>
            </button>
            <button
              onClick={() => setIsCreditCalcOpen(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-semibold min-h-[44px]"
            >
              <Calculator className="w-4 h-4 text-[#FFD000]" />
              <span className="hidden sm:inline">Calculadora</span>
            </button>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-2.5 bg-[#FFD000] hover:bg-[#F2C400] text-[#004889] font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs min-h-[44px]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Ver Carrito ({totalCartCount})</span>
          </button>
        </div>
      )}

      {/* MODALS */}

      {/* 1. Customer Identification & Onboarding */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={(cust) => setCurrentCustomer(cust)}
      />

      {/* 2. Barcode & QR Floor Scanner */}
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onProductScanned={handleProductScanned}
      />

      {/* 3. Product Specs & Live Credit Simulator */}
      <ProductDetailModal
        product={selectedProductForDetail}
        customer={currentCustomer}
        inventory={selectedProductForDetail ? inventoryMap[selectedProductForDetail.id] : undefined}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={handleAddToCart}
        onRequestRestock={handleRequestRestock}
        isInCart={
          selectedProductForDetail
            ? cartProductIds.includes(selectedProductForDetail.id)
            : false
        }
      />

      {/* 4. Floor Associate Checkout & Tablet Signature */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        customer={currentCustomer}
        deliveryType={deliveryType}
        onCompleteSale={handleCompleteSale}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
      />

      {/* 5. Authentic Coppel Digital Receipt & Belt Printer */}
      <ReceiptModal
        order={lastCompletedOrder}
        onClose={() => setIsReceiptModalOpen(false)}
        onNewSale={() => {
          setIsReceiptModalOpen(false);
          setActiveTab('catalogo');
        }}
      />

      {/* 6. Standalone Credit Calculator */}
      <CreditCalculatorModal
        isOpen={isCreditCalcOpen}
        onClose={() => setIsCreditCalcOpen(false)}
        customer={currentCustomer}
      />

      {/* 7. Product Side-by-Side Comparator */}
      <ProductComparatorModal
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        comparedProducts={comparedProducts}
        onRemoveProduct={handleRemoveFromCompare}
        onAddToCart={handleAddToCart}
      />

      {/* 8. Floor Advisor Sales Dashboard */}
      <AdvisorStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        recentOrders={recentOrders}
        onSelectOrderForReceipt={(ord) => {
          setLastCompletedOrder(ord);
          setIsReceiptModalOpen(true);
        }}
      />

    </div>
  );
}

