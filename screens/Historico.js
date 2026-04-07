import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { buscarHistorico, salvarHistorico, buscarToken } from "../services/storage";
import ShowIcon from '../components/icons/ShowIcon';
import CopyIcon from '../components/icons/CopyIcon';

export default function Historico({ navigation }) {
    const [historico, setHistorico] = useState([]);
    const [visiveis, setVisiveis] = useState({});

    const carregarHistorico = async () => {
        
        try {
            const token = await buscarToken();
            if (token) {
                const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
                const res = await fetch(`${API_BASE}/historico`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const dados = await res.json();
                    setHistorico(dados);
                    setVisiveis({});
                    return;
                }
            }
        } catch (e) {
            console.log('Erro ao buscar historico do backend:', e);
        }

        const dadosLocais = await buscarHistorico();
        setHistorico(dadosLocais);
        setVisiveis({});
    };

    useFocusEffect(
        useCallback(() => {
            carregarHistorico();
        }, [])
    );

    const alternarVisibilidade = (id) => {
        setVisiveis((estadoAnterior) => ({
            ...estadoAnterior,
            [id]: !estadoAnterior[id],
        }));
    };

    const copiarSenha = async (senha) => {
        await Clipboard.setStringAsync(senha);
    };

    const deletarSenha = async (id) => {
    const novoHistorico = historico.filter((item) => item.id !== id);
    setHistorico(novoHistorico);
    await salvarHistorico(novoHistorico);
        
        try {
            const token = await buscarToken();
            if (token) {
                const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
                await fetch(`${API_BASE}/historico/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (e) {
            console.log('Erro ao deletar historico no backend:', e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de senhas</Text>

            <View style={styles.lista}>
                {historico.length === 0 ? (
                    <Text style={styles.empty}>Você não possui senhas!</Text>
                ) : (
                    historico.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <View style={styles.infoArea}>
                                <Text style={styles.appText}>{item.nomeAplicativo}</Text>
                                <Text style={styles.senhaText}>
                                    {visiveis[item.id] ? item.senha : "********"}
                                </Text>
                            </View>

                            <View style={styles.actions}>
                                <Pressable
                                    onPress={() => alternarVisibilidade(item.id)}
                                    style={styles.iconButton}
                                >
                                    <ShowIcon
                                        size={22}
                                        color={visiveis[item.id] ? "#D6EDFF" : "#6FB3FF"}
                                    />
                                </Pressable>

                                <Pressable
                                    onPress={() => copiarSenha(item.senha)}
                                    style={styles.iconButton}
                                >
                                    <CopyIcon />
                                </Pressable>

                                <Pressable
                                    onPress={() => deletarSenha(item.id)}
                                    style={styles.iconButton}
                                >
                                    <Text style={styles.icon}>✕</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))
                )}
            </View>

            <Pressable
                style={styles.voltarButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.voltarText}>Voltar</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 55,
        alignItems: "center",
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
    color: "#6FB3FF",
        marginBottom: 28,
    },

    lista: {
        width: "60%",
        alignItems: "center",
    },

    card: {
        width: "100%",
    backgroundColor: "#F0FBFF",
        borderWidth: 2,
    borderColor: "#4A9BFF",
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    infoArea: {
        flex: 1,
        justifyContent: "center",
    },

    appText: {
        fontSize: 17,
        fontWeight: "bold",
    color: "#2A7BD4",
        marginBottom: 6,
    },

    senhaText: {
        fontSize: 15,
    color: "#6FB3FF",
        fontWeight: "600",
        letterSpacing: 0.5,
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 18,
    },

    iconButton: {
        width: 34,
        height: 34,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 6,
        borderRadius: 8,
    },

    icon: {
        fontSize: 20,
    color: "#6FB3FF",
        fontWeight: "bold",
    },

    empty: {
    color: "#6FB3FF",
        marginTop: 10,
        fontWeight: "500",
    },

    voltarButton: {
        marginTop: 20,
    backgroundColor: "#6FB3FF",
        borderWidth: 2,
    borderColor: "#2A6FB3",
        paddingVertical: 12,
        borderRadius: 14,
        width: "22%",
        alignItems: "center",
    },

    voltarText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});