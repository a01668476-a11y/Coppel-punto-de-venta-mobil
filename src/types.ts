export type Department = 
  | 'todos'
  | 'electronica'
  | 'telefonia'
  | 'linea_blanca'
  | 'muebles'
  | 'calzado_moda'
  | 'motos_movilidad';

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  department: Department;
  description: string;
  priceCash: number; // Precio de contado
  priceCredit: number; // Precio total a crédito base
  defaultQuincenas: number; // 24 quincenas estándar
  image: string;
  stockInStore: number;
  stockInWarehouse: number;
  aisleLocation: string; // Ubicación en piso ej. "Pasillo 3 · Bahía A"
  features: string[];
  inDisplay: boolean;
  warrantyMonths: number;
  rating: number;
}

export interface AisleInventory {
  productId: string;
  sku: string;
  aisleLocation: string;
  aisleNumber: number;
  shelfLevel: string;
  stockInAisle: number; // Stock físico en el mueble/estante del pasillo
  stockInWarehouse: number; // Stock en bodega interna de la tienda
  stockInCedis: number; // Stock en CEDIS regional
  minStockThreshold: number; // Límite para disparar alerta roja de 'Pocas piezas'
  isLowStock: boolean;
  isOutOfStock: boolean;
  reservedCount: number;
  lastSyncTimestamp: string;
  restockRequested?: boolean;
}

export interface CustomerCredit {
  clientNumber: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  creditLimit: number;
  availableCredit: number;
  currentBalance: number;
  tier: 'Oro Puntual' | 'Plata' | 'Clásico' | 'Nuevo';
  onTimePaymentDiscount: number; // % descuento por pronto pago
  fingerprintRegistered: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedQuincenas: number;
  initialPayment: number; // Enganche / pago inicial
}

export type PaymentMethod = 'credito_coppel' | 'tarjeta_terminal' | 'efectivo_caja' | 'coppel_pay';
export type DeliveryType = 'tienda_inmediata' | 'domicilio_gratis';

export interface SaleOrder {
  id: string;
  folio: string;
  timestamp: string;
  customer: CustomerCredit | null;
  items: CartItem[];
  subtotalCash: number;
  totalCash: number;
  totalCredit: number;
  selectedPaymentMethod: PaymentMethod;
  selectedQuincenas: number;
  quincenalPayment: number;
  deliveryType: DeliveryType;
  advisorName: string;
  advisorStoreNumber: string;
  signatureDataUrl?: string;
  authorizationCode?: string;
}
