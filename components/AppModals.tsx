
import React from 'react';
import NewSaleModal from './NewSaleModal';
import PaymentModal from './PaymentModal';
import ExpenseModal from './ExpenseModal';
import MenuSettingsModal from './MenuSettingsModal';
import StockControlModal from './StockControlModal';
import CommandModal from './CommandModal';

import { Sale, SaleItem, OrderType, PaymentMethod, SaleDraft, ParsedCommand, Product, InventoryItem, StockLog } from '../types';
import { KitchenProductionRule } from '../types';

interface AppModalsProps {
  modals: {
    newSale: boolean;
    payment: boolean;
    expense: boolean;
    menu: boolean;
    stock: boolean;
    command: boolean;
  };
  toggleModal: (key: any, value: boolean) => void;
  
  // Data props needed for modals
  products: Product[];
  inventory: InventoryItem[];
  stockLogs: StockLog[];
  globalCash: number;
  
  // Handlers
  onSaveSale: (items: SaleItem[], orderType: OrderType, customerName: string, customDate?: string, delivered?: boolean) => void;
  onMinimizeDraft: (draft: SaleDraft) => void;
  onConfirmPayment: (saleId: string, method: PaymentMethod, discount: number) => void;
  onSaveExpense: (desc: string, amount: number, type: any, details?: any) => void;
  onUpdateProducts: (products: Product[]) => void;
  onKitchenProduction: (rule: KitchenProductionRule, multiplier: number, time?: string) => void;
  onConvertCut: (qty: number) => void;
  onExecuteCommand: (cmd: ParsedCommand) => void;

  // Temporary State for Edit/Payment
  saleToEdit: Sale | null;
  aiSaleDraft: SaleDraft | null;
  selectedSaleForPayment: Sale | null;
}

const AppModals: React.FC<AppModalsProps> = ({
  modals, toggleModal,
  products, inventory, stockLogs, globalCash,
  onSaveSale, onMinimizeDraft, onConfirmPayment, onSaveExpense, onUpdateProducts, onKitchenProduction, onConvertCut, onExecuteCommand,
  saleToEdit, aiSaleDraft, selectedSaleForPayment
}) => {
  return (
    <>
      <NewSaleModal 
        isOpen={modals.newSale} 
        onClose={() => toggleModal('newSale', false)} 
        onSave={onSaveSale}
        onMinimize={onMinimizeDraft}
        products={products}
        initialSale={saleToEdit}
        initialDraft={aiSaleDraft}
      />
      
      <PaymentModal 
        isOpen={modals.payment} 
        onClose={() => toggleModal('payment', false)} 
        sale={selectedSaleForPayment}
        onConfirm={onConfirmPayment}
      />
      
      <ExpenseModal 
        isOpen={modals.expense}
        onClose={() => toggleModal('expense', false)}
        inventory={inventory}
        totalCash={globalCash}
        onSaveExpense={onSaveExpense}
      />
      
      <MenuSettingsModal
        isOpen={modals.menu}
        onClose={() => toggleModal('menu', false)}
        products={products}
        inventory={inventory}
        onUpdateProducts={onUpdateProducts}
      />
      
      <StockControlModal
        isOpen={modals.stock}
        onClose={() => toggleModal('stock', false)}
        stockLogs={stockLogs}
        inventory={inventory}
        onKitchenProduction={onKitchenProduction}
        onConvertCut={onConvertCut}
      />
      
      <CommandModal
        isOpen={modals.command}
        onClose={() => toggleModal('command', false)}
        products={products}
        onExecute={onExecuteCommand}
      />
    </>
  );
};

export default AppModals;
