import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext'; 

// URL base do seu Backend
const API_BASE_URL = 'http://localhost:3001/api/transactions'; 

export function useCategories() {
    const { isAuthenticated } = useAuth(); 
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função assíncrona para buscar os dados
    const fetchCategories = async () => {
        if (!isAuthenticated) {
            // Se o usuário não estiver autenticado, não faz sentido buscar
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Chamando o novo endpoint
            const response = await axios.get(`${API_BASE_URL}/categories`, {
                // Adicione headers de autorização se o seu axios não estiver configurado globalmente
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Exemplo, ajuste conforme sua implementação
                }
            });
            
            // O backend retorna a lista de categorias
            setCategories(response.data); 
            
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
            setError("Não foi possível carregar as categorias.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [isAuthenticated]); // Roda sempre que o estado de autenticação mudar (ex: login)

    return { categories, isLoading, error, refetchCategories: fetchCategories };
}
