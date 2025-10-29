// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando servidor...');
console.log('📊 Configurações:');
console.log('   - Porta:', PORT);
console.log('   - DB Host:', process.env.DB_HOST);
console.log('   - DB Name:', process.env.DB_NAME);
console.log('   - DB User:', process.env.DB_USER);

// Testar conexão com o banco
const db = require('./db');
db.query('SELECT 1')
    .then(() => console.log('✅ Conexão com MySQL estabelecida!'))
    .catch(err => {
        console.error('❌ Erro ao conectar no MySQL:', err.message);
        console.error('   Verifique as credenciais no arquivo .env');
    });

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`, req.body);
    next();
});

// Importar rotas
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

// Usar Rotas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota 404
app.use((req, res) => {
    console.log('⚠️  404 - Rota não encontrada:', req.path);
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('💥 Erro no servidor:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: err.message 
    });
});

app.listen(PORT, () => {
    console.log('✅ Servidor Node.js rodando na porta', PORT);
    console.log('🌐 Acesse: http://localhost:' + PORT);
    console.log('🏥 Health check: http://localhost:' + PORT + '/api/health');
});
