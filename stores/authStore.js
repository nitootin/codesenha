import { create } from 'zustand';
import { API_BASE } from '../services/api';
import { buscarToken, removerToken, salvarToken } from '../services/storage';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useAuthStore = create((set, get) => ({
    carregandoInicial: true,
    autenticado: false,

    loginEmail: '',
    loginSenha: '',
    loginCarregando: false,
    erroLogin: '',

    cadastroNome: '',
    cadastroEmail: '',
    cadastroSenha: '',
    cadastroConfirmarSenha: '',
    cadastroCarregando: false,
    erroCadastro: '',

    inicializarAuth: async () => {
        try {
            const token = await buscarToken();
            set({
                autenticado: Boolean(token),
                carregandoInicial: false,
            });
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            set({
                autenticado: false,
                carregandoInicial: false,
            });
        }
    },

    logout: async () => {
        await removerToken();
        set({ autenticado: false });
    },

    setLoginEmail: (loginEmail) => set({ loginEmail, erroLogin: '' }),
    setLoginSenha: (loginSenha) => set({ loginSenha, erroLogin: '' }),
    preencherLoginEmail: (loginEmail) => set({ loginEmail }),

    loginEmailValido: () => emailRegex.test(get().loginEmail.trim()),
    podeEntrar: () => {
        const { loginEmail, loginSenha, loginCarregando } = get();
        return (
            loginEmail.trim() !== '' &&
            loginSenha.trim() !== '' &&
            emailRegex.test(loginEmail.trim()) &&
            !loginCarregando
        );
    },

    entrar: async () => {
        const { loginEmail, loginSenha } = get();

        try {
            set({ loginCarregando: true, erroLogin: '' });

            const response = await fetch(`${API_BASE}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginEmail.trim(),
                    senha: loginSenha.trim(),
                }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                console.log('Erro ao converter resposta do login:', e);
            }

            if (!response.ok) {
                console.log('ERRO LOGIN:', data);
                set({
                    erroLogin: data.erro || data.mensagem || 'E-mail ou senha invalidos.',
                });
                return false;
            }

            await salvarToken(data.token);
            set({
                autenticado: true,
                loginSenha: '',
            });
            return true;
        } catch (error) {
            console.log('ERRO FETCH SIGNIN:', error);
            set({ erroLogin: 'Erro ao conectar. Tente novamente!' });
            return false;
        } finally {
            set({ loginCarregando: false });
        }
    },

    setCadastroNome: (cadastroNome) => set({ cadastroNome, erroCadastro: '' }),
    setCadastroEmail: (cadastroEmail) => set({ cadastroEmail, erroCadastro: '' }),
    setCadastroSenha: (cadastroSenha) => set({ cadastroSenha, erroCadastro: '' }),
    setCadastroConfirmarSenha: (cadastroConfirmarSenha) => set({ cadastroConfirmarSenha, erroCadastro: '' }),

    cadastroEmailValido: () => emailRegex.test(get().cadastroEmail.trim()),
    cadastroSenhasIguais: () => get().cadastroSenha === get().cadastroConfirmarSenha,
    podeRegistrar: () => {
        const {
            cadastroNome,
            cadastroEmail,
            cadastroSenha,
            cadastroConfirmarSenha,
            cadastroCarregando,
        } = get();

        return (
            cadastroNome.trim() !== '' &&
            cadastroEmail.trim() !== '' &&
            cadastroSenha.trim() !== '' &&
            cadastroConfirmarSenha.trim() !== '' &&
            emailRegex.test(cadastroEmail.trim()) &&
            cadastroSenha === cadastroConfirmarSenha &&
            !cadastroCarregando
        );
    },

    registrar: async () => {
        const {
            cadastroNome,
            cadastroEmail,
            cadastroSenha,
            cadastroConfirmarSenha,
        } = get();

        try {
            set({ cadastroCarregando: true, erroCadastro: '' });

            const response = await fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: cadastroNome.trim(),
                    email: cadastroEmail.trim(),
                    senha: cadastroSenha.trim(),
                    confirmarSenha: cadastroConfirmarSenha.trim(),
                }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                console.log('Erro ao converter resposta do cadastro:', e);
            }

            if (!response.ok) {
                set({
                    erroCadastro: data.erro || data.mensagem || 'Nao foi possivel realizar o cadastro.',
                });
                return false;
            }

            set({
                loginEmail: cadastroEmail.trim(),
                cadastroNome: '',
                cadastroEmail: '',
                cadastroSenha: '',
                cadastroConfirmarSenha: '',
            });
            return true;
        } catch (error) {
            console.log('ERRO FETCH SIGNUP:', error);
            set({ erroCadastro: 'Erro ao conectar. Tente novamente!' });
            return false;
        } finally {
            set({ cadastroCarregando: false });
        }
    },
}));
