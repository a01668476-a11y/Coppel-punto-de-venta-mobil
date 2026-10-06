import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, UserCheck, Store, Printer } from 'lucide-react';

export const AssociateStatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-200">
          <Store className="w-3.5 h-3.5 text-[#FFD000]" />
          <span className="font-semibold text-white">Sucursal #104</span>
          <span className="text-slate-400">· Culiacán Centro</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Asesor: <strong className="text-slate-100">Carlos Mendoza</strong> (84920)</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Modo Piso Activo</span>
        </div>
      </div>

      <div className="flex items-center gap-3.5 text-[11px] text-slate-300 font-medium">
        <div className="hidden sm:flex items-center gap-1 text-slate-300" title="Impresora móvil de cinturón conectada">
          <Printer className="w-3 h-3 text-[#FFD000]" />
          <span>Zebra QLn220 (BT)</span>
        </div>

        <div className="flex items-center gap-1" title="Red Wi-Fi Tienda">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>Coppel-Floor-5G</span>
        </div>

        <div className="flex items-center gap-1" title="Batería de tableta">
          <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
          <span>94%</span>
        </div>

        <div className="text-slate-400 tabular-nums font-mono pl-1 border-l border-slate-700">
          {currentTime || '16:30'}
        </div>
      </div>
    </div>
  );
};
