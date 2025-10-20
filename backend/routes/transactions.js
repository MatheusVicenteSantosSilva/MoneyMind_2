// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const db = require('../db'); 
const protect = require('../middleware/auth'); // Importa o middleware de segurança
const { v4: uuidv4 } = require('uuid'); // Recomendado para criar group_id único e robusto

// --------------------------------------------------------
// R - READ (GET /api/transactions)
// --------------------------------------------------------
router.get('/', protect, async (req, res) => {
    try {
        // CORREÇÃO: Usando JOIN para retornar o nome da categoria e corrigindo nomes das colunas (snake_case)
        const [rows] = await db.query(
            `SELECT t.*, c.name AS category_name 
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = ? 
             ORDER BY t.transaction_date DESC, t.created_at DESC`, 
            [req.userId] // O middleware injeta req.userId
        );
        res.json(rows);
    } catch (err) {
        console.error('Erro [GET] transações:', err);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

// --------------------------------------------------------
// C - CREATE (POST /api/transactions)
// --------------------------------------------------------
router.post('/', protect, async (req, res) => {
    // CORREÇÃO: Agora esperando category_id em vez de category (nome)
    const { type, description, amount, category_id, months } = req.body;
    
    if (!category_id) {
        return res.status(400).json({ error: 'category_id é obrigatório.' });
    }

    const isRecurring = type === 'receita_continua' || type === 'debito_automatico';
    // Se for recorrente, usa 'months'. Se não, é 1.
    const numMonths = isRecurring ? (parseInt(months, 10) || 1) : 1;
    
    // CORREÇÃO: Usando UUID para group_id
    const group_id = uuidv4(); 

    // Começa a transação no banco de dados para garantir que todas as parcelas sejam salvas
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        const newTransactions = [];

        for (let i = 0; i < numMonths; i++) {
            // Sempre começa a partir da data atual/inicial (hoje)
            const transactionDate = new Date();
            
            // Adiciona meses para as parcelas futuras
            transactionDate.setMonth(transactionDate.getMonth() + i); 
            
            // CORREÇÃO: Corrigindo nomes das colunas e removendo a coluna 'installment'
            const [result] = await connection.query(
                `INSERT INTO transactions (user_id, type, description, amount, category_id, transaction_date, group_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [req.userId, type, description, amount, category_id, transactionDate, group_id]
            );
            
            newTransactions.push({ 
                id: result.insertId, 
                user_id: req.userId, 
                type, 
                description, 
                amount: parseFloat(amount),
                transaction_date: transactionDate, 
                group_id, 
                installment: `${i + 1}/${numMonths}` // Mantém apenas no retorno para o front
            });
        }

        await connection.commit();
        connection.release(); 
        res.status(201).json({ success: true, newTransactions });

    } catch (err) {
        // Adiciona rollback em caso de erro na transação
        if (connection) await connection.rollback();
            
        console.error('Erro [POST] ao adicionar transação:', err);
        res.status(500).json({ error: 'Erro ao adicionar transação. Tente novamente.' });
    }
});


// --------------------------------------------------------
// D - DELETE (DELETE /api/transactions/:id)
// --------------------------------------------------------
router.delete('/:id', protect, async (req, res) => {
    const transactionId = req.params.id;
    const deleteGroup = req.query.group === 'true'; 

    try {
        let sql;
        let params;

        if (deleteGroup) {
            // CORREÇÃO: Usando user_id
            const [rows] = await db.query(
                'SELECT group_id FROM transactions WHERE id = ? AND user_id = ?',
                [transactionId, req.userId] 
            );

            if (rows.length === 0 || !rows[0].group_id) {
                sql = 'DELETE FROM transactions WHERE id = ? AND user_id = ?';
                params = [transactionId, req.userId];
            } else {
                sql = 'DELETE FROM transactions WHERE group_id = ? AND user_id = ?';
                params = [rows[0].group_id, req.userId];
            }
        } else {
            sql = 'DELETE FROM transactions WHERE id = ? AND user_id = ?';
            params = [transactionId, req.userId];
        }

        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou acesso negado' });
        }

        res.json({ success: true, message: 'Transação(ões) deletada(s)' });
    } catch (err) {
        console.error('Erro [DELETE] ao deletar transação:', err);
        res.status(500).json({ error: 'Erro ao deletar transação' });
    }
});

module.exports = router;