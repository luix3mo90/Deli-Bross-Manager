
import React from 'react';
import { Wallet, QrCode, CreditCard } from 'lucide-react';

interface TreasuryStatsProps {
  cash: number;
  qr: number;
  card: number;
}

const TreasuryStats: React.FC<TreasuryStatsProps> = ({ cash, qr, card }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-20"><Wallet className="w-16 h-16"/></div>
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Caja Física (Disponible)</p>
            <h3 className="text-3xl font-black">{cash.toFixed(2)} Bs</h3>
            <p className="text-[10px] mt-2 opacity-70">* Efectivo ventas menos gastos</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-700 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-20"><QrCode className="w-16 h-16"/></div>
                <p className="text-xs font-bold uppercase opacity-80 mb-1">Acumulado QR</p>
                <h3 className="text-3xl font-black">{qr.toFixed(2)} Bs</h3>
                <p className="text-[10px] mt-2 opacity-70">* Total histórico ingresado por QR</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-fuchsia-700 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-20"><CreditCard className="w-16 h-16"/></div>
                <p className="text-xs font-bold uppercase opacity-80 mb-1">Acumulado Tarjeta</p>
                <h3 className="text-3xl font-black">{card.toFixed(2)} Bs</h3>
                <p className="text-[10px] mt-2 opacity-70">* Total histórico ingresado por Tarjeta</p>
        </div>
    </div>
  );
};

export default TreasuryStats;
