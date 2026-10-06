import { AisleInventory, Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockData';

// Initial state of aisle stock across store #104
const INITIAL_AISLE_INVENTORIES: Record<string, AisleInventory> = {
  'prod-01': {
    productId: 'prod-01',
    sku: 'COP-482910',
    aisleLocation: 'Pasillo 4 · Exhibición Central TV',
    aisleNumber: 4,
    shelfLevel: 'Nivel 1 (Base)',
    stockInAisle: 1, // ALERTA: Pocas piezas!
    stockInWarehouse: 12,
    stockInCedis: 65,
    minStockThreshold: 2,
    isLowStock: true,
    isOutOfStock: false,
    reservedCount: 0,
    lastSyncTimestamp: 'En vivo',
  },
  'prod-02': {
    productId: 'prod-02',
    sku: 'COP-932145',
    aisleLocation: 'Isla de Telefonía Telcel/Movistar · Vitrina A2',
    aisleNumber: 2,
    shelfLevel: 'Vitrina 2 (Seguridad)',
    stockInAisle: 8,
    stockInWarehouse: 25,
    stockInCedis: 140,
    minStockThreshold: 3,
    isLowStock: false,
    isOutOfStock: false,
    reservedCount: 1,
    lastSyncTimestamp: 'En vivo',
  },
  'prod-03': {
    productId: 'prod-03',
    sku: 'COP-310492',
    aisleLocation: 'Pasillo 8 · Línea Blanca · Módulo Frío',
    aisleNumber: 8,
    shelfLevel: 'Bahía Frío Principal',
    stockInAisle: 2, // ALERTA: Pocas piezas!
    stockInWarehouse: 6,
    stockInCedis: 32,
    minStockThreshold: 2,
    isLowStock: true,
    isOutOfStock: false,
    reservedCount: 0,
    lastSyncTimestamp: 'En vivo',
  },
  'prod-04': {
    productId: 'prod-04',
    sku: 'COP-774120',
    aisleLocation: 'Zapatería · Pasillo Calzado Deportivo B12',
    aisleNumber: 12,
    shelfLevel: 'Estante 3 (Tallas 26-28)',
    stockInAisle: 14,
    stockInWarehouse: 40,
    stockInCedis: 210,
    minStockThreshold: 4,
    isLowStock: false,
    isOutOfStock: false,
    reservedCount: 2,
    lastSyncTimestamp: 'En vivo',
  },
  'prod-05': {
    productId: 'prod-05',
    sku: 'COP-650183',
    aisleLocation: 'Pasillo 8 · Bahía C · Lavado',
    aisleNumber: 8,
    shelfLevel: 'Bahía C3',
    stockInAisle: 3,
    stockInWarehouse: 9,
    stockInCedis: 45,
    minStockThreshold: 2,
    isLowStock: false,
    isOutOfStock: false,
    reservedCount: 0,
    lastSyncTimestamp: 'En vivo',
  },
  'prod-06': {
    productId: 'prod-06',
    sku: 'COP-881290',
    aisleLocation: 'Muebles · Sala Principal Muestrario #3',
    aisleNumber: 3,
    shelfLevel: 'Tarima A',
    stockInAisle: 1, // ALERTA: Pocas piezas (Última pieza en exhibición!)
    stockInWarehouse: 2,
    stockInCedis: 14,
    minStockThreshold: 2,
    isLowStock: true,
    isOutOfStock: false,
    reservedCount: 0,
    lastSyncTimestamp: 'En vivo',
  },
  'prod-07': {
    productId: 'prod-07',
    sku: 'COP-519082',
    aisleLocation: 'Patio de Motos y Movilidad · Rampa A',
    aisleNumber: 1,
    shelfLevel: 'Rampa de Exhibición 1',
    stockInAisle: 1, // ALERTA: Pocas piezas!
    stockInWarehouse: 3,
    stockInCedis: 18,
    minStockThreshold: 2,
    isLowStock: true,
    isOutOfStock: false,
    reservedCount: 1,
    lastSyncTimestamp: 'En vivo',
  },
  'prod-08': {
    productId: 'prod-08',
    sku: 'COP-224819',
    aisleLocation: 'Pasillo 5 · Cómputo e Impresión · Vitrina 1',
    aisleNumber: 5,
    shelfLevel: 'Vitrina 1 Cómputo',
    stockInAisle: 5,
    stockInWarehouse: 18,
    stockInCedis: 80,
    minStockThreshold: 2,
    isLowStock: false,
    isOutOfStock: false,
    reservedCount: 0,
    lastSyncTimestamp: 'En vivo',
  }
};

let storeInventories: Record<string, AisleInventory> = { ...INITIAL_AISLE_INVENTORIES };

/**
 * Simulated Coppel Store Inventory API
 * Endpoint: GET /api/v1/sucursales/104/inventario-pasillo
 */
export async function getAisleInventoryApi(): Promise<{
  success: boolean;
  storeNumber: string;
  timestamp: string;
  totalAisles: number;
  lowStockCount: number;
  data: Record<string, AisleInventory>;
}> {
  // Simulate network latency (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Count items with low stock
  let lowStockCount = 0;
  Object.values(storeInventories).forEach((item) => {
    item.lastSyncTimestamp = timeStr;
    if (item.stockInAisle > 0 && item.stockInAisle <= item.minStockThreshold) {
      item.isLowStock = true;
      lowStockCount++;
    } else {
      item.isLowStock = false;
    }
  });

  return {
    success: true,
    storeNumber: '104-CULIACAN-CENTRO',
    timestamp: timeStr,
    totalAisles: 12,
    lowStockCount,
    data: { ...storeInventories },
  };
}

/**
 * Request instant replenishment from store warehouse to aisle shelf
 */
export async function requestAisleRestockApi(productId: string): Promise<{
  success: boolean;
  message: string;
  updatedInventory: AisleInventory;
}> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const current = storeInventories[productId];
  if (!current) {
    throw new Error('Producto no encontrado en padrón de inventarios');
  }

  // Mark restock requested
  const updated: AisleInventory = {
    ...current,
    restockRequested: true,
  };
  storeInventories[productId] = updated;

  return {
    success: true,
    message: `Solicitud de resurtido enviada a Bodega Interna para ${current.sku} en ${current.aisleLocation}.`,
    updatedInventory: updated,
  };
}

/**
 * Simulate stock change (e.g. after customer checkout)
 */
export function decrementAisleStock(productId: string, quantity: number = 1): void {
  const current = storeInventories[productId];
  if (current) {
    const newAisle = Math.max(0, current.stockInAisle - quantity);
    storeInventories[productId] = {
      ...current,
      stockInAisle: newAisle,
      isLowStock: newAisle > 0 && newAisle <= current.minStockThreshold,
      isOutOfStock: newAisle === 0,
    };
  }
}
