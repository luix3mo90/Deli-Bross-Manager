
import { useState, useEffect, useRef } from 'react';
import { Sale, Expense, Product, InventoryItem, StockLog, SaleDraft } from '../types';
import { INITIAL_SALES, INITIAL_GLOBAL_CASH, DEFAULT_MENU, DEFAULT_INVENTORY } from '../constants';

// Helper para cargar de localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    // Si no existe, usamos fallback
    if (item === null) return fallback;
    // Si existe, parseamos.
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error loading key ${key} from storage`, e);
    return fallback;
  }
};

export const useDataPersistence = () => {
  // Flag para bloquear el guardado automático cuando estamos reseteando
  const isResetting = useRef(false);

  // --- Data State ---
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage('deli_sales', INITIAL_SALES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('deli_expenses', []));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('deli_products', DEFAULT_MENU));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadFromStorage('deli_inventory', DEFAULT_INVENTORY));
  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => loadFromStorage('deli_stock_logs', []));
  const [globalCash, setGlobalCash] = useState<number>(() => loadFromStorage('deli_global_cash', INITIAL_GLOBAL_CASH));
  const [drafts, setDrafts] = useState<SaleDraft[]>(() => loadFromStorage('deli_drafts', []));

  // --- Persistence Effects (Guarded) ---
  // Solo guardamos si NO estamos en proceso de reseteo
  useEffect(() => { if (!isResetting.current) localStorage.setItem('deli_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { if (!isResetting.current) localStorage.setItem('deli_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { if (!isResetting.current) localStorage.setItem('deli_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { if (!isResetting.current) localStorage.setItem('deli_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { if (!isResetting.current) localStorage.setItem('deli_stock_logs', JSON.stringify(stockLogs)); }, [stockLogs]);
  useEffect(() => { if (!isResetting.current) localStorage.setItem('deli_global_cash', JSON.stringify(globalCash)); }, [globalCash]);
  useEffect(() => { if (!isResetting.current) localStorage.setItem('deli_drafts', JSON.stringify(drafts)); }, [drafts]);

  // --- Actions ---

  const handleExportData = () => {
    const data = {
      sales,
      expenses,
      products,
      inventory,
      stockLogs,
      globalCash,
      drafts,
      version: "1.0",
      exportDate: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = `deli_bross_BACKUP_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (json: any) => {
      try {
        console.log("Intentando importar:", json);
        // Validar estructura básica
        if (!Array.isArray(json.sales) || !Array.isArray(json.products)) {
            console.error("JSON inválido: faltan arrays requeridos");
            alert("El archivo no parece ser un respaldo válido de Deli Bross (faltan ventas o productos).");
            return false;
        }

        // 1. Guardar en Storage INMEDIATAMENTE
        localStorage.setItem('deli_sales', JSON.stringify(json.sales));
        localStorage.setItem('deli_expenses', JSON.stringify(json.expenses || []));
        localStorage.setItem('deli_products', JSON.stringify(json.products));
        localStorage.setItem('deli_inventory', JSON.stringify(json.inventory || []));
        localStorage.setItem('deli_stock_logs', JSON.stringify(json.stockLogs || []));
        localStorage.setItem('deli_global_cash', JSON.stringify(json.globalCash ?? 0));
        localStorage.setItem('deli_drafts', JSON.stringify(json.drafts ?? []));

        // 2. Actualizar Estado (React re-renderizará)
        setSales(json.sales);
        setExpenses(json.expenses || []);
        setProducts(json.products);
        setInventory(json.inventory || []);
        setStockLogs(json.stockLogs || []);
        setGlobalCash(json.globalCash ?? 0);
        setDrafts(json.drafts ?? []);

        return true;
      } catch (err) {
        console.error("Error importando datos:", err);
        return false;
      }
  };

  const handleResetData = () => {
      // 1. Activar bloqueo para que los useEffect no sobrescriban nada
      isResetting.current = true;

      // 2. Escribir directamente valores vacíos/default en localStorage
      // Usamos arrays vacíos explícitos
      localStorage.setItem('deli_sales', JSON.stringify([]));
      localStorage.setItem('deli_expenses', JSON.stringify([]));
      localStorage.setItem('deli_stock_logs', JSON.stringify([]));
      localStorage.setItem('deli_drafts', JSON.stringify([]));
      
      // Restauramos inventario y menú a sus valores por defecto de fábrica
      localStorage.setItem('deli_products', JSON.stringify(DEFAULT_MENU));
      localStorage.setItem('deli_inventory', JSON.stringify(DEFAULT_INVENTORY));
      localStorage.setItem('deli_global_cash', JSON.stringify(INITIAL_GLOBAL_CASH));
      
      // 3. Forzar actualización visual antes del reload para feedback inmediato (opcional)
      setSales([]);
      setExpenses([]);

      // 4. Recargar con un pequeño delay para asegurar persistencia
      setTimeout(() => {
          window.location.reload();
      }, 100);

      return true;
  };

  return {
    sales, setSales,
    expenses, setExpenses,
    products, setProducts,
    inventory, setInventory,
    stockLogs, setStockLogs,
    globalCash, setGlobalCash,
    drafts, setDrafts,
    handleExportData,
    handleImportData,
    handleResetData
  };
};
