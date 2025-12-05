
import React, { useRef } from 'react';
import { Menu, ChefHat, Plus, TrendingDown, Wand2, ExternalLink } from 'lucide-react';
import Sidebar from './Sidebar';
import { SaleDraft, OrderType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'economy' | 'inventory';
  onNavigate: (view: 'dashboard' | 'economy' | 'inventory') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  
  // Data for Badge
  chickenStock: number;
  drafts: SaleDraft[];

  // Actions passed down
  onOpenStock: () => void;
  onOpenMenu: () => void;
  onOpenExpense: () => void;
  onExport: () => void;
  onImport: (json: any) => boolean; // Returns success/fail
  onReset: () => void;

  // Floating Actions
  onOpenCommand: () => void;
  onOpenNewSale: () => void;
  onResumeDraft: (index: number) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentView,
  onNavigate,
  isSidebarOpen,
  setIsSidebarOpen,
  chickenStock,
  drafts,
  onOpenStock,
  onOpenMenu,
  onOpenExpense,
  onExport,
  onImport,
  onReset,
  onOpenCommand,
  onOpenNewSale,
  onResumeDraft
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
           const json = JSON.parse(content);
           console.log("Archivo leído, estructura:", Object.keys(json));
           
           if (confirm('⚠️ ¿Reemplazar TODOS los datos actuales con este archivo? Esta acción no se puede deshacer.')) {
               const success = onImport(json);
               if (success) {
                   alert('¡Datos restaurados correctamente!');
                   // Optional: reload to ensure clean state
                   // window.location.reload(); 
               } else {
                   alert('Error: El archivo JSON no tiene el formato correcto de Deli Bross.');
               }
           }
        } catch (err) {
            console.error(err);
            alert('Error al leer el archivo. Asegúrate de que es un JSON válido.');
        }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleResetConfirm = () => {
    if (confirm('⚠️ PELIGRO: Esto borrará TODAS las ventas y restaurará el inventario por defecto. La página se recargará.\n\n¿Estás seguro?')) {
        onReset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{display: 'none'}} 
        accept=".json" 
        onChange={handleFileChange} 
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenStock={onOpenStock}
        onOpenMenu={onOpenMenu}
        onOpenExpense={onOpenExpense}
        onExport={onExport}
        onImport={() => {
            console.log("Abriendo selector de archivos...");
            fileInputRef.current?.click();
        }}
        onReset={handleResetConfirm}
      />

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100 px-4 h-16 flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            {currentView === 'dashboard' && 'Tablero Principal'}
            {currentView === 'economy' && 'Economía y Reportes'}
            {currentView === 'inventory' && 'Inventario General'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
           {currentView === 'dashboard' && (
             <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100 shadow-sm animate-fadeIn">
                <ChefHat className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-700">{chickenStock} Presas</span>
             </div>
           )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating Action Buttons (FAB) */}
      {currentView === 'dashboard' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
          
          {/* Draft Bubbles */}
          <div className="absolute bottom-24 right-0 flex flex-col gap-3 items-end pointer-events-none w-64">
             {drafts.map((draft, idx) => (
                <button 
                  key={idx}
                  className="pointer-events-auto bg-white border-2 border-orange-500 shadow-xl rounded-2xl p-2.5 flex items-center gap-3 animate-bounce-in transform hover:scale-105 transition-all w-full relative group"
                  onClick={() => onResumeDraft(idx)}
                >
                  <div className="bg-orange-100 w-8 h-8 flex items-center justify-center rounded-full text-orange-600 font-bold text-xs shrink-0">
                      {draft.items.reduce((a, b) => a + b.quantity, 0)}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{draft.customerName || 'Cliente Nuevo'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{draft.items.reduce((a,b)=>a+b.total,0)} Bs • {draft.orderType === OrderType.TAKEAWAY ? 'Llevar' : 'Mesa'}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                  
                  {draft.originalSaleId && (
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm font-bold">Editando</span>
                  )}
                </button>
             ))}
          </div>

          <button
            onClick={onOpenCommand}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-indigo-400 group relative"
            title="Asistente de Voz / Texto"
          >
            <Wand2 className="w-7 h-7" />
          </button>
          
          <button
            onClick={onOpenExpense}
            className="md:hidden w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-red-400"
          >
            <TrendingDown className="w-7 h-7" />
          </button>

          <button
            onClick={onOpenNewSale}
            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-xl shadow-orange-300 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-4 border-white"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      )}

    </div>
  );
};

export default Layout;
