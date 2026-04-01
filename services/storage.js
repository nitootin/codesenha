import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_HISTORICO = '@historicoSenhas';
const CHAVE_TOKEN = '@token';

export async function buscarHistorico() {
    const dados = await AsyncStorage.getItem(CHAVE_HISTORICO);
    return dados ? JSON.parse(dados) : [];
}

export async function salvarHistorico(lista) {
    await AsyncStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista));
}

export async function salvarToken(token) {
    await AsyncStorage.setItem(CHAVE_TOKEN, token);
}

export async function buscarToken() {
    return await AsyncStorage.getItem(CHAVE_TOKEN);
}

export async function removerToken() {
    await AsyncStorage.removeItem(CHAVE_TOKEN);
}