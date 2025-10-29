const db = require('../db');

exports.getCategories = async (req, res) => {
    const userId = req.userId;

    try {
        const [categories] = await db.query(
            `SELECT id, name, type
             FROM categories
             WHERE user_id IS NULL OR user_id = ?
             ORDER BY name ASC`,
            [userId]
        );

        res.status(200).json(categories);
    } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        res.status(500).json({ error: 'Erro interno ao carregar categorias.' });
    }
};
