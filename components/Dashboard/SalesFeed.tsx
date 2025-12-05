
import React from 'react';
import { History, TrendingDown } from 'lucide-react';
import { Sale } from '../../types';
import SaleCard from '../SaleCard';

interface SalesFeedProps {
  todaysSales: Sale[];
  onOpenExpense: () => void;
  onEditSale: (sale: Sale) => void;
  onToggleDelivered: (id: string) => void;
  onOpenPayment: (sale: Sale) => void;
}

const SalesFeed: React.FC<SalesFeedProps> = ({ todaysSales, onOpenExpense, onEditSale, onToggleDelivered, onOpenPayment }) => {
  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-16 z-20">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" /> 
                <span>Pedidos de Hoy</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{todaysSales.length}</span>
            </h2>
            <button 
                onClick={onOpenExpense}
                className="hidden md:flex px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors items-center gap-2 border border-red-100"
            >
                <TrendingDown className="w-4 h-4" /> Registrar Gasto
            </button>
        </div>

        <div className="space-y-4">
            {todaysSales.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <History className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Aún no hay ventas registradas hoy.</p>
                    <p className="text-xs text-gray-400 mt-1">Usa el botón "+" o el comando mágico.</p>
                </div>
            )}
            
            {todaysSales
                .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((sale) => (
                <SaleCard 
                    key={sale.id}
                    sale={sale}
                    onEdit={onEditSale}
                    onToggleDelivered={onToggleDelivered}
                    onOpenPayment={onOpenPayment}
                />
            ))}
        </div>
    </div>
  );
};

export default SalesFeed;
