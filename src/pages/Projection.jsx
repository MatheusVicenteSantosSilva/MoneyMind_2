import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTransactions } from '../hooks/useTransactions';

const Projection = () => {
  const { getBalance, getRecurringTransactions } = useTransactions();
  const navigate = useNavigate();

  const currentBalance = getBalance();
  const recurringTransactions = getRecurringTransactions();

  const monthlyIncome = recurringTransactions
    .filter(t => t.type === 'receita_continua')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = recurringTransactions
    .filter(t => t.type === 'debito_automatico')
    .reduce((sum, t) => sum + t.amount, 0);

  const projectedBalance = currentBalance + monthlyIncome - monthlyExpenses;
  const netFlow = monthlyIncome - monthlyExpenses;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getNextMonth = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getStatusIcon = () => {
    if (projectedBalance >= 0) {
      return <CheckCircle className="h-8 w-8 text-green-400" />;
    } else {
      return <AlertTriangle className="h-8 w-8 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    if (projectedBalance >= 0) {
      return 'text-green-400';
    } else {
      return 'text-red-400';
    }
  };

  const getStatusMessage = () => {
    if (projectedBalance >= 0) {
      return 'Você ficará com saldo positivo no próximo mês! 🎉';
    } else {
      return 'Atenção: Você pode ficar no vermelho no próximo mês! ⚠️';
    }
  };

  return (
    <>
      <Helmet>
        <title>Projeção Financeira - MoneyMind</title>
        <meta name="description" content="Veja a projeção do seu saldo para o próximo mês baseada nas suas receitas e despesas recorrentes." />
      </Helmet>

      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold text-white">Projeção Financeira</h1>
              <p className="text-gray-300 mt-1">
                Veja como ficará seu saldo no próximo mês
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Calendar className="h-6 w-6 text-blue-400" />
                  <span>Situação Atual</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-300 mb-2">Saldo Atual</p>
                  <p className={`text-4xl font-bold ${currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(currentBalance)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                  <span>Projeção para {getNextMonth()}</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Baseado nas suas receitas e despesas recorrentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex justify-center mb-4">
                    {getStatusIcon()}
                  </div>
                  <p className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
                    {formatCurrency(projectedBalance)}
                  </p>
                  <p className="text-gray-300">{getStatusMessage()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 font-semibold mb-1">Receitas Recorrentes</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(monthlyIncome)}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {recurringTransactions.filter(t => t.type === 'receita_continua').length} transações
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 font-semibold mb-1">Débitos Automáticos</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(monthlyExpenses)}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {recurringTransactions.filter(t => t.type === 'debito_automatico').length} transações
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 font-semibold mb-1">Fluxo Líquido</p>
                    <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Por mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {recurringTransactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Transações Recorrentes</CardTitle>
                  <CardDescription className="text-gray-300">
                    Receitas e despesas que se repetem mensalmente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recurringTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.type === 'receita_continua' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <p className="font-medium text-white">{transaction.description}</p>
                            <p className="text-sm text-gray-400">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'receita_continua' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'receita_continua' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {transaction.type === 'receita_continua' ? 'Receita' : 'Débito'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectedBalance < 0 ? (
                    <>
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <h4 className="font-semibold text-red-400 mb-2">⚠️ Atenção Necessária</h4>
                        <ul className="text-gray-300 space-y-1 text-sm">
                          <li>• Revise seus débitos automáticos e veja se pode cancelar alguns</li>
                          <li>• Considere buscar receitas extras para o próximo mês</li>
                          <li>• Evite gastos desnecessários nas próximas semanas</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <h4 className="font-semibold text-green-400 mb-2">✅ Situação Positiva</h4>
                        <ul className="text-gray-300 space-y-1 text-sm">
                          <li>• Considere investir o excedente para fazer seu dinheiro render</li>
                          <li>• Mantenha uma reserva de emergência</li>
                          <li>• Continue monitorando seus gastos regularmente</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Projection;

