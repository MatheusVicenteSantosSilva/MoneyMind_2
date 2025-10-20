import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '../components/ui/select';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../components/ui/alert-dialog';

import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/use-toast';

const ManageTransactions = () => {
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { transactions, deleteTransaction } = useTransactions();
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDelete = (id, description, isGroup) => {
    deleteTransaction(id);
    toast({
      title: "Transação removida!",
      description: `A transação "${description}" ${isGroup ? 'e suas parcelas foram removidas' : 'foi removida'}.`,
    });
  };

  const getFilteredTransactions = () => {
    const uniqueGroupIds = new Set();
    const uniqueTransactions = [];

    transactions.forEach(t => {
      if (t.group_id && !uniqueGroupIds.has(t.group_id)) {
        uniqueGroupIds.add(t.group_id);
        uniqueTransactions.push(t);
      } else if (!t.group_id) {
        uniqueTransactions.push(t);
      }
    });

    return uniqueTransactions
      .filter(t => {
        const textMatch = t.description.toLowerCase().includes(filterText.toLowerCase()) ||
                          t.category.toLowerCase().includes(filterText.toLowerCase());
        const typeMatch = filterType === 'all' || t.type === filterType;
        return textMatch && typeMatch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <>
      <Helmet>
        <title>Gerenciar Transações - MoneyMind</title>
        <meta name="description" content="Gerencie e apague suas transações financeiras no MoneyMind." />
      </Helmet>

      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-4"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Gerenciar Transações</h1>
              <p className="text-gray-300 mt-1">
                Visualize e apague suas movimentações
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Filter className="h-6 w-6 text-blue-400" />
                  <span>Filtros</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Buscar por descrição ou categoria</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Supermercado, Salário..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Tipo de Transação</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-white hover:bg-slate-700">Todas</SelectItem>
                        <SelectItem value="receita" className="text-white hover:bg-slate-700">Receita</SelectItem>
                        <SelectItem value="receita_continua" className="text-white hover:bg-slate-700">Receita Contínua</SelectItem>
                        <SelectItem value="despesa" className="text-white hover:bg-slate-700">Despesa</SelectItem>
                        <SelectItem value="debito_automatico" className="text-white hover:bg-slate-700">Débito Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Suas Transações ({filteredTransactions.length})</CardTitle>
                <CardDescription className="text-gray-300">
                  Clique no ícone de lixeira para remover uma transação. Transações recorrentes serão removidas em grupo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {filteredTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.type.includes('receita') ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <p className="font-medium text-white">{transaction.description} {transaction.installment && <span className="text-xs text-gray-400">({transaction.installment})</span>}</p>
                            <p className="text-sm text-gray-400">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type.includes('receita') ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.type.includes('receita') ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-800 border-slate-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white flex items-center space-x-2">
                                  <AlertTriangle className="text-red-500" />
                                  <span>Confirmar Exclusão</span>
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300">
                                  Você tem certeza que deseja apagar a transação "{transaction.description}"?
                                  {transaction.installment && " Todas as parcelas relacionadas serão removidas."} Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(transaction.id, transaction.description, !!transaction.installment)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Apagar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    <p>Nenhuma transação encontrada com os filtros selecionados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ManageTransactions;

