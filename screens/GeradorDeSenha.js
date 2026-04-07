import { StatusBar } from 'expo-status-bar';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Pressable,
    Modal,
    TextInput
} from 'react-native';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { buscarHistorico, salvarHistorico, buscarToken } from '../services/storage';
import { Platform } from 'react-native';

export default function GeradorDeSenha({ navigation }) {
    const [senha, setSenha] = useState('Gere sua senha!');
    const [modalVisible, setModalVisible] = useState(false);
    const [nomeAplicativo, setNomeAplicativo] = useState('');

    const generatePassword = () => {
        let password = '';
        let characters = 'AaEeIiOoUu12345!@#$%';
        let passwordLength = 8;

        for (let i = 0; i < passwordLength; i++) {
            password += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        setSenha(password);
    };

    const copyToClipboard = () => {
        if (senha && senha !== 'Gere sua senha!') {
            Clipboard.setStringAsync(senha);
        }
    };

    const abrirModal = () => {
        if (senha !== 'Gere sua senha!') {
            setModalVisible(true);
        }
    };

    const criarSenha = async () => {
        
        if (!nomeAplicativo || !nomeAplicativo.trim() || !senha || senha === 'Gere sua senha!') return;

        const historicoAtual = await buscarHistorico();

        const novoItem = {
            id: Date.now().toString(),
            nomeAplicativo: nomeAplicativo.trim(),
            senha: senha,
        };

        const novoHistorico = [novoItem, ...historicoAtual];
        await salvarHistorico(novoHistorico);

        
        try {
            const token = await buscarToken();
            if (token) {
                const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
                const apiUrl = `${API_BASE}/historico`;

                const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ nomeAplicativo: novoItem.nomeAplicativo, senha: novoItem.senha }),
                });

                if (res.status === 401) {
                    console.log('Usuário não autenticado ao salvar histórico no backend.');
                }
            }
        } catch (e) {
            
            console.log('Erro ao salvar historico no backend:', e);
        }

        setModalVisible(false);
        setNomeAplicativo('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gerador de senha</Text>

            <Image
                source={require('../assets/icon.png')}
                style={styles.image}
            />

            <View style={styles.codeArea}>
                <Text style={styles.codeAreaText}>{senha}</Text>
            </View>

            <View style={styles.buttonsArea}>
                <Pressable style={styles.button} onPress={generatePassword}>
                    <Text style={styles.buttonText}>Gerar</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.button,
                        styles.marginTop,
                        senha === 'Gere sua senha!' && styles.buttonDisabled
                    ]}
                    onPress={abrirModal}
                    disabled={senha === 'Gere sua senha!'}
                >
                    <Text style={styles.buttonText}>Salvar</Text>
                </Pressable>

                <Pressable
                    style={[styles.button, styles.marginTop]}
                    onPress={copyToClipboard}
                >
                    <Text style={styles.buttonText}>Copiar</Text>
                </Pressable>
            </View>

            <Pressable
                style={{ marginTop: 15 }}
                onPress={() => navigation.navigate('Historico')}
            >
                <Text style={{ color: '#6FB3FF' }}>Acessar senhas</Text>
            </Pressable>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={[styles.modalTitle, { color: '#6FB3FF' }]}>Cadastro de senha</Text>
                        <Text style={[styles.label, { color: '#6FB3FF' }]}>Nome do aplicativo</Text>
                        <TextInput
                            style={styles.input}
                            value={nomeAplicativo}
                            onChangeText={setNomeAplicativo}
                            placeholder="ex: Facebook"
                        />

                        <Text style={[styles.label, { color: '#6FB3FF' }]}>Senha gerada</Text>
                        <TextInput
                            style={styles.input}
                            value={senha}
                            editable={false}
                        />

                        <Pressable
                            style={[
                                styles.modalButton,
                                (!nomeAplicativo || senha === 'Gere sua senha!') && styles.buttonDisabled
                            ]}
                            onPress={criarSenha}
                            disabled={!nomeAplicativo || senha === 'Gere sua senha!'}
                        >
                            <Text style={styles.buttonText}>Salvar</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.modalButton, styles.marginTop]}
                            onPress={() => {
                                setModalVisible(false);
                                setNomeAplicativo('');
                            }}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#6FB3FF',
        fontSize: 28,
        fontWeight: 'bold'
    },
    image: {
        width: 120,
        height: 120
    },
    codeArea: {
        backgroundColor: '#E6F7FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4A9BFF',
        width: '35%'
    },
    codeAreaText: {
        color: '#2A7BD4',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold'
    },
    buttonsArea: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10
    },
    button: {
        backgroundColor: '#6FB3FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2A6FB3',
        width: '35%'
    },
    modalButton: {
        backgroundColor: '#6FB3FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2A6FB3',
        width: '100%',
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        textAlign: 'center'
    },
    marginTop: {
        marginTop: 10
    },
    buttonDisabled: {
        opacity: 0.5
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalBox: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    label: {
        marginBottom: 5,
        fontWeight: 'bold'
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 12
    }
});