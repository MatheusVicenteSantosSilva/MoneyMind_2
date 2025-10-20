import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/use-toast'; 

const API_BASE_URL = 'http://localhost:3001/api/transactions';

export function useTransactions() {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [balance, setBalance] = useState(0);

    // Função auxiliar para calcular o saldo (Total Receitas - Total Despesas)
    const calculateBalance = useCallback((txs) => {
        let totalRevenue = 0;
        let totalExpense = 0;

        txs.forEach(tx => {
            const amount = parseFloat(tx.amount);
            
            // Verifica o tipo de transação para calcular corretamente
            if (tx.type.includes('receita')) {
                totalRevenue += amount;
            } else if (tx.type.includes('despesa') || tx.type.includes('debito')) {
                totalExpense += amount;
            }
            // NOTA: O cálculo do saldo em aplicações grandes DEVE ser feito no Backend ou por trigger
            // para garantir a precisão, mas o Front pode fazer um cálculo auxiliar.
        });

        // Retorna o saldo, e também Receitas/Despesas totais, se quiser usar no Dashboard
        return { 
            balance: totalRevenue - totalExpense,
            totalRevenue,
            totalExpense
        };
    }, []);

    // Função de busca principal
    const fetchTransactions = useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false);
            setTransactions([]);
            setBalance(0);
            return;
        }

        setIsLoading(true);
        try {
            // A rota GET agora retorna 'category_name' do JOIN
            const response = await axios.get(API_BASE_URL, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, 
                }
            });

            const fetchedTransactions = response.data;
            setTransactions(fetchedTransactions);

            // Calcula e atualiza o saldo
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


    // Função para adicionar transação
    // NOTA CRÍTICA: Esta função AGORA DEVE RECEBER category_id e NÃO category
    const addTransaction = async (transactionData) => {
        // transactionData deve ter { type, description, amount, category_id, months }
        try {
            const response = await axios.post(API_BASE_URL, transactionData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.data.success) {
                // Se a transação for bem-sucedida, re-busca a lista completa
                // para atualizar o estado e o saldo.
                await fetchTransactions(); 
                return { success: true };
            }

        } catch (error) {
            const errorMessage = error.response?.data?.error || "Erro ao adicionar transação.";
            console.error("Erro ao adicionar transação:", errorMessage);
            return { success: false, error: errorMessage };
        }
    };


    // Função para deletar transação(ões)
    const deleteTransaction = async (id, deleteGroup = false) => {
        try {
            const endpoint = `${API_BASE_URL}/${id}${deleteGroup ? '?group=true' : ''}`;
            await axios.delete(endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            toast({
                title: "Sucesso!",
                description: deleteGroup ? "Grupo de transações deletado." : "Transação deletada.",
            });

            // Re-busca os dados
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
    }, [fetchTransactions]); // Dependência do fetchTransactions

    return { 
        transactions, 
        balance, 
        isLoading, 
        fetchTransactions, // Renomeado para 'refetchTransactions' para clareza
        addTransaction, 
        deleteTransaction,
        // É recomendável também retornar os totais (receitas/despesas) para o Dashboard
        // Se você precisar, adicione-os no retorno do calculateBalance
    };
}
