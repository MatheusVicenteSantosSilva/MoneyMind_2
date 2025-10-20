import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Eye, EyeOff, DollarSign, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';

// Função para validar e retornar o status detalhado
const checkPasswordStrength = (password) => {
  const validations = {
    minLength: {
      regex: /.{6,}/, // Mínimo 6 caracteres
      message: "No mínimo 6 dígitos",
    },
    uppercase: {
      regex: /[A-Z]/, // Pelo menos 1 letra maiúscula
      message: "1 letra maiúscula",
    },
    lowercase: {
      regex: /[a-z]/, // Pelo menos 1 letra minúscula
      message: "1 letra minúscula",
    },
    number: {
      regex: /\d/, // Pelo menos 1 número
      message: "1 número",
    },
    specialChar: {
      regex: /[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|-]/, // Pelo menos 1 caractere especial
      message: "1 caractere especial",
    },
  };

  const results = {};
  let isValid = true;

  for (const key in validations) {
    const passed = validations[key].regex.test(password);
    results[key] = passed;
    if (!passed) {
      isValid = false;
    }
  }

  return { isValid, details: results, validations };
};

// Componente que renderiza os itens da lista de validação
const ValidationList = ({ details, validations }) => (
    <ul className="text-sm space-y-1 mt-2 p-2 bg-white/5 rounded-lg border border-white/10">
      {Object.keys(validations).map((key) => {
        const passed = details[key];
        const message = validations[key].message;
        const colorClass = passed ? 'text-green-400' : 'text-gray-400';
        const Icon = passed ? CheckCircle : XCircle;

        return (
          <li key={key} className={`flex items-center space-x-2 ${colorClass}`}>
            <Icon className="h-4 w-4" />
            <span>{message}</span>
          </li>
        );
      })}
    </ul>
  );

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [passwordValidations, setPasswordValidations] = useState(checkPasswordStrength('')); 

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordValidations(checkPasswordStrength(value));
    }
  };

  // A CORREÇÃO: Usar async/await com try...catch robusto para garantir que
  // a Promessa da autenticação seja resolvida e o 'loading' resete.
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Verificar senhas
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    // 2. Aplicar a validação de segurança
    const validation = checkPasswordStrength(formData.password);
    
    if (!validation.isValid) {
      toast({
        title: "Senha fraca",
        description: "A senha não atende a todos os requisitos de segurança.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // FORÇAR O AWAIT para esperar a conclusão da função de registro (promessa)
      const result = await register({ 
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Lógica para lidar com retornos de sucesso/erro que não são Promessas rejeitadas (erros lançados)
      if (result && result.success) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao MoneyMind.",
        });
        navigate('/dashboard');
      } else if (result && result.error) {
        // Erro retornado como objeto (ex: { success: false, error: '...' })
        toast({
          title: "Erro no cadastro",
          description: result.error,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      // Captura erros lançados diretamente pela função 'register' (ex: Firebase, API)
      const errorMessage = error.message || "Falha ao criar a conta. O email pode já estar em uso ou a conexão falhou.";
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // GARANTIA: O loading é sempre desativado
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastro - MoneyMind</title>
        <meta name="description" content="Crie sua conta no MoneyMind e comece a gerenciar suas finanças pessoais de forma inteligente." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold gradient-text">MoneyMind</h1>
              </motion.div>
              
              <motion.p
                className="text-xl text-gray-300 max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Junte-se a milhares de pessoas que já transformaram sua vida financeira.
              </motion.p>
            </div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-3">O que você ganha:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Controle total das suas finanças</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Relatórios detalhados em PDF</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Projeções do próximo mês</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Análises por categoria</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <img 
                className="w-full max-w-md rounded-2xl shadow-2xl animate-pulse-slow" 
                alt="Pessoa feliz gerenciando finanças"
               src="https://images.unsplash.com/photo-1625708974337-fb8fe9af5711" />
            </motion.div>
          </motion.div>


          {/* Right Side - Register Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="glass-effect border-white/20 shadow-2xl">
              <CardHeader className="space-y-1 text-center">
                <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold gradient-text">MoneyMind</h1>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <UserPlus className="h-6 w-6 text-blue-400" />
                  <CardTitle className="text-2xl font-bold text-white">Criar conta</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Preencha os dados para começar
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Nome completo</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  {/* CAMPO DE SENHA */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Crie uma senha forte"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Lista de Validação de Senha */}
                    <ValidationList 
                      details={passwordValidations.details} 
                      validations={passwordValidations.validations} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirmar senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-300">
                    Já tem uma conta?{' '}
                    <Link
                      to="/login"
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Faça login
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Register;
