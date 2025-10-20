import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
// A URL base da sua API Node.js (ex: http://localhost:3001)
const API_BASE_URL = 'http://localhost:3001/api/auth'; 

// --------------------------------------------------------
// HOOKS E CONTEXTO
// --------------------------------------------------------

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

// Função auxiliar para obter os dados do usuário a partir do token
const fetchUserData = async (token) => {
    if (!token) return null;
    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            localStorage.removeItem('moneymind_token'); // Token inválido/expirado
            return null;
        }

        const data = await response.json();
        return data.user; // Certifique-se que o backend retorna { user: {...} }
    } catch (error) {
        console.error('Erro de rede ou ao buscar dados do usuário:', error);
        localStorage.removeItem('moneymind_token');
        return null;
    }
}


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Efeito para carregar o usuário ao iniciar (via token)
    useEffect(() => {
        const loadUserFromToken = async () => {
            const token = localStorage.getItem('moneymind_token');
            if (token) {
                const fetchedUser = await fetchUserData(token);
                // Se o token for válido, fetchedUser será o objeto do usuário
                setUser(fetchedUser); 
            }
            setLoading(false);
        };
        loadUserFromToken();
    }, []);

    // --------------------------------------------------------
    // FUNÇÕES DE AUTENTICAÇÃO (AGORA FAZEM REQUISIÇÕES HTTP)
    // --------------------------------------------------------

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso: Salvar o token e definir o usuário no estado
                const { token, user } = data; // Desestrutura token e o objeto user
                localStorage.setItem('moneymind_token', token);
                setUser(user);
                return { success: true };
            } else {
                // Erro: Credenciais inválidas (401) ou outro erro do servidor
                return { success: false, error: data.error || 'Email ou senha incorretos' };
            }
        } catch (error) {
            console.error('Erro de rede ao logar:', error);
            // Captura erros de conexão/servidor indisponível
            return { success: false, error: 'Não foi possível conectar ao servidor.' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso: Salvar o token e definir o usuário no estado
                const { token, user } = data; // Desestrutura token e o objeto user
                localStorage.setItem('moneymind_token', token);
                setUser(user);
                return { success: true };
            } else {
                // Erro: E-mail já existe (400) ou outro erro do servidor
                return { success: false, error: data.error || 'Erro ao cadastrar usuário' };
            }
        } catch (error) {
            console.error('Erro de rede ao registrar:', error);
            return { success: false, error: 'Não foi possível conectar ao servidor.' };
        }
    };

    const resetPassword = async (email, newPassword) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword }),
            });

            const data = await response.json();
            
            if (response.ok) {
                return { success: true, message: data.message || 'Senha redefinida com sucesso!' };
            } else {
                return { success: false, error: data.error || 'Não foi possível redefinir a senha.' };
            }
        } catch (error) {
            console.error('Erro de rede ao redefinir senha:', error);
            return { success: false, error: 'Erro de conexão com o servidor.' };
        }
    };

    // --------------------------------------------------------
    // FUNÇÕES AUXILIARES
    // --------------------------------------------------------

    const logout = () => {
        setUser(null);
        // Remove apenas o token (chave da sessão)
        localStorage.removeItem('moneymind_token'); 
        // Você pode querer adicionar uma chamada aqui para limpar transações também, se estiverem no estado global/cache.
    };

    const updateUser = async (userData) => {
        const token = localStorage.getItem('moneymind_token');
        if (!token || !user) {
            console.warn("Tentativa de atualizar usuário sem estar logado.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Envia o token para proteger a rota
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                // O Backend retorna 'updatedFields'. Atualiza o estado do usuário com spread.
                const updatedUser = { ...user, ...data.updatedFields }; 
                setUser(updatedUser);
                return { success: true, updatedUser };
            } else {
                console.error('Falha ao atualizar usuário:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Erro de rede ao atualizar usuário:', error);
            return { success: false, error: 'Erro de conexão com o servidor.' };
        }
    };

    const value = {
        user,
        login,
        register,
        logout,
        updateUser,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Renderiza os filhos somente após a verificação do token (para evitar flashes) */}
            {!loading && children} 
        </AuthContext.Provider>
    );
};