import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast'; 

const API_BASE_URL = 'http://localhost:3001/api/transactions';

export function useTransactions() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // Calcula o saldo
  const calculateBalance = useCallback((txs) => {
    let totalRevenue = 0;
    let totalExpense = 0;

    txs.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (tx.type.includes('receita')) totalRevenue += amount;
      else if (tx.type.includes('despesa') || tx.type.includes('debito')) totalExpense += amount;
    });

    return { 
      balance: totalRevenue - totalExpense,
      totalRevenue,
      totalExpense
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setBalance(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const fetchedTransactions = response.data;
      setTransactions(fetchedTransactions);

      const { balance: newBalance } = calculateBalance(fetchedTransactions);
      setBalance(newBalance);

    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível carregar as transações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast, calculateBalance]);

  // Adiciona transação usando category_name, tags e recurring_end_date
  const addTransaction = async (transactionData) => {
    // transactionData deve ter:
    // { type, description, amount, category_name, tags, months, recurring_end_date }
    try {
      const response = await axios.post(API_BASE_URL, transactionData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.data.success) {
        await fetchTransactions(); 
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Erro ao adicionar transação.";
      console.error("Erro ao adicionar transação:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteTransaction = async (id, deleteGroup = false) => {
    try {
      const endpoint = `${API_BASE_URL}/${id}${deleteGroup ? '?group=true' : ''}`;
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      toast({
        title: "Sucesso!",
        description: deleteGroup ? "Grupo de transações deletado." : "Transação deletada.",
      });

      await fetchTransactions();

    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      toast({
        title: "Erro ao Deletar",
        description: "Não foi possível remover a transação.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { 
    transactions, 
    balance, 
    isLoading, 
    fetchTransactions, 
    addTransaction, 
    deleteTransaction
  };
}
