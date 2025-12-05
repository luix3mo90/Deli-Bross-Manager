import React from 'react';
import { ShoppingBag, Clock, Users, FileText } from 'lucide-react';
import { SaleStatus, Sale, Expense } from '../../types';

interface EconomyTablesProps {
  activeTab: 'OVERVIEW' | 'ORDERS' | 'CUSTOMERS' | 'EXPENSES';
  filteredSales: Sale[];
  filteredExpenses: Expense[];
  ordersByProduct: {name: string, quantity: number, total: number}[];
  ordersByCustomer: {name: string, orders: number, total: number, lastVisit: string}[];
}

const EconomyTables: React.FC<EconomyTablesProps> = ({ activeTab, filteredSales, filteredExpenses, ordersByProduct, ordersByCustomer }) => {
  
  if (activeTab === 'ORDERS') {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grouped by Product */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Productos Vendidos
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Producto</th>
                                <th className="px-4 py-3 text-center">Cant.</th>
                                <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersByProduct.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                    <td className="px-4 py-3 text-center bg-gray-50 rounded font-bold">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600">{item.total} Bs</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Chronological List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Historial de Pedidos
                </div>
                <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                    {filteredSales.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(sale => (
                        <div key={sale.id} className="p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-400">{new Date(sale.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <h4 className="font-bold text-gray-800 text-sm">{sale.customerName || 'Cliente'}</h4>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${sale.status === SaleStatus.PAGADO ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {sale.finalTotal} Bs
                                </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                                {sale.items.map((i, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span>{i.quantity}x {i.productName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (activeTab === 'CUSTOMERS') {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" /> Ranking de Clientes
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3 text-center">Visitas / Pedidos</th>
                            <th className="px-6 py-3 text-center">Última Visita</th>
                            <th className="px-6 py-3 text-right">Total Gastado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordersByCustomer.map((c, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-800">{c.name}</td>
                                <td className="px-6 py-4 text-center">{c.orders}</td>
                                <td className="px-6 py-4 text-center text-gray-500">{new Date(c.lastVisit).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right font-black text-indigo-600">{c.total} Bs</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      );
  }

  if (activeTab === 'EXPENSES') {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Detalle de Gastos
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Descripción</th>
                            <th className="px-6 py-3 text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((e, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500">{new Date(e.timestamp).toLocaleDateString()} {new Date(e.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                <td className="px-6 py-4 font-medium text-gray-800">{e.description}</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-{e.amount} Bs</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      );
  }

  return null;
};

export default EconomyTables;