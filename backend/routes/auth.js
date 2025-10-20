// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const protect = require('../middleware/auth'); // Importa o middleware de proteção!
require('dotenv').config();

// Obtém a chave secreta e o custo do hash do ambiente
// MELHORIA: Use process.env.JWT_SECRET ou um fallback mais longo e seguro
const secret = process.env.JWT_SECRET || 'SUA_CHAVE_SECRETA_PADRAO_MUITO_FORTE'; 
const saltRounds = 10; 

// Função auxiliar para gerar o Token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, secret, {
        expiresIn: '30d', // O token expira em 30 dias
    });
};

// --------------------------------------------------------
// ROTA 1: POST /api/auth/register (Registro de Novo Usuário)
// --------------------------------------------------------
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    // Note que o Frontend está esperando 'userData' no register, que inclui name, email, password.

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        // ... (Verificar e-mail, Hash, Inserir no MySQL) ...
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, balance) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 0.00]
        );
        const userId = result.insertId;
        const token = generateToken(userId);

        // CORREÇÃO: Retorna o objeto 'user' aninhado para o AuthContext.jsx
        res.status(201).json({
            token,
            user: { 
                id: userId,
                name,
                email,
                balance: 0.00,
            }
        });

    } catch (err) {
        console.error('Erro [POST] no registro:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao registrar.' });
    }
});

// --------------------------------------------------------
// ROTA 2: POST /api/auth/login (Login do Usuário)
// --------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // ... (Validações, Busca de usuário, Comparação de senha) ...

    if (!email || !password) {
        return res.status(400).json({ error: 'Preencha e-mail e senha.' });
    }

    try {
        const [users] = await db.query('SELECT id, name, email, password, balance FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            // Unificado para evitar "ataques de enumeração de usuário"
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = generateToken(user.id);

        // CORREÇÃO: Retorna o objeto 'user' aninhado para o AuthContext.jsx
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: parseFloat(user.balance),
            }
        });

    } catch (err) {
        console.error('Erro [POST] no login:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao tentar logar.' });
    }
});


// --------------------------------------------------------
// ROTA 3: GET /api/auth/me (Carrega dados do usuário pelo token)
// CRUCIAL PARA O useEffect DO AuthContext.jsx
// --------------------------------------------------------
router.get('/me', protect, async (req, res) => {
    try {
        // req.userId é injetado pelo middleware 'protect'
        const [users] = await db.query(
            'SELECT id, name, email, balance FROM users WHERE id = ?', 
            [req.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Retorna o objeto 'user' exatamente como o AuthContext.jsx espera em fetchUserData
        res.json({
            user: {
                id: users[0].id,
                name: users[0].name,
                email: users[0].email,
                balance: parseFloat(users[0].balance),
            }
        });

    } catch (err) {
        console.error('Erro [GET] /me:', err);
        res.status(500).json({ error: 'Erro ao carregar dados do usuário.' });
    }
});

// --------------------------------------------------------
// ROTA 4: PUT /api/auth/update-profile (Atualiza perfil e/ou senha)
// --------------------------------------------------------
router.put('/update-profile', protect, async (req, res) => {
    const { name, email, newPassword } = req.body;
    const userId = req.userId;

    try {
        const updateFields = [];
        const updateValues = [];
        const updatedFields = {};

        // Adiciona campos de atualização se estiverem presentes
        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
            updatedFields.name = name;
        }

        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
            updatedFields.email = email;
        }

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
        }

        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(userId);

        await db.query(sql, updateValues);
        
        res.json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso.', 
            updatedFields 
        });

    } catch (err) {
        console.error('Erro [PUT] update-profile:', err);
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
});

// --------------------------------------------------------
// ROTA 5: POST /api/auth/reset-password (Redefinição de senha, simples)
// --------------------------------------------------------
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email e nova senha são obrigatórios.' });
    }

    try {
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Em cenários reais, retornar sucesso para não revelar se o email existe.
            return res.json({ success: true, message: 'Se o usuário existir, a senha foi redefinida.' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        res.json({ success: true, message: 'Senha redefinida com sucesso.' });

    } catch (err) {
        console.error('Erro [POST] reset-password:', err);
        res.status(500).json({ error: 'Erro ao redefinir a senha.' });
    }
});


module.exports = router;