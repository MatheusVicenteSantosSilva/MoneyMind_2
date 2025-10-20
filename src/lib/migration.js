// Exemplo de código no seu Frontend (src/lib/migration.js)

import AsyncStorage from '@react-native-async-storage/async-storage'; 

const API_BASE_URL = 'http://localhost:3000'; // Endereço da sua API Node.js
const STORAGE_KEY = '@app:transacoes'; // A chave exata que você usa no seu AsyncStorage/localStorage

export const migrateData = async () => {
    try {
        const dadosString = await AsyncStorage.getItem(STORAGE_KEY);
        if (!dadosString) {
            console.log("Sem dados locais para migrar.");
            return;
        }

        const dadosAntigos = JSON.parse(dadosString);

        const response = await fetch(`${API_BASE_URL}/api/migrar-dados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAntigos),
        });

        if (response.ok) {
            console.log("Migração concluída! Limpando dados locais...");
            await AsyncStorage.removeItem(STORAGE_KEY);
            return true;
        } else {
            const errorData = await response.json();
            console.error("Falha na API durante a migração:", errorData);
            return false;
        }

    } catch (error) {
        console.error("Erro na comunicação ou JSON:", error);
        return false;
    }
};