import React, { useState } from 'react';
import { CustomerCredit } from '../types';
import { MOCK_CUSTOMERS } from '../data/mockData';
import { formatMXN } from '../utils/creditCalculator';
import { Search, Fingerprint, UserCheck, X, Award, Phone, MapPin, UserPlus } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerCredit) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New customer draft form
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  if (!isOpen) return null;

  const filteredCustomers = MOCK_CUSTOMERS.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) ||
      c.clientNumber.includes(term) ||
      c.phone.includes(term)
    );
  });

  const handleSimulateFingerprint = () => {
    setIsScanningFingerprint(true);
    setTimeout(() => {
      setIsScanningFingerprint(false);
      // Auto-select top punctual client on successful biometric match
      const matched = MOCK_CUSTOMERS[0];
      onSelectCustomer(matched);
      onClose();
    }, 1400);
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newCustomer: CustomerCredit = {
      clientNumber: `${Math.floor(10000000 + Math.random() * 90000000)}`,
      fullName: newClientName,
      phone: newClientPhone || '667-555-0199',
      email: `${newClientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      address: newClientAddress || 'Av. Insurgentes #500, Culiacán',
      city: 'Culiacán, Sin.',
      creditLimit: 15000,
      availableCredit: 15000,
      currentBalance: 0,
      tier: 'Nuevo',
      onTimePaymentDiscount: 5,
      fingerprintRegistered: true,
    };

    onSelectCustomer(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#005BAB] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD000] flex items-center justify-center text-[#005BAB] font-black text-base">
              C
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Consulta de Cliente Coppel</h2>
              <p className="text-xs text-blue-200">Búsqueda por número, teléfono, nombre o huella digital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {!isCreatingNew ? (
            <>
              {/* Search input and Biometric quick trigger */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por No. Cliente (ej. 28491024), nombre o cel..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005BAB] focus:border-transparent transition-all"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSimulateFingerprint}
                  disabled={isScanningFingerprint}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#005BAB] border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] shrink-0"
                >
                  <Fingerprint className={`w-4 h-4 ${isScanningFingerprint ? 'animate-pulse text-amber-500' : ''}`} />
                  <span>{isScanningFingerprint ? 'Leyendo huella...' : 'Escanear Huella'}</span>
                </button>
              </div>

              {/* Fingerprint Scanning feedback */}
              {isScanningFingerprint && (
                <div className="bg-[#FFFBE6] border border-[#FFD000] p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFD000] flex items-center justify-center animate-bounce">
                    <Fingerprint className="w-6 h-6 text-[#005BAB]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Coloque el pulgar en el sensor de la tableta...</span>
                    <span className="text-[11px] text-slate-600">Verificando en padrón biométrico Coppel Nacional</span>
                  </div>
                </div>
              )}

              {/* Customer List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Clientes Encontrados ({filteredCustomers.length})</span>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="text-[#005BAB] font-semibold hover:underline flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Apertura de Crédito Rápida</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {filteredCustomers.map((cust) => (
                    <div
                      key={cust.clientNumber}
                      onClick={() => {
                        onSelectCustomer(cust);
                        onClose();
                      }}
                      className="p-4 bg-white hover:bg-blue-50/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-[#005BAB] font-bold flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-[#005BAB] group-hover:text-white transition-colors">
                          {cust.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 group-hover:text-[#005BAB]">
                              {cust.fullName}
                            </span>
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                              {cust.tier}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="font-mono font-medium text-slate-700">No. {cust.clientNumber}</span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {cust.phone}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {cust.city}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right pl-13 sm:pl-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Crédito Disponible</span>
                          <span className="text-sm font-extrabold text-[#005BAB] tabular-nums">
                            {formatMXN(cust.availableCredit)}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 sm:mt-0.5">
                          Pronto Pago: -{cust.onTimePaymentDiscount}%
                        </span>
                      </div>
                    </div>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No se encontró ningún cliente con ese término. Puedes iniciar una apertura express.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Fast On-Floor Customer Credit Onboarding */
            <form onSubmit={handleCreateCustomerSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-[#004889]">
                <strong>Apertura Express de Crédito Coppel en Pasillo:</strong> Registra los datos básicos con INE del cliente para otorgar línea pre-aprobada inmediata.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo (como en INE)</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ej. Laura Isabel Mendoza Vega"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#005BAB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Celular (para SMS de validación)</label>
                  <input
                    type="tel"
                    required
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="Ej. 667-123-4567"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#005BAB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Línea Inicial Pre-autorizada</label>
                  <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-[#005BAB]">
                    $15,000 MXN Express
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Calle, Número y Colonia"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#005BAB] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px]"
                >
                  Regresar a Búsqueda
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-[#004889] bg-[#FFD000] hover:bg-[#F2C400] rounded-xl shadow-xs min-h-[44px]"
                >
                  Autorizar y Activar Cliente
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Sistema de Crédito Coppel en Línea v4.2</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
