import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, Pressable, Modal, TextInput } from 'react-native';
import { usePasswordStore } from '../stores/passwordStore';

export default function GeradorDeSenha({ navigation }) {
    const senha = usePasswordStore((state) => state.senha);
    const modalVisible = usePasswordStore((state) => state.modalVisible);
    const nomeAplicativo = usePasswordStore((state) => state.nomeAplicativo);
    const gerarSenha = usePasswordStore((state) => state.gerarSenha);
    const copiarSenhaGerada = usePasswordStore((state) => state.copiarSenhaGerada);
    const abrirModal = usePasswordStore((state) => state.abrirModal);
    const fecharModal = usePasswordStore((state) => state.fecharModal);
    const setNomeAplicativo = usePasswordStore((state) => state.setNomeAplicativo);
    const criarSenha = usePasswordStore((state) => state.criarSenha);
    const senhaGerada = usePasswordStore((state) => state.senhaGerada());
    const podeSalvar = usePasswordStore((state) => state.podeSalvar());

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
                <Pressable className="w-full max-w-md rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] px-5 py-2.5" onPress={gerarSenha}>
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
                    onPress={copiarSenhaGerada}
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
                            onPress={fecharModal}
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
