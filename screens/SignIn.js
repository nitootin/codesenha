import { useEffect } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export default function SignIn({ navigation, route }) {
    const email = useAuthStore((state) => state.loginEmail);
    const senha = useAuthStore((state) => state.loginSenha);
    const carregando = useAuthStore((state) => state.loginCarregando);
    const erroLogin = useAuthStore((state) => state.erroLogin);
    const setEmail = useAuthStore((state) => state.setLoginEmail);
    const setSenha = useAuthStore((state) => state.setLoginSenha);
    const preencherLoginEmail = useAuthStore((state) => state.preencherLoginEmail);
    const entrar = useAuthStore((state) => state.entrar);
    const emailValido = useAuthStore((state) => state.loginEmailValido());
    const podeEntrar = useAuthStore((state) => state.podeEntrar());

    useEffect(() => {
        if (route.params?.email) {
            preencherLoginEmail(route.params.email);
        }
    }, [preencherLoginEmail, route.params?.email]);

    const handleEntrar = async () => {
        const loginOk = await entrar();
        if (loginOk) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'GeradorDeSenha' }],
            });
        }
    };

    return (
        <View className="flex-1 items-center justify-center bg-white px-7">
            <Image
                source={require('../assets/icon.png')}
                className="mb-4 h-[110px] w-[110px]"
            />

            <Text className="mb-2 text-3xl font-bold text-[#6FB3FF]">Login</Text>
            <Text className="mb-6 text-center text-sm text-[#6FB3FF]">Entre para gerenciar suas senhas</Text>

            <TextInput
                className="mb-3.5 w-full max-w-md rounded-xl border-2 border-[#4A9BFF] bg-[#E6F7FF] px-3.5 py-3 text-[15px] text-[#6FB3FF]"
                placeholder="E-mail"
                placeholderTextColor="#6FB3FF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {email.trim() !== '' && !emailValido && (
                <Text className="-mt-1.5 mb-2.5 w-full max-w-md text-[13px] text-[#FF4D4D]">Informe um e-mail valido!</Text>
            )}

            <TextInput
                className="mb-3.5 w-full max-w-md rounded-xl border-2 border-[#4A9BFF] bg-[#E6F7FF] px-3.5 py-3 text-[15px] text-[#6FB3FF]"
                placeholder="Senha"
                placeholderTextColor="#6FB3FF"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            {erroLogin !== '' && (
                <Text className="-mt-1.5 mb-2.5 w-full max-w-md text-[13px] text-[#FF4D4D]">{erroLogin}</Text>
            )}

            <Pressable
                className={`mb-[18px] mt-1.5 w-full max-w-md rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] py-3 ${!podeEntrar ? 'opacity-50' : ''}`}
                disabled={!podeEntrar}
                onPress={handleEntrar}
            >
                <Text className="text-center text-base font-bold text-white">
                    {carregando ? 'Entrando...' : 'Entrar'}
                </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('SignUp')}>
                <Text className="text-sm text-[#6FB3FF]">
                    Nao possui conta? <Text className="font-bold underline">Cadastre-se</Text>
                </Text>
            </Pressable>
        </View>
    );
}
