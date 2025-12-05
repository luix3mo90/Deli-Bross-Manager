
import React, { useState } from 'react';

// Hooks
import { useDataPersistence } from './hooks/useDataPersistence';
import { useBusinessLogic } from './hooks/useBusinessLogic';
import { useAiAssistant } from './hooks/useAiAssistant';

// Feature Components (Feature Folders)
import Layout from './components/Layout';
import DashboardView from './components/Dashboard'; // Ahora apunta a index.tsx dentro de carpeta
import EconomyView from './components/Economy';     // Ahora apunta a index.tsx dentro de carpeta
import InventoryView from './components/InventoryView'; 
import AppModals from './components/AppModals';

// Types & Constants
import { SaleItem, SaleDraft, OrderType, ParsedCommand, Sale } from './types';
import { KITCHEN_RULES } from './constants';

const App: React.FC = () => {
  // --- Data & Logic Layer ---
  const data = useDataPersistence();
  const business = useBusinessLogic({
      inventory: data.inventory, setInventory: data.setInventory,
      stockLogs: data.stockLogs, setStockLogs: data.setStockLogs,
      sales: data.sales, setSales: data.setSales,
      expenses: data.expenses, setExpenses: data.setExpenses,
      globalCash: data.globalCash, setGlobalCash: data.setGlobalCash,
      products: data.products
  });
  const ai = useAiAssistant(data.sales, data.expenses, data.products);

  // --- UI State ---
  const [currentView, setCurrentView] = useState<'dashboard' | 'economy' | 'inventory'>('dashboard');
  const [economyInitialTab, setEconomyInitialTab] = useState<'OVERVIEW' | 'ORDERS' | 'CUSTOMERS' | 'EXPENSES'>('OVERVIEW');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [modals, setModals] = useState({
      newSale: false, payment: false, expense: false,
      menu: false, stock: false, command: false
  });

  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [aiSaleDraft, setAiSaleDraft] = useState<SaleDraft | null>(null);

  // --- Helpers ---
  const toggleModal = (key: keyof typeof modals, value: boolean) => setModals(prev => ({ ...prev, [key]: value }));

  const handleExecuteCommand = (command: ParsedCommand) => {
    if (command.type === 'SALE' && command.items) {
       // Command to Sale Item conversion logic
       const saleItems: SaleItem[] = [];
       command.items.forEach(cItem => {
        const product = data.products.find(p => p.id === cItem.productId);
        if (!product) return;
        const variant = product.variants?.find(v => v.id === cItem.variantId);
        saleItems.push({
          id: Date.now().toString() + Math.random(),
          productId: product.id,
          productName: product.name,
          variantName: variant?.name,
          quantity: cItem.quantity,
          unitPrice: variant ? variant.price : product.price,
          total: (variant ? variant.price : product.price) * cItem.quantity,
          stockCostPerUnit: variant?.stockCost ?? product.stockCost ?? 0
        });
      });

      if (saleItems.length > 0) {
        setSaleToEdit(null);
        setAiSaleDraft({
          items: saleItems,
          discount: command.discount,
          delivered: command.delivered,
          paid: command.paid,
          paymentMethod: command.paymentMethod
        });
        toggleModal('newSale', true);
      }
    } else if (command.type === 'EXPENSE' && command.description && command.amount) {
      business.handleFinancialTransaction(command.description, command.amount, 'EXPENSE_OPERATIONAL');
    } else if (command.type === 'ADD_STOCK' && command.quantity) {
      business.handleKitchenProduction(KITCHEN_RULES[0], command.quantity); 
    }
  };

  const handleSaleSave = (items: SaleItem[], orderType: OrderType, customerName: string, customDate?: string, delivered?: boolean) => {
    business.handleSaveSale(items, orderType, customerName, saleToEdit, aiSaleDraft, customDate, delivered);
    setAiSaleDraft(null);
    setSaleToEdit(null);
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      chickenStock={business.chickenStock}
      drafts={data.drafts}
      // Actions
      onOpenStock={() => toggleModal('stock', true)}
      onOpenMenu={() => toggleModal('menu', true)}
      onOpenExpense={() => toggleModal('expense', true)}
      onExport={data.handleExportData}
      onImport={data.handleImportData}
      onReset={data.handleResetData}
      onOpenCommand={() => toggleModal('command', true)}
      onOpenNewSale={() => { setSaleToEdit(null); setAiSaleDraft(null); toggleModal('newSale', true); }}
      onResumeDraft={(idx) => {
         const draft = data.drafts[idx];
         data.setDrafts(p => p.filter((_, i) => i !== idx));
         if (draft.originalSaleId) setSaleToEdit(data.sales.find(s => s.id === draft.originalSaleId) || null);
         setAiSaleDraft(draft);
         toggleModal('newSale', true);
      }}
    >
        {currentView === 'economy' ? (
          <EconomyView 
            sales={data.sales} 
            expenses={data.expenses} 
            products={data.products} 
            initialTab={economyInitialTab}
          />
        ) : currentView === 'inventory' ? (
          <InventoryView inventory={data.inventory} onUpdateInventory={data.setInventory} />
        ) : (
          <DashboardView 
            sales={data.sales}
            expenses={data.expenses}
            chickenStock={business.chickenStock}
            cutsStock={business.cutsStock}
            stockLogs={data.stockLogs} 
            onOpenStockControl={() => toggleModal('stock', true)}
            onOpenExpense={() => toggleModal('expense', true)}
            onEditSale={(sale) => { setSaleToEdit(sale); setAiSaleDraft(null); toggleModal('newSale', true); }}
            onToggleDelivered={(id) => data.setSales(data.sales.map(s => s.id === id ? { ...s, delivered: !s.delivered } : s))}
            onOpenPayment={(sale) => { setSelectedSaleForPayment(sale); toggleModal('payment', true); }}
            aiAnalysis={ai.analysis}
            isAnalyzing={ai.isAnalyzing}
            aiError={ai.error}
            onAnalyze={ai.generateAnalysis}
            onClearAnalysis={ai.clearAnalysis}
            onNavigateToEconomy={(tab) => { setEconomyInitialTab(tab); setCurrentView('economy'); }}
          />
        )}

        <AppModals 
          modals={modals}
          toggleModal={toggleModal}
          products={data.products}
          inventory={data.inventory}
          stockLogs={data.stockLogs}
          globalCash={data.globalCash}
          onSaveSale={handleSaleSave}
          onMinimizeDraft={(draft) => {
             data.setDrafts(prev => [...prev, draft]);
             toggleModal('newSale', false);
             setAiSaleDraft(null);
             setSaleToEdit(null);
          }}
          onConfirmPayment={business.handleConfirmPayment}
          onSaveExpense={business.handleFinancialTransaction}
          onUpdateProducts={data.setProducts}
          onKitchenProduction={business.handleKitchenProduction}
          onConvertCut={business.handleConvertCut}
          onExecuteCommand={handleExecuteCommand}
          saleToEdit={saleToEdit}
          aiSaleDraft={aiSaleDraft}
          selectedSaleForPayment={selectedSaleForPayment}
        />
    </Layout>
  );
};

export default App;
