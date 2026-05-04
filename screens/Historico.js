import { View, Text, Pressable, ScrollView } from 'react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ShowIcon from '../components/icons/ShowIcon';
import CopyIcon from '../components/icons/CopyIcon';
import { useHistoryStore } from '../stores/historyStore';

export default function Historico({ navigation }) {
    const historico = useHistoryStore((state) => state.historico);
    const visiveis = useHistoryStore((state) => state.visiveis);
    const carregarHistorico = useHistoryStore((state) => state.carregarHistorico);
    const alternarVisibilidade = useHistoryStore((state) => state.alternarVisibilidade);
    const copiarSenha = useHistoryStore((state) => state.copiarSenha);
    const deletarSenha = useHistoryStore((state) => state.deletarSenha);

    useFocusEffect(
        useCallback(() => {
            carregarHistorico();
        }, [carregarHistorico])
    );

    return (
        <View className="flex-1 items-center bg-white px-6 pt-[55px]">
            <Text className="mb-7 text-[28px] font-bold text-[#6FB3FF]">Historico de senhas</Text>

            <ScrollView
                className="w-full max-w-2xl"
                contentContainerClassName="items-center pb-5"
                showsVerticalScrollIndicator={false}
            >
                {historico.length === 0 ? (
                    <Text className="mt-2.5 font-medium text-[#6FB3FF]">Voce nao possui senhas!</Text>
                ) : (
                    historico.map((item) => (
                        <View
                            key={item.id}
                            className="mb-[18px] w-full flex-row items-center justify-between rounded-[18px] border-2 border-[#4A9BFF] bg-[#F0FBFF] px-5 py-[18px]"
                        >
                            <View className="flex-1 justify-center">
                                <Text className="mb-1.5 text-[17px] font-bold text-[#2A7BD4]">{item.nomeAplicativo}</Text>
                                <Text className="text-[15px] font-semibold tracking-[0.5px] text-[#6FB3FF]">
                                    {visiveis[item.id] ? item.senha : '********'}
                                </Text>
                            </View>

                            <View className="ml-[18px] flex-row items-center">
                                <Pressable
                                    onPress={() => alternarVisibilidade(item.id)}
                                    className="ml-1.5 h-[34px] w-[34px] items-center justify-center rounded-lg"
                                >
                                    <ShowIcon
                                        size={22}
                                        color={visiveis[item.id] ? '#D6EDFF' : '#6FB3FF'}
                                    />
                                </Pressable>

                                <Pressable
                                    onPress={() => copiarSenha(item.senha)}
                                    className="ml-1.5 h-[34px] w-[34px] items-center justify-center rounded-lg"
                                >
                                    <CopyIcon />
                                </Pressable>

                                <Pressable
                                    onPress={() => deletarSenha(item.id)}
                                    className="ml-1.5 h-[34px] w-[34px] items-center justify-center rounded-lg"
                                >
                                    <Text className="text-xl font-bold text-[#6FB3FF]">X</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Pressable
                className="mb-6 mt-5 w-full max-w-xs items-center rounded-[14px] border-2 border-[#2A6FB3] bg-[#6FB3FF] py-3"
                onPress={() => navigation.goBack()}
            >
                <Text className="text-base font-bold text-white">Voltar</Text>
            </Pressable>
        </View>
    );
}
