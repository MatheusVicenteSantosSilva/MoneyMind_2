// controllers/transactionController.js
const db = require('../db');

/**
 * Busca todas as transações do usuário
 */
exports.getTransactions = async (req, res) => {
    const userId = req.userId;

    try {
        const [transactions] = await db.query(
            `SELECT * 
             FROM transactions
             WHERE user_id = ?
             ORDER BY transaction_date DESC, created_at DESC`,
            [userId]
        );
        res.status(200).json(transactions);
    } catch (err) {
        console.error('Erro ao buscar transações:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar transações' });
    }
};

/**
 * Adiciona uma nova transação
 */
exports.addTransaction = async (req, res) => {
    const {
        type,
        description,
        amount,
        category_name,
        months,
        recurring_end_date,
        tags
    } = req.body;

    if (!type || !description || !amount || !category_name) {
        return res.status(400).json({ error: 'Campos obrigatórios: type, description, amount, category_name' });
    }

    const isRecurring = type === 'receita_continua' || type === 'debito_automatico';
    const numMonths = isRecurring ? (parseInt(months, 10) || 1) : 1;

    if (numMonths < 1 || numMonths > 120) {
        return res.status(400).json({ error: 'Número de meses inválido (1-120)' });
    }

    const group_id = require('uuid').v4();
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const newTransactions = [];

        for (let i = 0; i < numMonths; i++) {
            const transactionDate = new Date();
            transactionDate.setMonth(transactionDate.getMonth() + i);

            const [result] = await connection.query(
                `INSERT INTO transactions 
                    (user_id, type, description, amount, category_name, transaction_date, group_id, recurring_end_date, tags, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    req.userId,
                    type,
                    description,
                    parseFloat(amount),
                    category_name,
                    transactionDate,
                    group_id,
                    recurring_end_date || null,
                    tags || null
                ]
            );

            newTransactions.push({
                id: result.insertId,
                user_id: req.userId,
                type,
                description,
                amount: parseFloat(amount),
                category_name,
                transaction_date: transactionDate,
                group_id,
                recurring_end_date: recurring_end_date || null,
                tags: tags || null,
                installment: `${i + 1}/${numMonths}`
            });
        }

        await connection.commit();
        res.status(201).json({ success: true, newTransactions });

    } catch (err) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Erro ao adicionar transação:', err);
        res.status(500).json({ error: 'Erro ao adicionar transação' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Atualiza uma transação existente
 */
exports.updateTransaction = async (req, res) => {
    const transactionId = req.params.id;
    const { description, amount, category_name, recurring_end_date, tags } = req.body;

    try {
        const updateFields = [];
        const updateValues = [];

        if (description) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (amount) {
            updateFields.push('amount = ?');
            updateValues.push(parseFloat(amount));
        }
        if (category_name) {
            updateFields.push('category_name = ?');
            updateValues.push(category_name);
        }
        if (recurring_end_date) {
            updateFields.push('recurring_end_date = ?');
            updateValues.push(recurring_end_date);
        }
        if (tags) {
            updateFields.push('tags = ?');
            updateValues.push(tags);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }

        const sql = `UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
        updateValues.push(transactionId, req.userId);

        const [result] = await db.query(sql, updateValues);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.json({ success: true, message: 'Transação atualizada' });
    } catch (err) {
        console.error('Erro ao atualizar transação:', err);
        res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
};
