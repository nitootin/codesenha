import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, Pressable, Modal, TextInput, Platform } from 'react-native';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { buscarHistorico, salvarHistorico, buscarToken } from '../services/storage';

export default function GeradorDeSenha({ navigation }) {
    const [senha, setSenha] = useState('Gere sua senha!');
    const [modalVisible, setModalVisible] = useState(false);
    const [nomeAplicativo, setNomeAplicativo] = useState('');

    const generatePassword = () => {
        let password = '';
        const characters = 'AaEeIiOoUu12345!@#$%';
        const passwordLength = 8;

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
            senha,
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
            console.log('Erro ao salvar histórico no backend:', e);
        }

        setModalVisible(false);
        setNomeAplicativo('');
    };

    const senhaGerada = senha !== 'Gere sua senha!';
    const podeSalvar = nomeAplicativo.trim() !== '' && senhaGerada;

    return (
        <View className="flex-1 items-center justify-center bg-white px-6">
            <Text className="text-[28px] font-bold text-[#6FB3FF]">Gerador de senha</Text>

            <Image
                source={require('../assets/icon.png')}
                style={{ width: 96, height: 96 }}
                resizeMode="contain"
            />

            <View className="w-full max-w-md rounded-xl border-2 border-[#4A9BFF] bg-[#E6F7FF] px-5 py-2.5">
                <Text className="text-center text-sm font-bold text-[#2A7BD4]">{senha}</Text>
            </View>

            <View className="mt-2.5 w-full items-center">
                <Pressable className="w-full max-w-md rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] px-5 py-2.5" onPress={generatePassword}>
                    <Text className="text-center text-white">Gerar</Text>
                </Pressable>

                <Pressable
                    className={`mt-2.5 w-full max-w-md rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] px-5 py-2.5 ${!senhaGerada ? 'opacity-50' : ''}`}
                    onPress={abrirModal}
                    disabled={!senhaGerada}
                >
                    <Text className="text-center text-white">Salvar</Text>
                </Pressable>

                <Pressable
                    className="mt-2.5 w-full max-w-md rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] px-5 py-2.5"
                    onPress={copyToClipboard}
                >
                    <Text className="text-center text-white">Copiar</Text>
                </Pressable>
            </View>

            <Pressable
                className="mt-[15px]"
                onPress={() => navigation.navigate('Historico')}
            >
                <Text className="text-[#6FB3FF]">Acessar senhas</Text>
            </Pressable>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
            >
                <View className="flex-1 items-center justify-center bg-black/40 px-6">
                    <View className="w-full max-w-sm rounded-xl bg-white p-5">
                        <Text className="mb-[15px] text-center text-lg font-bold text-[#6FB3FF]">Cadastro de senha</Text>
                        <Text className="mb-1.5 font-bold text-[#6FB3FF]">Nome do aplicativo</Text>
                        <TextInput
                            className="mb-3 rounded-lg border border-[#999] px-2.5 py-2"
                            value={nomeAplicativo}
                            onChangeText={setNomeAplicativo}
                            placeholder="ex: Facebook"
                        />

                        <Text className="mb-1.5 font-bold text-[#6FB3FF]">Senha gerada</Text>
                        <TextInput
                            className="mb-3 rounded-lg border border-[#999] px-2.5 py-2"
                            value={senha}
                            editable={false}
                        />

                        <Pressable
                            className={`mt-2.5 w-full rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] px-5 py-2.5 ${!podeSalvar ? 'opacity-50' : ''}`}
                            onPress={criarSenha}
                            disabled={!podeSalvar}
                        >
                            <Text className="text-center text-white">Salvar</Text>
                        </Pressable>

                        <Pressable
                            className="mt-2.5 w-full rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] px-5 py-2.5"
                            onPress={() => {
                                setModalVisible(false);
                                setNomeAplicativo('');
                            }}
                        >
                            <Text className="text-center text-white">Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <StatusBar style="auto" />
        </View>
    );
}
