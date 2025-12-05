
import React from 'react';
import { DollarSign, ArrowRight, History, TrendingDown, Award } from 'lucide-react';

interface KPIGridProps {
  totalSales: number;
  pendingAmount: number;
  totalExpenses: number;
  netProfit: number;
  onNavigateToEconomy: (tab: 'OVERVIEW' | 'ORDERS' | 'CUSTOMERS' | 'EXPENSES') => void;
}

const KPIGrid: React.FC<KPIGridProps> = ({ totalSales, pendingAmount, totalExpenses, netProfit, onNavigateToEconomy }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sales Card */}
        <button 
          onClick={() => onNavigateToEconomy('OVERVIEW')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden group hover:border-orange-300 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-left cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 bg-orange-50 w-24 h-24 rounded-full group-hover:bg-orange-100 transition-colors"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-orange-600 uppercase mb-1 tracking-wide flex items-center gap-1">
                <DollarSign className="w-3 h-3"/>Ventas Hoy
            </p>
            <h3 className="text-3xl font-black text-gray-800 tracking-tight">{totalSales.toFixed(2)} <span className="text-sm font-normal text-gray-400">Bs</span></h3>
            <div className="mt-2 text-[10px] font-bold text-orange-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver reporte <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </button>
        
        {/* Pending Card */}
        <button 
          onClick={() => onNavigateToEconomy('ORDERS')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-red-300 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-left cursor-pointer group"
        >
          <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1 group-hover:text-red-500 transition-colors"><History className="w-3 h-3"/>Pendiente</p>
          <h3 className={`text-3xl font-black tracking-tight ${pendingAmount > 0 ? 'text-red-500' : 'text-gray-800'}`}>{pendingAmount.toFixed(2)} <span className="text-sm font-normal text-gray-400">Bs</span></h3>
          <div className="mt-2 text-[10px] font-bold text-red-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             Ver pedidos <ArrowRight className="w-3 h-3" />
          </div>
        </button>
        
        {/* Expenses Card */}
        <button 
          onClick={() => onNavigateToEconomy('EXPENSES')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-red-50 hover:border-red-300 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-left cursor-pointer group"
        >
          <p className="text-xs font-bold text-red-500 uppercase mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3"/>Gastos</p>
          <h3 className="text-3xl font-black text-gray-800 tracking-tight">{totalExpenses.toFixed(2)} <span className="text-sm font-normal text-gray-400">Bs</span></h3>
          <div className="mt-2 text-[10px] font-bold text-red-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             Ver detalle <ArrowRight className="w-3 h-3" />
          </div>
        </button>
        
        {/* Net Profit Card */}
        <button 
          onClick={() => onNavigateToEconomy('OVERVIEW')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 hover:border-green-300 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-left cursor-pointer group"
        >
          <p className="text-xs font-bold text-green-600 uppercase mb-1 flex items-center gap-1"><Award className="w-3 h-3"/>Ganancia Neta</p>
          <h3 className="text-3xl font-black text-gray-800 tracking-tight">{netProfit.toFixed(2)} <span className="text-sm font-normal text-gray-400">Bs</span></h3>
          <div className="mt-2 text-[10px] font-bold text-green-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             Ver balance <ArrowRight className="w-3 h-3" />
          </div>
        </button>
      </div>
  );
};

export default KPIGrid;
