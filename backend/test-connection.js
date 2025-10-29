// backend/test-connection.js
// Execute: node test-connection.js

require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 Testando conexão com o banco de dados...\n');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'moneymind'
};

console.log('📋 Configuração:');
console.log('   Host:', config.host);
console.log('   User:', config.user);
console.log('   Password:', config.password ? '***' + config.password.slice(-3) : 'NÃO DEFINIDA');
console.log('   Database:', config.database);
console.log('');

async function testConnection() {
    let connection;
    
    try {
        console.log('1️⃣ Tentando conectar ao MySQL...');
        connection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password
        });
        console.log('   ✅ Conexão com MySQL estabelecida!\n');

        console.log('2️⃣ Verificando se o banco "' + config.database + '" existe...');
        const [databases] = await connection.query('SHOW DATABASES');
        const dbExists = databases.some(db => db.Database === config.database);
        
        if (dbExists) {
            console.log('   ✅ Banco de dados encontrado!\n');
        } else {
            console.log('   ❌ Banco de dados NÃO encontrado!');
            console.log('   Execute: CREATE DATABASE ' + config.database + ';\n');
            return;
        }

        console.log('3️⃣ Conectando ao banco "' + config.database + '"...');
        await connection.query('USE ' + config.database);
        console.log('   ✅ Conectado ao banco!\n');

        console.log('4️⃣ Verificando tabelas...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('   Tabelas encontradas:', tables.length);
        tables.forEach(table => {
            console.log('   - ' + Object.values(table)[0]);
        });
        console.log('');

        if (tables.length === 0) {
            console.log('   ⚠️  Nenhuma tabela encontrada!');
            console.log('   Execute o script SQL para criar as tabelas.\n');
            return;
        }

        console.log('5️⃣ Verificando categorias padrão...');
        const [categories] = await connection.query(
            'SELECT COUNT(*) as total FROM categories WHERE user_id IS NULL'
        );
        console.log('   Categorias padrão:', categories[0].total);
        
        if (categories[0].total === 0) {
            console.log('   ⚠️  Nenhuma categoria padrão encontrada!');
            console.log('   Execute o script SQL de inserção de categorias.\n');
        } else {
            console.log('   ✅ Categorias padrão OK!\n');
        }

        console.log('6️⃣ Verificando usuários...');
        const [users] = await connection.query('SELECT COUNT(*) as total FROM users');
        console.log('   Total de usuários:', users[0].total);
        console.log('');

        console.log('✅ TUDO OK! Seu banco está configurado corretamente!\n');
        console.log('Agora você pode iniciar o servidor: npm start');

    } catch (error) {
        console.error('❌ ERRO:', error.message);
        console.error('');
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('🔑 Erro de autenticação!');
            console.error('   Verifique o usuário e senha no arquivo .env');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🔌 MySQL não está rodando!');
            console.error('   Inicie o MySQL e tente novamente.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💾 Banco de dados não existe!');
            console.error('   Execute: CREATE DATABASE ' + config.database + ';');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testConnection();
