import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/use-toast';
import jsPDF from 'jspdf';

const Reports = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const { transactions } = useTransactions();
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- Funções de Formatação ---
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    // Garante que a data seja tratada como UTC para evitar problemas de fuso horário na conversão
    const date = new Date(dateString.replace(/-/g, '/'));
    return date.toLocaleDateString('pt-BR');
  };

  // --- Lógica de Filtro e Cálculo Otimizada (useMemo) ---

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // 1. Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom.replace(/-/g, '/'));
      filtered = filtered.filter(t => new Date(t.createdAt) >= fromDate);
    }

    if (dateTo) {
      // CORREÇÃO CRÍTICA: Adiciona 1 dia (86400000ms) para incluir o dia final inteiro.
      const toDate = new Date(dateTo.replace(/-/g, '/'));
      const dateToExclusive = new Date(toDate.getTime() + 86400000); 
      filtered = filtered.filter(t => new Date(t.createdAt) < dateToExclusive);
    }

    // 2. Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // 3. Sort (mais recentes primeiro)
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions, dateFrom, dateTo, filterType]);

  const totalIncome = useMemo(() => 
    filteredTransactions
      .filter(t => t.type.includes('receita'))
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );
  
  const totalExpenses = useMemo(() => 
    filteredTransactions
      .filter(t => t.type.includes('despesa') || t.type.includes('debito'))
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const netBalance = totalIncome - totalExpenses;

  // --- Geração de PDF (Logica original, sem necessidade de recalcular totais) ---
  const generatePDF = async () => {
    setLoading(true);
    
    try {
      // Usa a lista já filtrada e calculada
      if (filteredTransactions.length === 0) {
        toast({
          title: "Nenhuma transação encontrada",
          description: "Não há transações para gerar o relatório com os filtros aplicados.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('MoneyMind - Relatório Financeiro', 20, 30);
      
      pdf.setFontSize(12);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
      
      if (dateFrom || dateTo) {
        const period = `Período: ${dateFrom ? formatDate(dateFrom) : 'Início'} até ${dateTo ? formatDate(dateTo) : 'Hoje'}`;
        pdf.text(period, 20, 55);
      }

      // Summary (Usando os valores já calculados)
      pdf.setFontSize(14);
      pdf.text('Resumo:', 20, 75);
      pdf.setFontSize(12);
      pdf.text(`Total de Receitas: ${formatCurrency(totalIncome)}`, 20, 90);
      pdf.text(`Total de Despesas: ${formatCurrency(totalExpenses)}`, 20, 105);
      pdf.text(`Saldo Líquido: ${formatCurrency(netBalance)}`, 20, 120);

      // Transactions table
      pdf.setFontSize(14);
      pdf.text('Transações:', 20, 140);
      
      let yPosition = 155;
      pdf.setFontSize(10);
      
      // Table headers
      pdf.text('Data', 20, yPosition);
      pdf.text('Descrição', 50, yPosition);
      pdf.text('Categoria', 110, yPosition);
      pdf.text('Tipo', 150, yPosition);
      pdf.text('Valor', 180, yPosition);
      
      yPosition += 10;
      
      filteredTransactions.forEach((transaction) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 30;
        }
        
        const date = formatDate(transaction.createdAt);
        const description = transaction.description.length > 20 
          ? transaction.description.substring(0, 20) + '...' 
          : transaction.description;
        const category = transaction.category.length > 15 
          ? transaction.category.substring(0, 15) + '...' 
          : transaction.category;
        
        let typeDisplay;
        switch (transaction.type) {
          case 'receita': typeDisplay = 'Receita'; break;
          case 'receita_continua': typeDisplay = 'Rec. Cont.'; break;
          case 'despesa': typeDisplay = 'Despesa'; break;
          case 'debito_automatico': typeDisplay = 'Déb. Auto'; break;
          default: typeDisplay = 'Outro';
        }
        
        const isIncome = transaction.type.includes('receita');
        const amount = (isIncome ? '+' : '-') + formatCurrency(transaction.amount);
        
        pdf.text(date, 20, yPosition);
        pdf.text(description, 50, yPosition);
        pdf.text(category, 110, yPosition);
        pdf.text(typeDisplay, 150, yPosition);
        pdf.text(amount, 180, yPosition);
        
        yPosition += 8;
      });

      // Save PDF
      const fileName = `MoneyMind_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Relatório gerado com sucesso!",
        description: `O arquivo ${fileName} foi baixado.`,
      });
      
    } catch (error) {
      console.error("PDF Generation Error:", error); // Adiciona log de erro
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o PDF. Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Relatórios - MoneyMind</title>
        <meta name="description" content="Gere relatórios completos das suas transações financeiras em PDF no MoneyMind." />
      </Helmet>

      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold text-white">Relatórios Financeiros</h1>
              <p className="text-gray-300 mt-1">
                Gere relatórios detalhados das suas transações
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
                  <span>Filtros do Relatório</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure os filtros para personalizar seu relatório
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Data Inicial</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      max={new Date().toISOString().split('T')[0]} 
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Data Final</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      min={dateFrom || ''}
                      max={new Date().toISOString().split('T')[0]} 
                      onChange={(e) => setDateTo(e.target.value)}
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
                  
                  <div className="flex items-end">
                    <Button
                      onClick={generatePDF}
                      disabled={loading || filteredTransactions.length === 0}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {loading ? "Gerando..." : "Gerar PDF"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-effect border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Total de Receitas</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Total de Despesas</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(netBalance)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FileText className="h-6 w-6 text-purple-400" />
                  <span>Transações Filtradas ({filteredTransactions.length})</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Visualize as transações que serão incluídas no relatório
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length > 0 ? (<div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
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
                          <p className="font-medium text-white">{transaction.description}</p>
                          <p className="text-sm text-gray-400">{transaction.category}</p>
                        </div>
                      </div>
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

export default Reports;