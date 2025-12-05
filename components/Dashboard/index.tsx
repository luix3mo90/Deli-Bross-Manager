
import React from 'react';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Sale, StockLog, Expense, SaleStatus, PaymentMethod } from '../../types';

// Sub-components
import InventoryWidget from './InventoryWidget';
import KPIGrid from './KPIGrid';
import SalesFeed from './SalesFeed';

interface DashboardViewProps {
  sales: Sale[];
  expenses: Expense[];
  chickenStock: number;
  cutsStock: number;
  stockLogs?: StockLog[];
  onOpenStockControl: () => void;
  onOpenExpense: () => void;
  onEditSale: (sale: Sale) => void;
  onToggleDelivered: (id: string) => void;
  onOpenPayment: (sale: Sale) => void;
  aiAnalysis: string | null;
  isAnalyzing: boolean;
  aiError: string | null;
  onAnalyze: () => void;
  onClearAnalysis: () => void;
  onNavigateToEconomy: (tab: 'OVERVIEW' | 'ORDERS' | 'CUSTOMERS' | 'EXPENSES') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  sales, expenses, chickenStock, cutsStock, stockLogs = [],
  onOpenStockControl, onOpenExpense,
  onEditSale, onToggleDelivered, onOpenPayment,
  aiAnalysis, isAnalyzing, aiError, onAnalyze, onClearAnalysis,
  onNavigateToEconomy
}) => {
  
  const getTodayStr = () => new Date().toDateString();
  
  // Stats Calculation
  const todaysSales = sales.filter(s => new Date(s.timestamp).toDateString() === getTodayStr());
  const todaysExpenses = expenses.filter(e => new Date(e.timestamp).toDateString() === getTodayStr());

  const totalSales = todaysSales.reduce((acc, s) => s.status === SaleStatus.PAGADO ? acc + s.finalTotal : acc, 0);
  const totalCash = todaysSales.reduce((acc, s) => (s.status === SaleStatus.PAGADO && s.paymentMethod === PaymentMethod.EFECTIVO) ? acc + s.finalTotal : acc, 0);
  const totalQR = todaysSales.reduce((acc, s) => (s.status === SaleStatus.PAGADO && s.paymentMethod === PaymentMethod.QR) ? acc + s.finalTotal : acc, 0);
  const pendingAmount = todaysSales.reduce((acc, s) => s.status === SaleStatus.PENDIENTE ? acc + s.finalTotal : acc, 0);
  const totalExpenseAmount = todaysExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalSales - totalExpenseAmount;

  const chartData = [
     { name: 'Efectivo', value: totalCash, color: '#22c55e' },
     { name: 'QR', value: totalQR, color: '#3b82f6' },
     { name: 'Gastos', value: totalExpenseAmount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      
      {/* 1. Inventory & Production */}
      <InventoryWidget 
        chickenStock={chickenStock}
        cutsStock={cutsStock}
        stockLogs={stockLogs}
        onOpenStockControl={onOpenStockControl}
      />

      {/* 2. Key Performance Indicators */}
      <KPIGrid 
        totalSales={totalSales}
        pendingAmount={pendingAmount}
        totalExpenses={totalExpenseAmount}
        netProfit={netProfit}
        onNavigateToEconomy={onNavigateToEconomy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Main Feed */}
        <div className="lg:col-span-2 space-y-4">
            <SalesFeed 
                todaysSales={todaysSales}
                onOpenExpense={onOpenExpense}
                onEditSale={onEditSale}
                onToggleDelivered={onToggleDelivered}
                onOpenPayment={onOpenPayment}
            />
        </div>

        {/* 4. Sidebars: AI & Mini Charts */}
        <div className="space-y-6">
          
          {/* AI Assistant Card */}
          <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden border border-indigo-500/30">
            <div className="absolute top-0 right-0 p-3 opacity-10"><Sparkles className="w-24 h-24" /></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" /> Asistente IA</h3>
              {!aiAnalysis ? (
                <div className="space-y-4">
                  <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
                    Obtén un resumen inteligente, consejos de venta y análisis de rendimiento con un clic.
                  </p>
                  <button 
                    onClick={onAnalyze} 
                    disabled={isAnalyzing} 
                    className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Analizar Negocio'}
                  </button>
                  {aiError && <p className="text-xs text-red-300 mt-2 bg-red-900/50 p-2 rounded">{aiError}</p>}
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <div className="prose prose-sm prose-invert max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="whitespace-pre-line text-sm text-indigo-50 leading-relaxed font-light">{aiAnalysis}</div>
                  </div>
                  <button onClick={onClearAnalysis} className="mt-4 text-xs font-bold text-indigo-200 hover:text-white uppercase tracking-wider">Cerrar Análisis</button>
                </div>
              )}
            </div>
          </div>

          {/* Mini Financial Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Resumen Financiero
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}} width={60} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
