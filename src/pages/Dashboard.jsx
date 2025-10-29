// pages/Dashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  FileText, 
  User,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Loader2 
} from 'lucide-react'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/use-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { transactions, isLoading, balance } = useTransactions(); 
  const { toast } = useToast();
  const navigate = useNavigate();

  const recentTransactions = transactions 
    ? transactions.slice(0, 5) 
    : [];
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Até logo! Volte sempre.",
    });
    navigate('/login');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0); 
  };

  const getTransactionIcon = (type) => {
    if (type === 'receita' || type === 'receita_continua') {
      return <ArrowUpRight className="h-4 w-4 text-green-400" />;
    }
    return <ArrowDownRight className="h-4 w-4 text-red-400" />;
  };

  const getTransactionColor = (type) => {
    if (type === 'receita' || type === 'receita_continua') {
      return 'text-green-400';
    }
    return 'text-red-400';
  };

  const transactionCards = [
    {
      title: 'Adicionar Transação',
      description: 'Registre receitas, despesas e débitos automáticos',
      icon: Plus,
      path: '/add-transaction',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Análises',
      description: 'Visualize gastos por categoria em gráficos',
      icon: BarChart3,
      path: '/analytics',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Projeção',
      description: 'Veja como ficará seu saldo no próximo mês',
      icon: TrendingUp,
      path: '/projection',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Relatórios',
      description: 'Gere relatórios completos em PDF',
      icon: FileText,
      path: '/reports',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - MoneyMind</title>
        <meta
          name="description"
          content="Gerencie suas finanças pessoais no dashboard do MoneyMind. Visualize saldo, transações e acesse todas as funcionalidades."
        />
      </Helmet>

      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-white">
                Olá, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-300 mt-1">
                Bem-vindo de volta ao seu controle financeiro
              </p>
            </div>

            {/* Ajuda + Perfil */}
            <div className="flex items-center space-x-4">
              {/* Ícone de Ajuda */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                    <HelpCircle className="h-6 w-6 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
                  <DropdownMenuItem
                    className="text-white hover:bg-slate-700"
                    onClick={() => (window.location.href = 'mailto:contato.moneymind@gmail.com')}
                  >
                    <span>Entrar em contato</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Menu do Perfil */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
                  <DropdownMenuItem className="text-white hover:bg-slate-700">
                    <User className="mr-2 h-4 w-4" />
                    <span>{user?.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-slate-700 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/20 card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Wallet className="h-6 w-6 text-blue-400" />
                  <span>Saldo da Carteira</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400 inline-block" /> : formatCurrency(balance)}
                </div>
                <p className={`text-sm ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {isLoading ? 'Calculando...' : (balance >= 0 ? 'Saldo positivo' : 'Saldo negativo')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Funcionalidades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Funcionalidades</CardTitle>
                <CardDescription className="text-gray-300">
                  Clique em qualquer funcionalidade para abrir em nova página
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {transactionCards.map((card, index) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="cursor-pointer"
                      onClick={() => navigate(card.path)}
                    >
                      <Card className="glass-effect border-white/20 card-hover">
                        <CardContent className="p-6">
                          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${card.color} mb-4`}>
                            <card.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                          <p className="text-sm text-gray-300">{card.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          {(recentTransactions.length > 0 || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Transações Recentes</CardTitle>
                  <CardDescription className="text-gray-300">
                    Suas últimas movimentações financeiras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center text-gray-400 p-4 flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando transações...
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      <div className="text-center text-gray-400 p-4">Nenhuma transação registrada.</div>
                    ) : (
                      recentTransactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium text-white">{transaction.description}</p>
                              <p className="text-sm text-gray-400">
                                {transaction.category_name || 'Sem Categoria'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'receita' || transaction.type === 'receita_continua' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(transaction.transaction_date || transaction.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
