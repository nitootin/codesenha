import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

function criarHeaders(token) {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

async function tratarResposta(response) {
    if (!response.ok) {
        const erro = new Error('Erro ao comunicar com o backend.');
        erro.status = response.status;
        throw erro;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function buscarHistoricoRemoto(token) {
    const response = await fetch(`${API_BASE}/historico`, {
        headers: criarHeaders(token),
    });

    return tratarResposta(response);
}

export async function criarHistoricoRemoto(token, item) {
    const response = await fetch(`${API_BASE}/historico`, {
        method: 'POST',
        headers: criarHeaders(token),
        body: JSON.stringify({
            nomeAplicativo: item.nomeAplicativo,
            senha: item.senha,
        }),
    });

    return tratarResposta(response);
}

export async function deletarHistoricoRemoto(token, id) {
    const response = await fetch(`${API_BASE}/historico/${id}`, {
        method: 'DELETE',
        headers: criarHeaders(token),
    });

    if (response.status === 404) {
        return null;
    }

    return tratarResposta(response);
}
