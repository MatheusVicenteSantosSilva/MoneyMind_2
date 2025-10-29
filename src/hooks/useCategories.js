// hooks/useCategories.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// URL base do seu Backend
const API_BASE_URL = 'http://localhost:3001/api/categories'; 

export function useCategories() {
  const { isAuthenticated } = useAuth(); 
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token'); // se houver autenticação
      const response = await axios.get(API_BASE_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Se a resposta for um array direto, usamos como está. Caso venha { data: [...] }, ajustar.
      setCategories(Array.isArray(response.data) ? response.data : response.data.data);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setError("Não foi possível carregar as categorias.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [isAuthenticated]);

  return {
    categories,
    isLoading,
    error,
    refetchCategories: fetchCategories,
  };
}
