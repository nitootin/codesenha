import { create } from 'zustand';
import * as Clipboard from 'expo-clipboard';
import { API_BASE } from '../services/api';
import { buscarHistorico, buscarToken, salvarHistorico } from '../services/storage';

export const useHistoryStore = create((set, get) => ({
    historico: [],
    visiveis: {},

    carregarHistorico: async () => {
        try {
            const token = await buscarToken();
            if (token) {
                const res = await fetch(`${API_BASE}/historico`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const dados = await res.json();
                    set({ historico: dados, visiveis: {} });
                    return;
                }
            }
        } catch (e) {
            console.log('Erro ao buscar historico do backend:', e);
        }

        const dadosLocais = await buscarHistorico();
        set({ historico: dadosLocais, visiveis: {} });
    },

    adicionarSenha: async (item) => {
        const historicoAtual = await buscarHistorico();
        const novoHistorico = [item, ...historicoAtual];

        set({ historico: novoHistorico });
        await salvarHistorico(novoHistorico);

        try {
            const token = await buscarToken();
            if (token) {
                const res = await fetch(`${API_BASE}/historico`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nomeAplicativo: item.nomeAplicativo,
                        senha: item.senha,
                    }),
                });

                if (res.status === 401) {
                    console.log('Usuario nao autenticado ao salvar historico no backend.');
                }
            }
        } catch (e) {
            console.log('Erro ao salvar historico no backend:', e);
        }
    },

    alternarVisibilidade: (id) => {
        set((state) => ({
            visiveis: {
                ...state.visiveis,
                [id]: !state.visiveis[id],
            },
        }));
    },

    copiarSenha: async (senha) => {
        await Clipboard.setStringAsync(senha);
    },

    deletarSenha: async (id) => {
        const novoHistorico = get().historico.filter((item) => item.id !== id);
        set({ historico: novoHistorico });
        await salvarHistorico(novoHistorico);

        try {
            const token = await buscarToken();
            if (token) {
                await fetch(`${API_BASE}/historico/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (e) {
            console.log('Erro ao deletar historico no backend:', e);
        }
    },
}));
