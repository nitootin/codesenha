import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
    buscarFilaOffline,
    buscarHistorico,
    buscarToken,
    salvarFilaOffline,
    salvarHistorico,
} from '../services/storage';
import {
    buscarHistoricoRemoto,
    criarHistoricoRemoto,
    deletarHistoricoRemoto,
} from '../services/api';

const OfflineContext = createContext(null);

const estadoInicial = {
    carregando: true,
    historico: [],
    filaOffline: [],
    online: true,
    sincronizando: false,
};

function offlineReducer(state, action) {
    switch (action.type) {
        case 'CARREGAR_CACHE':
            return {
                ...state,
                carregando: false,
                historico: action.historico,
                filaOffline: action.filaOffline,
            };
        case 'DEFINIR_ONLINE':
            return {
                ...state,
                online: action.online,
            };
        case 'DEFINIR_HISTORICO':
            return {
                ...state,
                historico: action.historico,
            };
        case 'DEFINIR_FILA':
            return {
                ...state,
                filaOffline: action.filaOffline,
            };
        case 'ADICIONAR_SENHA':
            return {
                ...state,
                historico: [action.item, ...state.historico],
                filaOffline: [...state.filaOffline, action.operacao],
            };
        case 'REMOVER_SENHA':
            return {
                ...state,
                historico: state.historico.filter((item) => item.id !== action.id),
                filaOffline: action.filaOffline,
            };
        case 'SINCRONIZAR_INICIO':
            return {
                ...state,
                sincronizando: true,
            };
        case 'SINCRONIZAR_FIM':
            return {
                ...state,
                sincronizando: false,
            };
        default:
            return state;
    }
}

function normalizarOnline(state) {
    return Boolean(state.isConnected && state.isInternetReachable !== false);
}

async function persistirHistoricoEFila(historico, filaOffline) {
    await Promise.all([
        salvarHistorico(historico),
        salvarFilaOffline(filaOffline),
    ]);
}

export function OfflineProvider({ children }) {
    const [state, dispatch] = useReducer(offlineReducer, estadoInicial);
    const stateRef = useRef(state);
    const sincronizandoRef = useRef(false);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        async function carregarCache() {
            const [historico, filaOffline] = await Promise.all([
                buscarHistorico(),
                buscarFilaOffline(),
            ]);

            const proximoEstado = {
                ...stateRef.current,
                carregando: false,
                historico,
                filaOffline,
            };

            stateRef.current = proximoEstado;
            dispatch({
                type: 'CARREGAR_CACHE',
                historico,
                filaOffline,
            });
        }

        carregarCache();
    }, []);

    const sincronizar = useCallback(async () => {
        const estadoAtual = stateRef.current;

        if (!estadoAtual.online || sincronizandoRef.current) {
            return;
        }

        const token = await buscarToken();
        if (!token) {
            return;
        }

        sincronizandoRef.current = true;
        dispatch({ type: 'SINCRONIZAR_INICIO' });

        try {
            const filaRestante = [];

            for (const operacao of estadoAtual.filaOffline) {
                try {
                    if (operacao.tipo === 'criar') {
                        await criarHistoricoRemoto(token, operacao.item);
                    }

                    if (operacao.tipo === 'deletar') {
                        await deletarHistoricoRemoto(token, operacao.id);
                    }
                } catch (error) {
                    filaRestante.push(operacao);
                }
            }

            if (filaRestante.length > 0) {
                stateRef.current = { ...stateRef.current, filaOffline: filaRestante };
                dispatch({ type: 'DEFINIR_FILA', filaOffline: filaRestante });
                await salvarFilaOffline(filaRestante);
                return;
            }

            const historicoRemoto = await buscarHistoricoRemoto(token);
            stateRef.current = {
                ...stateRef.current,
                historico: historicoRemoto,
                filaOffline: [],
            };
            dispatch({ type: 'DEFINIR_HISTORICO', historico: historicoRemoto });
            dispatch({ type: 'DEFINIR_FILA', filaOffline: [] });
            await persistirHistoricoEFila(historicoRemoto, []);
        } catch (error) {
            console.log('Erro ao sincronizar dados offline:', error);
        } finally {
            sincronizandoRef.current = false;
            dispatch({ type: 'SINCRONIZAR_FIM' });
        }
    }, []);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((netState) => {
            const online = normalizarOnline(netState);
            stateRef.current = { ...stateRef.current, online };
            dispatch({ type: 'DEFINIR_ONLINE', online });

            if (online) {
                sincronizar();
            }
        });

        return unsubscribe;
    }, [sincronizar]);

    useEffect(() => {
        if (!state.carregando && state.online) {
            sincronizar();
        }
    }, [state.carregando, state.online, sincronizar]);

    const carregarHistorico = useCallback(async () => {
        const historicoLocal = await buscarHistorico();
        dispatch({ type: 'DEFINIR_HISTORICO', historico: historicoLocal });

        if (stateRef.current.online) {
            await sincronizar();
        }
    }, [sincronizar]);

    const adicionarSenha = useCallback(async ({ nomeAplicativo, senha }) => {
        const item = {
            id: Date.now().toString(),
            nomeAplicativo: nomeAplicativo.trim(),
            senha,
        };

        const operacao = {
            id: item.id,
            tipo: 'criar',
            item,
        };

        const historico = [item, ...stateRef.current.historico];
        const filaOffline = [...stateRef.current.filaOffline, operacao];

        stateRef.current = { ...stateRef.current, historico, filaOffline };
        dispatch({ type: 'ADICIONAR_SENHA', item, operacao });
        await persistirHistoricoEFila(historico, filaOffline);

        if (stateRef.current.online) {
            await sincronizar();
        }
    }, [sincronizar]);

    const deletarSenha = useCallback(async (id) => {
        const historico = stateRef.current.historico.filter((item) => item.id !== id);
        const itemAindaNaoSincronizado = stateRef.current.filaOffline.some(
            (operacao) => operacao.tipo === 'criar' && operacao.id === id
        );

        const filaSemCriacaoPendente = stateRef.current.filaOffline.filter(
            (operacao) => !(operacao.tipo === 'criar' && operacao.id === id)
        );

        const filaOffline = itemAindaNaoSincronizado
            ? filaSemCriacaoPendente
            : [...filaSemCriacaoPendente, { id, tipo: 'deletar' }];

        stateRef.current = { ...stateRef.current, historico, filaOffline };
        dispatch({ type: 'REMOVER_SENHA', id, filaOffline });
        await persistirHistoricoEFila(historico, filaOffline);

        if (stateRef.current.online) {
            await sincronizar();
        }
    }, [sincronizar]);

    const value = {
        ...state,
        adicionarSenha,
        carregarHistorico,
        deletarSenha,
        sincronizar,
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
}

export function useOffline() {
    const context = useContext(OfflineContext);

    if (!context) {
        throw new Error('useOffline deve ser usado dentro de OfflineProvider.');
    }

    return context;
}
