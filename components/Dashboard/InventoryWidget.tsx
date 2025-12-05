
import React from 'react';
import { ChefHat, AlertTriangle, Flame, Clock } from 'lucide-react';
import { StockLog } from '../../types';

interface InventoryWidgetProps {
  chickenStock: number;
  cutsStock: number;
  stockLogs: StockLog[];
  onOpenStockControl: () => void;
}

const InventoryWidget: React.FC<InventoryWidgetProps> = ({ chickenStock, cutsStock, stockLogs, onOpenStockControl }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const activeTimers = stockLogs.filter(log => {
      if (!log.targetCompletionTime) return false;
      return new Date(log.targetCompletionTime) > currentTime;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stock Alert */}
        {chickenStock <= 5 && (
            <div className="md:col-span-2 bg-red-600 text-white p-3 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
                <span className="font-bold">ALERTA CRÍTICA: QUEDAN POCOS POLLOS ({chickenStock} Presas)</span>
                <button onClick={onOpenStockControl} className="bg-white text-red-600 px-3 py-1 rounded-lg font-bold text-xs hover:bg-red-50">
                   Reponer
                </button>
            </div>
        )}

        {/* Kitchen Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-orange-500"></div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                    <ChefHat className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Control de Cocina</h3>
                    <p className="text-sm text-gray-500">Stock listo para vender</p>
                </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center group">
                    <span className={`block text-3xl font-black transition-all ${chickenStock <= 5 ? 'text-red-500 scale-110' : 'text-gray-800 group-hover:text-orange-600'}`}>
                        {chickenStock}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Presas</span>
                </div>
                <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                <div className="text-center group">
                    <span className="block text-3xl font-black text-purple-600 group-hover:scale-110 transition-transform">
                        {cutsStock}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cortes</span>
                </div>
                <button onClick={onOpenStockControl} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all active:scale-95">
                    Gestionar
                </button>
            </div>
        </div>
        
        {/* Active Timers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
             <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <Flame className={`w-5 h-5 ${activeTimers.length > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}`} /> 
                     Cocina en Curso
                 </h3>
                 <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{activeTimers.length} Activos</span>
             </div>
             
             {activeTimers.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-20 text-gray-400 text-xs">
                     <Clock className="w-6 h-6 mb-1 opacity-50" />
                     Nada cocinándose ahora
                 </div>
             ) : (
                 <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                     {activeTimers.map(log => {
                         const end = new Date(log.targetCompletionTime!);
                         const diffMs = end.getTime() - currentTime.getTime();
                         const diffMins = Math.ceil(diffMs / 60000);
                         return (
                             <div key={log.id} className="flex justify-between items-center bg-orange-50 p-2 rounded-lg border border-orange-100">
                                 <div className="flex flex-col">
                                     <span className="text-xs font-bold text-gray-700">{log.ruleName}</span>
                                     <span className="text-[10px] text-gray-500">Termina: {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 </div>
                                 <div className="text-right">
                                     <span className="block font-black text-orange-600">{diffMins} min</span>
                                 </div>
                             </div>
                         )
                     })}
                 </div>
             )}
        </div>
    </div>
  );
};

export default InventoryWidget;
