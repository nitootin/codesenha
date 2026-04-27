import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Platform } from 'react-native';
import { salvarToken } from '../services/storage';

export default function SignIn({ navigation, route }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erroLogin, setErroLogin] = useState('');

    useEffect(() => {
        if (route.params?.email) {
            setEmail(route.params.email);
        }
    }, [route.params?.email]);

    const emailValido = useMemo(() => {
        const emailFormatado = email.trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado);
    }, [email]);

    const podeEntrar =
        email.trim() !== '' &&
        senha.trim() !== '' &&
        emailValido &&
        !carregando;

    const handleChangeEmail = (valor) => {
        setEmail(valor);
        if (erroLogin) {
            setErroLogin('');
        }
    };

    const handleChangeSenha = (valor) => {
        setSenha(valor);
        if (erroLogin) {
            setErroLogin('');
        }
    };

    const API_BASE = Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';

    const entrar = async () => {
        try {
            setCarregando(true);
            setErroLogin('');

            const response = await fetch(`${API_BASE}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    senha: senha.trim(),
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
                setErroLogin(
                    data.erro || data.mensagem || 'E-mail ou senha inválidos.'
                );
                return;
            }

            await salvarToken(data.token);

            navigation.reset({
                index: 0,
                routes: [{ name: 'GeradorDeSenha' }],
            });
        } catch (error) {
            console.log('ERRO FETCH SIGNIN:', error);
            setErroLogin('Erro ao conectar. Tente novamente!');
        } finally {
            setCarregando(false);
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
                onChangeText={handleChangeEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {email.trim() !== '' && !emailValido && (
                <Text className="-mt-1.5 mb-2.5 w-full max-w-md text-[13px] text-[#FF4D4D]">Informe um e-mail válido!</Text>
            )}

            <TextInput
                className="mb-3.5 w-full max-w-md rounded-xl border-2 border-[#4A9BFF] bg-[#E6F7FF] px-3.5 py-3 text-[15px] text-[#6FB3FF]"
                placeholder="Senha"
                placeholderTextColor="#6FB3FF"
                value={senha}
                onChangeText={handleChangeSenha}
                secureTextEntry
            />

            {erroLogin !== '' && (
                <Text className="-mt-1.5 mb-2.5 w-full max-w-md text-[13px] text-[#FF4D4D]">{erroLogin}</Text>
            )}

            <Pressable
                className={`mb-[18px] mt-1.5 w-full max-w-md rounded-xl border-2 border-[#2A6FB3] bg-[#6FB3FF] py-3 ${!podeEntrar ? 'opacity-50' : ''}`}
                disabled={!podeEntrar}
                onPress={entrar}
            >
                <Text className="text-center text-base font-bold text-white">
                    {carregando ? 'Entrando...' : 'Entrar'}
                </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('SignUp')}>
                <Text className="text-sm text-[#6FB3FF]">
                    Não possui conta? <Text className="font-bold underline">Cadastre-se</Text>
                </Text>
            </Pressable>
        </View>
    );
}
