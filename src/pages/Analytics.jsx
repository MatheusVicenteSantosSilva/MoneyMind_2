import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTransactions } from '../hooks/useTransactions';

const Analytics = () => {
  const { getTransactionsByCategory } = useTransactions();
  const navigate = useNavigate();

  const categoryData = getTransactionsByCategory();
  
  const expenseData = categoryData
    .filter(cat => cat.expense > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.expense,
      percentage: 0
    }));

  const incomeData = categoryData
    .filter(cat => cat.income > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.income,
      percentage: 0
    }));

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
  const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);

  expenseData.forEach(item => {
    item.percentage = totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : 0;
  });

  incomeData.forEach(item => {
    item.percentage = totalIncome > 0 ? ((item.value / totalIncome) * 100).toFixed(1) : 0;
  });

  const EXPENSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];
  const INCOME_COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22', '#14532d', '#166534'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-white font-medium">{`${label}`}</p>
          <p className="text-blue-400">
            {`Valor: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Análises - MoneyMind</title>
        <meta name="description" content="Visualize análises detalhadas dos seus gastos por categoria com gráficos interativos no MoneyMind." />
      </Helmet>

      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold text-white">Análises Financeiras</h1>
              <p className="text-gray-300 mt-1">
                Visualize seus gastos e receitas por categoria
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-effect border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-red-500/20">
                      <TrendingDown className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total de Despesas</p>
                      <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                    </div>
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
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-green-500/20">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total de Receitas</p>
                      <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-effect border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-blue-500/20">
                      <BarChart3 className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Saldo Líquido</p>
                      <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(totalIncome - totalExpenses)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Despesas por Categoria</CardTitle>
                  <CardDescription className="text-gray-300">
                    Distribuição dos seus gastos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {expenseData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {expenseData.map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                              ></div>
                              <span className="text-white">{item.name}</span>
                            </div>
                            <span className="text-gray-300">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <p>Nenhuma despesa registrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Receitas por Categoria</CardTitle>
                  <CardDescription className="text-gray-300">
                    Distribuição das suas receitas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {incomeData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={incomeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {incomeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {incomeData.map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length] }}
                              ></div>
                              <span className="text-white">{item.name}</span>
                            </div>
                            <span className="text-gray-300">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <p>Nenhuma receita registrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {(expenseData.length > 0 || incomeData.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Comparação por Categoria</CardTitle>
                  <CardDescription className="text-gray-300">
                    Receitas vs Despesas por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$ ${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="income" fill="#10b981" name="Receitas" />
                      <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Analytics;

