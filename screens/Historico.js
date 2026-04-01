import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { buscarHistorico, salvarHistorico } from "../services/storage";
import ShowIcon from '../components/icons/ShowIcon';
import CopyIcon from '../components/icons/CopyIcon';

export default function Historico({ navigation }) {
    const [historico, setHistorico] = useState([]);
    const [visiveis, setVisiveis] = useState({});

    const carregarHistorico = async () => {
        const dados = await buscarHistorico();
        setHistorico(dados);
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
                                        color={visiveis[item.id] ? "#e6b6c3" : "#eb6589"}
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
        color: "#eb6589",
        marginBottom: 28,
    },

    lista: {
        width: "60%",
        alignItems: "center",
    },

    card: {
        width: "100%",
        backgroundColor: "#fff5f8",
        borderWidth: 2,
        borderColor: "#eb6589",
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
        color: "#d94f79",
        marginBottom: 6,
    },

    senhaText: {
        fontSize: 15,
        color: "#c97b95",
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
        color: "#eb6589",
        fontWeight: "bold",
    },

    empty: {
        color: "#eb6589",
        marginTop: 10,
        fontWeight: "500",
    },

    voltarButton: {
        marginTop: 20,
        backgroundColor: "#eb6589",
        borderWidth: 2,
        borderColor: "#c10a38",
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