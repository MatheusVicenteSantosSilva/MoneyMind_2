// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Obtém a chave secreta das variáveis de ambiente
const secret = process.env.JWT_SECRET || 'Matheus@25'; 

const protect = (req, res, next) => {
    let token;

    // 1. Verifica se o token está no cabeçalho Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Pega o token
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifica e decodifica o token usando a chave secreta
            const decoded = jwt.verify(token, secret);
            
            // 3. Adiciona o ID do usuário (do token) ao objeto de requisição
            // Isso é o que permite saber qual usuário está fazendo a solicitação.
            req.userId = decoded.id; 
            
            next(); // Prossegue para a próxima função (a lógica da rota)

        } catch (error) {
            console.error("Erro na verificação do token:", error);
            // Token inválido, expirado ou malformado
            res.status(401).json({ 
                error: 'Não autorizado, token inválido ou expirado.',
                code: 'INVALID_TOKEN'
            });
        }
    } else {
        // Sem token no cabeçalho
        res.status(401).json({ 
            error: 'Não autorizado, token ausente.',
            code: 'TOKEN_MISSING'
        });
    }
};

module.exports = protect;