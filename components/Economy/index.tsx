
import React, { useState, useMemo, useEffect } from 'react';
import { Sale, Expense, SaleStatus, Product, PaymentMethod } from '../../types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Sub Components
import TreasuryStats from './TreasuryStats';
import EconomyTables from './EconomyTables';

interface EconomyViewProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  initialTab?: 'OVERVIEW' | 'ORDERS' | 'CUSTOMERS' | 'EXPENSES';
}

type TimeRange = 'DAY' | 'WEEK' | 'MONTH';
type Tab = 'OVERVIEW' | 'ORDERS' | 'CUSTOMERS' | 'EXPENSES';

const EconomyView: React.FC<EconomyViewProps> = ({ sales, expenses, products, initialTab = 'OVERVIEW' }) => {
  const [range, setRange] = useState<TimeRange>('DAY');
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Filters
  const filterDate = new Date(selectedDate);
  
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.timestamp);
      const isSameDay = d.toDateString() === filterDate.toDateString();
      
      if (range === 'DAY') return isSameDay;
      if (range === 'WEEK') {
        const diff = Math.abs(d.getTime() - filterDate.getTime());
        return diff < 7 * 24 * 60 * 60 * 1000; 
      }
      if (range === 'MONTH') {
        return d.getMonth() === filterDate.getMonth() && d.getFullYear() === filterDate.getFullYear();
      }
      return false;
    });
  }, [sales, range, selectedDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
        const d = new Date(e.timestamp);
        if (e.description.startsWith('INTERNAL')) return false;

        if (range === 'DAY') return d.toDateString() === filterDate.toDateString();
        if (range === 'WEEK') return Math.abs(d.getTime() - filterDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
        if (range === 'MONTH') return d.getMonth() === filterDate.getMonth() && d.getFullYear() === filterDate.getFullYear();
        return false;
    });
  }, [expenses, range, selectedDate]);

  // Aggregates
  const totalRevenue = filteredSales.reduce((acc, s) => s.status === SaleStatus.PAGADO ? acc + s.finalTotal : acc, 0);
  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  // --- TREASURY BREAKDOWN ---
  const treasury = useMemo(() => {
     let cash = 0;
     let qr = 0;
     let card = 0;
     let totalExpensesAllTime = 0;

     sales.forEach(s => {
         if (s.status === SaleStatus.PAGADO) {
             if (s.paymentMethod === PaymentMethod.EFECTIVO) cash += s.finalTotal;
             else if (s.paymentMethod === PaymentMethod.QR) qr += s.finalTotal;
             else if (s.paymentMethod === PaymentMethod.TARJETA) card += s.finalTotal;
         }
     });

     expenses.forEach(e => {
         if (!e.description.startsWith('INTERNAL')) {
             totalExpensesAllTime += e.amount;
         }
     });

     const physicalCashBalance = Math.max(0, cash - totalExpensesAllTime);

     return { cash: physicalCashBalance, qr, card };
  }, [sales, expenses]);

  // Grouping for Tables
  const ordersByProduct = useMemo(() => {
      const grouped: {[key: string]: {name: string, quantity: number, total: number}} = {};
      filteredSales.forEach(s => {
          if (s.status !== SaleStatus.PAGADO) return;
          s.items.forEach(i => {
              if (!grouped[i.productName]) grouped[i.productName] = { name: i.productName, quantity: 0, total: 0 };
              grouped[i.productName].quantity += i.quantity;
              grouped[i.productName].total += i.total;
          });
      });
      return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const ordersByCustomer = useMemo(() => {
      const grouped: {[key: string]: {name: string, orders: number, total: number, lastVisit: string}} = {};
      filteredSales.forEach(s => {
          if (s.status !== SaleStatus.PAGADO) return;
          const name = s.customerName || 'Cliente Casual';
          if (!grouped[name]) grouped[name] = { name, orders: 0, total: 0, lastVisit: '' };
          grouped[name].orders += 1;
          grouped[name].total += s.finalTotal;
          if (s.timestamp > grouped[name].lastVisit) grouped[name].lastVisit = s.timestamp;
      });
      return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Chart Data
  const chartData = useMemo(() => {
      return [
          { name: 'Ingresos', amount: totalRevenue, fill: '#22c55e' },
          { name: 'Gastos', amount: totalExpense, fill: '#ef4444' },
          { name: 'Neto', amount: netProfit, fill: '#3b82f6' },
      ];
  }, [totalRevenue, totalExpense, netProfit]);

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
        
        {/* Treasury Stats Top Banner */}
        {activeTab === 'OVERVIEW' && (
            <TreasuryStats cash={treasury.cash} qr={treasury.qr} card={treasury.card} />
        )}

        {/* Filter & Tabs Control */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-20 z-10">
             <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
                 {(['OVERVIEW', 'ORDERS', 'CUSTOMERS', 'EXPENSES'] as Tab[]).map(t => (
                     <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                         {t === 'OVERVIEW' ? 'Resumen' : t === 'ORDERS' ? 'Pedidos' : t === 'CUSTOMERS' ? 'Clientes' : 'Gastos'}
                     </button>
                 ))}
             </div>
             <div className="flex items-center gap-2 w-full md:w-auto">
                 <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                 />
                 <select 
                    value={range} 
                    onChange={e => setRange(e.target.value as any)}
                    className="p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                     <option value="DAY">Día</option>
                     <option value="WEEK">Semana</option>
                     <option value="MONTH">Mes</option>
                 </select>
             </div>
        </div>

        {/* Overview Tab (Specific Charts) */}
        {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600"><TrendingUp className="w-5 h-5"/></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Ingresos</h3>
                        </div>
                        <p className="text-3xl font-black text-gray-800">{totalRevenue.toFixed(2)} <span className="text-sm text-gray-400">Bs</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingDown className="w-5 h-5"/></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Gastos</h3>
                        </div>
                        <p className="text-3xl font-black text-gray-800">{totalExpense.toFixed(2)} <span className="text-sm text-gray-400">Bs</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><DollarSign className="w-5 h-5"/></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Neto</h3>
                        </div>
                        <p className={`text-3xl font-black ${netProfit >= 0 ? 'text-gray-800' : 'text-red-500'}`}>{netProfit.toFixed(2)} <span className="text-sm text-gray-400">Bs</span></p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-80">
                    <h3 className="font-bold text-gray-800 mb-4">Balance General</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="amount" barSize={30} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* Dynamic Tables for other tabs */}
        <EconomyTables 
            activeTab={activeTab}
            filteredSales={filteredSales}
            filteredExpenses={filteredExpenses}
            ordersByProduct={ordersByProduct}
            ordersByCustomer={ordersByCustomer}
        />
    </div>
  );
};

export default EconomyView;
