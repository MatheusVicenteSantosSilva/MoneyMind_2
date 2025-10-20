// Importe a conexão com o banco de dados
const db = require('../db'); 

// ... (Mantenha suas outras funções: addTransaction, deleteTransaction, etc.) ...

/**
 * Busca todas as categorias padrão (user_id IS NULL) e as categorias
 * personalizadas do usuário logado.
 */
exports.getCategories = async (req, res) => {
    // O userId foi injetado pelo middleware JWT
    const userId = req.userId;

    // Query para selecionar:
    // 1. Categorias Padrão (user_id IS NULL)
    // 2. Categorias Personalizadas do Usuário Logado (user_id = ?)
    const sql = `
        SELECT id, name, type
        FROM categories
        WHERE user_id IS NULL OR user_id = ?
        ORDER BY name ASC;
    `;

    try {
        // O resultado será um array de [rows, fields]
        const [categories] = await db.query(sql, [userId]);

        // Retorna as categorias em formato JSON
        res.status(200).json(categories);
    } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao carregar categorias.' });
    }
};