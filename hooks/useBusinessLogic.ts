
import { useState, useEffect } from 'react';
import { 
    Sale, SaleItem, SaleStatus, OrderType, PaymentMethod, 
    InventoryItem, KitchenProductionRule, StockLog, Expense,
    Product, TransactionType, SaleDraft
} from '../types';
import { KITCHEN_RULES } from '../constants';

// Definimos la interfaz de lo que necesita este hook para funcionar
interface DataContext {
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    stockLogs: StockLog[];
    setStockLogs: React.Dispatch<React.SetStateAction<StockLog[]>>;
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    globalCash: number;
    setGlobalCash: React.Dispatch<React.SetStateAction<number>>;
    products: Product[];
}

export const useBusinessLogic = ({
    inventory, setInventory,
    stockLogs, setStockLogs,
    sales, setSales,
    expenses, setExpenses,
    globalCash, setGlobalCash,
    products
}: DataContext) => {

    const [chickenStock, setChickenStock] = useState<number>(0);
    const [cutsStock, setCutsStock] = useState<number>(0);

    // --- Stock Logic Calculation (Fried Chicken pieces specific) ---
    useEffect(() => {
        const todayStr = new Date().toDateString();
        
        // Logs (Added Today)
        const todaysAddedPieces = stockLogs
        .filter(log => new Date(log.timestamp).toDateString() === todayStr)
        .reduce((acc, log) => acc + log.totalPieces, 0);

        // Sales Consumption (Today)
        let piecesConsumed = 0;
        let cutsConsumed = 0;
        
        sales.filter(s => new Date(s.timestamp).toDateString() === todayStr).forEach(sale => {
            sale.items.forEach(item => {
                // Lógica para detectar cortes/yapas
                const isCut = item.productName.toLowerCase().includes('corte') || 
                              item.productName.toLowerCase().includes('yapa') || 
                              item.productId === 'e_corte';
                
                if (isCut) {
                    cutsConsumed += item.quantity;
                } else {
                    piecesConsumed += (item.quantity * (item.stockCostPerUnit || 0));
                }
            });
        });

        // Conversions
        const convertedLog = expenses
            .filter(e => e.description.startsWith('INTERNAL_CONVERT') && new Date(e.timestamp).toDateString() === todayStr);
        
        let piecesConvertedToCuts = 0;
        convertedLog.forEach(e => {
            const match = e.description.match(/INTERNAL_CONVERT_(\d+)/);
            if (match) piecesConvertedToCuts += parseInt(match[1]);
        });

        const totalCutsProduced = piecesConvertedToCuts * 3;

        setChickenStock(todaysAddedPieces - piecesConsumed - piecesConvertedToCuts);
        setCutsStock(totalCutsProduced - cutsConsumed);

    }, [sales, stockLogs, expenses]);

    // --- Actions ---

    const handleKitchenProduction = (rule: KitchenProductionRule, multiplier: number, customStartTime?: string) => {
        // 1. Deduct raw ingredients
        const newInventory = [...inventory];
        rule.inputs.forEach(input => {
            const itemIdx = newInventory.findIndex(i => i.id === input.inventoryId);
            if (itemIdx >= 0) {
                newInventory[itemIdx].quantity = Math.max(0, newInventory[itemIdx].quantity - (input.quantity * multiplier));
            }
        });
  
        // 2. Add Produced Item (if it's an inventory item like Llajua)
        if (rule.outputs.inventoryId && rule.outputs.quantity) {
            const outIdx = newInventory.findIndex(i => i.id === rule.outputs.inventoryId);
            if (outIdx >= 0) {
                newInventory[outIdx].quantity += (rule.outputs.quantity * multiplier);
            }
        }
        setInventory(newInventory);
  
        // Calculate timestamps
        const start = customStartTime 
          ? new Date(new Date().toDateString() + ' ' + customStartTime) 
          : new Date();
        
        const targetTime = new Date(start.getTime() + rule.cookingTimeMinutes * 60000);
  
        // 3. Log it (Useful for timers)
        const stockOutput = rule.outputs.stockLogChicken || 0;
        const totalChickens = stockOutput * multiplier;
        
        if (stockOutput > 0 || rule.cookingTimeMinutes > 0) {
            const newLog: StockLog = { 
                id: Date.now().toString(), 
                timestamp: start.toISOString(),
                targetCompletionTime: targetTime.toISOString(),
                ruleName: rule.name,
                quantityChickens: totalChickens, 
                totalPieces: totalChickens * 8 
            };
            setStockLogs(prev => [newLog, ...prev]);
        }
    };

    const handleFinancialTransaction = (description: string, amount: number, type: TransactionType, inventoryDetails?: {id: string, qty: number}) => {
        const newExpense: Expense = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            description,
            amount,
            type
        };
        setExpenses(prev => [newExpense, ...prev]);
  
        if (type === 'EXPENSE_INVENTORY' && inventoryDetails) {
            setGlobalCash(prev => prev - amount);
            setInventory(prev => prev.map(item => {
                if (item.id === inventoryDetails.id) {
                    return { ...item, quantity: item.quantity + inventoryDetails.qty };
                }
                return item;
            }));
        } else if (type === 'EXPENSE_OPERATIONAL' || type === 'WITHDRAWAL') {
            setGlobalCash(prev => prev - amount);
        } else if (type === 'DEPOSIT') {
            setGlobalCash(prev => prev + amount);
        }
    };

    const handleConvertCut = (quantityPieces: number) => {
        handleFinancialTransaction(`INTERNAL_CONVERT_${quantityPieces}_PIECES`, 0, 'EXPENSE_OPERATIONAL');
    };

    const handleSaveSale = (
        items: SaleItem[], 
        orderType: OrderType, 
        customerName: string, 
        saleToEdit: Sale | null, 
        draftMetadata: { discount?: number, paid?: boolean, paymentMethod?: PaymentMethod | null, delivered?: boolean } | null,
        customDate?: string,
        deliveredForce: boolean = false
    ) => {
        // Auto-Cuts logic
        let requiredCuts = 0;
        items.forEach(item => {
             if (item.productName.toLowerCase().includes('corte') || item.productName.toLowerCase().includes('yapa') || item.productId === 'e_corte') {
                requiredCuts += item.quantity;
            }
        });
        if (requiredCuts > 0 && cutsStock < requiredCuts) {
            const deficit = requiredCuts - cutsStock;
            handleConvertCut(Math.ceil(deficit / 3));
        }
    
        // DEDUCT INVENTORY
        const newInventory = [...inventory];
        const isTakeaway = orderType === OrderType.TAKEAWAY;
    
        items.forEach(saleItem => {
            const product = products.find(p => p.id === saleItem.productId);
            if (!product) return;
    
            // 1. Base Recipe Deduction
            if (product.recipe) {
                 product.recipe.forEach(ing => {
                     const invIdx = newInventory.findIndex(i => i.id === ing.inventoryId);
                     if (invIdx >= 0) {
                         const deductAmount = ing.quantity * saleItem.quantity;
                         newInventory[invIdx].quantity = Math.max(0, newInventory[invIdx].quantity - deductAmount);
                     }
                 });
            }
    
            // 2. Specific Side Dish Recipe Deduction
            if (saleItem.selectedSides && product.sideOptions) {
                const selectedSide = product.sideOptions.find(s => s.name === saleItem.selectedSides);
                if (selectedSide && selectedSide.recipe) {
                    selectedSide.recipe.forEach(ing => {
                        const invIdx = newInventory.findIndex(i => i.id === ing.inventoryId);
                        if (invIdx >= 0) {
                             const deductAmount = ing.quantity * saleItem.quantity;
                             newInventory[invIdx].quantity = Math.max(0, newInventory[invIdx].quantity - deductAmount);
                        }
                    });
                }
            }
    
            // 3. Napkin Deduction (1 per unit sold)
            const napkinIdx = newInventory.findIndex(i => i.id === 'inv_servilletas');
            if (napkinIdx >= 0) {
                 newInventory[napkinIdx].quantity = Math.max(0, newInventory[napkinIdx].quantity - saleItem.quantity);
            }
    
            // 4. Plate Deduction (Only if Takeaway & product needs plate)
            if (isTakeaway && product.plateSize && product.plateSize !== 'none') {
                 const plateId = product.plateSize === 'large' ? 'inv_plato_grande' : 'inv_plato_chico';
                 const plateIdx = newInventory.findIndex(i => i.id === plateId);
                 if (plateIdx >= 0) {
                      newInventory[plateIdx].quantity = Math.max(0, newInventory[plateIdx].quantity - saleItem.quantity);
                 }
            }
        });
        setInventory(newInventory);
    
        // Save Sale
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const discount = draftMetadata?.discount || (saleToEdit ? saleToEdit.discount : 0);
        
        let newSaleObj: Sale | null = null;
    
        if (saleToEdit) {
          const updatedSale: Sale = {
            ...saleToEdit,
            timestamp: customDate || saleToEdit.timestamp,
            customerName,
            orderType,
            items, subtotal, discount,
            finalTotal: Math.max(0, subtotal - discount),
            delivered: deliveredForce
          };
          setSales(sales.map(s => s.id === updatedSale.id ? updatedSale : s));
          newSaleObj = updatedSale;
        } else {
          const newSale: Sale = {
            id: Date.now().toString(),
            timestamp: customDate || new Date().toISOString(),
            customerName,
            orderType,
            items, subtotal, discount,
            finalTotal: Math.max(0, subtotal - discount),
            status: draftMetadata?.paid ? SaleStatus.PAGADO : SaleStatus.PENDIENTE,
            paymentMethod: draftMetadata?.paymentMethod || null,
            delivered: deliveredForce || (draftMetadata?.delivered || false),
          };
          setSales([newSale, ...sales]);
          newSaleObj = newSale;
        }
    
        // Add to cash if AI says paid
        if (draftMetadata?.paid && draftMetadata.paymentMethod && !saleToEdit) {
             setGlobalCash(prev => prev + Math.max(0, subtotal - discount));
        }

        return newSaleObj;
    };

    const handleConfirmPayment = (saleId: string, method: PaymentMethod, discount: number) => {
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;
        const finalAmount = Math.max(0, sale.subtotal - discount);
    
        setSales(sales.map(s => {
          if (s.id === saleId) {
            return {
              ...s,
              status: SaleStatus.PAGADO,
              paymentMethod: method,
              discount: discount,
              finalTotal: finalAmount
            };
          }
          return s;
        }));
        setGlobalCash(prev => prev + finalAmount);
    };

    return {
        chickenStock,
        cutsStock,
        handleKitchenProduction,
        handleFinancialTransaction,
        handleConvertCut,
        handleSaveSale,
        handleConfirmPayment
    };
}
