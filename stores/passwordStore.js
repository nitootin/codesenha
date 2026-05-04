import { create } from 'zustand';
import * as Clipboard from 'expo-clipboard';
import { useHistoryStore } from './historyStore';

const SENHA_INICIAL = 'Gere sua senha!';

export const usePasswordStore = create((set, get) => ({
    senha: SENHA_INICIAL,
    modalVisible: false,
    nomeAplicativo: '',

    gerarSenha: () => {
        let password = '';
        const characters = 'AaEeIiOoUu12345!@#$%';
        const passwordLength = 8;

        for (let i = 0; i < passwordLength; i++) {
            password += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        set({ senha: password });
    },

    senhaGerada: () => get().senha !== SENHA_INICIAL,
    podeSalvar: () => get().nomeAplicativo.trim() !== '' && get().senha !== SENHA_INICIAL,

    copiarSenhaGerada: async () => {
        const { senha } = get();
        if (senha && senha !== SENHA_INICIAL) {
            await Clipboard.setStringAsync(senha);
        }
    },

    abrirModal: () => {
        if (get().senha !== SENHA_INICIAL) {
            set({ modalVisible: true });
        }
    },

    fecharModal: () => set({ modalVisible: false, nomeAplicativo: '' }),
    setNomeAplicativo: (nomeAplicativo) => set({ nomeAplicativo }),

    criarSenha: async () => {
        const { nomeAplicativo, senha } = get();

        if (!nomeAplicativo || !nomeAplicativo.trim() || !senha || senha === SENHA_INICIAL) {
            return;
        }

        const novoItem = {
            id: Date.now().toString(),
            nomeAplicativo: nomeAplicativo.trim(),
            senha,
        };

        await useHistoryStore.getState().adicionarSenha(novoItem);
        set({ modalVisible: false, nomeAplicativo: '' });
    },
}));
