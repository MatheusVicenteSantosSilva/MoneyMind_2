// backend/server.js (AJUSTADO)
const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3001;

// Importar rotas
const authRoutes = require('./routes/auth'); // PRECISA SER CRIADA!
const transactionRoutes = require('./routes/transactions');

// ... (Restante dos imports e config de PORT)

// Middlewares
// backend/server.js
// ...
// Middlewares
app.use(cors({
    origin: 'http://localhost:5173' 
}));
app.use(express.json());
// ...

// Usar Rotas
app.use('/api/auth', authRoutes);         // Rota de autenticação
app.use('/api/transactions', transactionRoutes); // Rota de transações

app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando na porta ${PORT}`);
});
