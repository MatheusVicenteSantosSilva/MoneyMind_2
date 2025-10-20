import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, Repeat, Loader2 } from 'lucide-react'; // Adicionado Loader2
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories'; // Importando o novo hook
import { useToast } from '../components/ui/use-toast';

const AddTransaction = () => {
  // O 'category' agora armazenará o ID da categoria selecionada
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    amount: '',
    category_id: '', // MUDANÇA: Mudamos de 'category' para 'category_id'
    months: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Renomeado para maior clareza
  const { addTransaction } = useTransactions();
  const { categories, isLoading: loadingCategories, error: categoriesError } = useCategories(); // Usando o novo hook
  const { toast } = useToast();
  const navigate = useNavigate();

  const transactionTypes = [
    { value: 'receita', label: 'Receita' },
    { value: 'receita_continua', label: 'Receita Contínua' },
    { value: 'despesa', label: 'Despesa' },
    { value: 'debito_automatico', label: 'Débito Automático' }
  ];

  // Ajuste para lidar com o category_id
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Efeito para mostrar erro caso as categorias não sejam carregadas
  useEffect(() => {
    if (categoriesError) {
        toast({
            title: "Erro ao carregar dados",
            description: categoriesError,
            variant: "destructive",
        });
    }
  }, [categoriesError, toast]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // MUDANÇA: Validando category_id
    if (!formData.type || !formData.description || !formData.amount || !formData.category_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if ((formData.type === 'receita_continua' || formData.type === 'debito_automatico') && parseInt(formData.months, 10) < 1) {
      toast({
        title: "Erro",
        description: "A quantidade de meses deve ser de no mínimo 1.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true); // Usando o novo estado

    try {
        // MUDANÇA: O hook addTransaction AGORA RECEBE category_id
        const result = await addTransaction({
            ...formData,
            // category_id já está no formData
            amount: parseFloat(formData.amount),
            months: parseInt(formData.months, 10)
        });
        
        if (result.success) {
            toast({
                title: "Transação adicionada! 🎉",
                description: "Sua transação foi registrada com sucesso.",
            });
            navigate('/dashboard');
        } else {
            toast({
                title: "Erro",
                description: result.error || "Ocorreu um erro ao adicionar a transação.",
                variant: "destructive",
            });
        }
    } catch (error) {
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível comunicar com o servidor.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Usando o novo estado
    }
  };

  const isRecurring = formData.type === 'receita_continua' || formData.type === 'debito_automatico';
  const loading = isSubmitting || loadingCategories; // Combina o loading do formulário com o loading das categorias

  return (
    <>
      <Helmet>
        <title>Adicionar Transação - MoneyMind</title>
        <meta name="description" content="Adicione receitas, despesas e débitos automáticos no MoneyMind para manter seu controle financeiro atualizado." />
      </Helmet>

      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold text-white">Adicionar Transação</h1>
              <p className="text-gray-300 mt-1">
                Registre uma nova movimentação financeira
              </p>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Plus className="h-6 w-6 text-blue-400" />
                  <span>Nova Transação</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Preencha os dados da sua transação
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Transaction Type */}
                  <div className="space-y-2">
                    <Label className="text-white">Tipo de Transação *</Label>
                    <Select 
                        value={formData.type} 
                        onValueChange={(value) => handleChange('type', value)}
                        disabled={loadingCategories}
                      >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {transactionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Months for recurring */}
                  {isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label htmlFor="months" className="text-white">Quantidade de Meses *</Label>
                      <div className="relative">
                        <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="months"
                          type="number"
                          min="1"
                          placeholder="Ex: 12"
                          value={formData.months}
                          onChange={(e) => handleChange('months', e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        A transação será criada para os próximos {formData.months || 1} meses.
                      </p>
                    </motion.div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Descrição *</Label>
                    <Input
                      id="description"
                      type="text"
                      placeholder="Ex: Salário, Aluguel, Supermercado..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">Valor *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                      />
                    </div>
                  </div>

                  {/* Category (AGORA DINÂMICA) */}
                  <div className="space-y-2">
                    <Label className="text-white">Categoria *</Label>
                    <Select 
                        value={formData.category_id} 
                        onValueChange={(value) => handleChange('category_id', value)}
                        disabled={loadingCategories}
                      >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder={loadingCategories ? "Carregando categorias..." : "Selecione a categoria"} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {loadingCategories ? (
                            <div className="p-2 flex items-center justify-center text-gray-400">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando...
                            </div>
                        ) : (
                            categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)} className="text-white hover:bg-slate-700">
                                    {category.name}
                                </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Salvar Transação"
                        )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Card (MANTIDO) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-3">Tipos de Transação:</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="text-green-400 font-medium">Receita:</span> Entrada única de dinheiro</p>
                  <p><span className="text-green-400 font-medium">Receita Contínua:</span> Entrada recorrente (ex: salário)</p>
                  <p><span className="text-red-400 font-medium">Despesa:</span> Gasto único</p>
                  <p><span className="text-red-400 font-medium">Débito Automático:</span> Gasto recorrente (ex: conta de luz)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AddTransaction;