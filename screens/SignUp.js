import { View, Text, TextInput, Pressable, Image } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export default function SignUp({ navigation }) {
    const nome = useAuthStore((state) => state.cadastroNome);
    const email = useAuthStore((state) => state.cadastroEmail);
    const senha = useAuthStore((state) => state.cadastroSenha);
    const confirmarSenha = useAuthStore((state) => state.cadastroConfirmarSenha);
    const carregando = useAuthStore((state) => state.cadastroCarregando);
    const erroCadastro = useAuthStore((state) => state.erroCadastro);
    const setNome = useAuthStore((state) => state.setCadastroNome);
    const setEmail = useAuthStore((state) => state.setCadastroEmail);
    const setSenha = useAuthStore((state) => state.setCadastroSenha);
    const setConfirmarSenha = useAuthStore((state) => state.setCadastroConfirmarSenha);
    const registrar = useAuthStore((state) => state.registrar);
    const emailValido = useAuthStore((state) => state.cadastroEmailValido());
    const senhasIguais = useAuthStore((state) => state.cadastroSenhasIguais());
    const podeRegistrar = useAuthStore((state) => state.podeRegistrar());

    const handleRegistrar = async () => {
        const cadastroOk = await registrar();
        if (cadastroOk) {
            navigation.navigate('SignIn', { email: email.trim() });
        }
    };

    return (
        <View className="flex-1 items-center justify-center bg-white px-7">
            <Image
                source={require('../assets/icon.png')}
                className="mb-4 h-[110px] w-[110px]"
            />

            <Text className="mb-2 text-3xl font-bold text-[#6FB3FF]">Cadastro</Text>
            <Text className="mb-6 text-center text-sm text-[#6FB3FF]">Crie sua conta para continuar</Text>

            <TextInput
                className="mb-3.5 w-full max-w-md rounded-xl border-2 border-[#4A9BFF] bg-[#E6F7FF] px-3.5 py-3 text-[15px] text-[#6FB3FF]"
                placeholder="Nome"
                placeholderTextColor="#6FB3FF"
                value={nome}
                onChangeText={setNome}
            />

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

            <TextInput
                className="mb-3.5 w-full max-w-md rounded-xl border-2 border-[#4A9BFF] bg-[#E6F7FF] px-3.5 py-3 text-[15px] text-[#6FB3FF]"
                placeholder="Confirmar senha"
                placeholderTextColor="#6FB3FF"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
            />

            {confirmarSenha !== '' && !senhasIguais && (
                <Text className="-mt-1.5 mb-2.5 w-full max-w-md text-[13px] text-[#FF4D4D]">As senhas precisam ser iguais!</Text>
            )}

            {erroCadastro !== '' && (
                <Text className="-mt-1.5 mb-2.5 w-full max-w-md text-[13px] text-[#FF4D4D]">{erroCadastro}</Text>
            )}

            <Pressable
                className={`mb-[18px] mt-1.5 w-full max-w-md rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] py-3 ${!podeRegistrar ? 'opacity-50' : ''}`}
                disabled={!podeRegistrar}
                onPress={handleRegistrar}
            >
                <Text className="text-center text-base font-bold text-white">
                    {carregando ? 'Cadastrando...' : 'Cadastrar'}
                </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('SignIn')}>
                <Text className="text-sm text-[#6FB3FF]">
                    Ja possui conta? <Text className="font-bold underline">Entrar</Text>
                </Text>
            </Pressable>
        </View>
    );
}
