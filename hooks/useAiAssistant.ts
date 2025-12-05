
import { useState } from 'react';
import { analyzeBusinessDay, parseNaturalLanguageCommand } from '../services/geminiService';
import { Sale, Expense, Product, ParsedCommand } from '../types';

export const useAiAssistant = (sales: Sale[], expenses: Expense[], products: Product[]) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateAnalysis = async () => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeBusinessDay(sales, expenses);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || "Error al conectar con el asistente.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const parseCommand = async (text: string): Promise<ParsedCommand | null> => {
        try {
            return await parseNaturalLanguageCommand(text, products);
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const clearAnalysis = () => setAnalysis(null);

    return {
        analysis,
        isAnalyzing,
        error,
        generateAnalysis,
        parseCommand,
        clearAnalysis
    };
};
