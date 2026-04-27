import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Platform } from 'react-native';

export default function SignUp({ navigation }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erroCadastro, setErroCadastro] = useState('');

    const emailValido = useMemo(() => {
        const emailFormatado = email.trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado);
    }, [email]);

    const senhasIguais = senha === confirmarSenha;

    const podeRegistrar =
        nome.trim() !== '' &&
        email.trim() !== '' &&
        senha.trim() !== '' &&
        confirmarSenha.trim() !== '' &&
        emailValido &&
        senhasIguais &&
        !carregando;

    const handleChangeNome = (valor) => {
        setNome(valor);
        if (erroCadastro) {
            setErroCadastro('');
        }
    };

    const handleChangeEmail = (valor) => {
        setEmail(valor);
        if (erroCadastro) {
            setErroCadastro('');
        }
    };

    const handleChangeSenha = (valor) => {
        setSenha(valor);
        if (erroCadastro) {
            setErroCadastro('');
        }
    };

    const handleChangeConfirmarSenha = (valor) => {
        setConfirmarSenha(valor);
        if (erroCadastro) {
            setErroCadastro('');
        }
    };

    const API_BASE = Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';

    const registrar = async () => {
        try {
            setCarregando(true);
            setErroCadastro('');

            const response = await fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    email: email.trim(),
                    senha: senha.trim(),
                    confirmarSenha: confirmarSenha.trim(),
                }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                console.log('Erro ao converter resposta do cadastro:', e);
            }

            if (!response.ok) {
                setErroCadastro(
                    data.erro || data.mensagem || 'Não foi possível realizar o cadastro.'
                );
                return;
            }

            navigation.navigate('SignIn', { email: email.trim() });
        } catch (error) {
            console.log('ERRO FETCH SIGNUP:', error);
            setErroCadastro('Erro ao conectar. Tente novamente!');
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

            <Text className="mb-2 text-3xl font-bold text-[#6FB3FF]">Cadastro</Text>
            <Text className="mb-6 text-center text-sm text-[#6FB3FF]">Crie sua conta para continuar</Text>

            <TextInput
                className="mb-3.5 w-full max-w-md rounded-xl border-2 border-[#4A9BFF] bg-[#E6F7FF] px-3.5 py-3 text-[15px] text-[#6FB3FF]"
                placeholder="Nome"
                placeholderTextColor="#6FB3FF"
                value={nome}
                onChangeText={handleChangeNome}
            />

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

            <TextInput
                className="mb-3.5 w-full max-w-md rounded-xl border-2 border-[#4A9BFF] bg-[#E6F7FF] px-3.5 py-3 text-[15px] text-[#6FB3FF]"
                placeholder="Confirmar senha"
                placeholderTextColor="#6FB3FF"
                value={confirmarSenha}
                onChangeText={handleChangeConfirmarSenha}
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
                onPress={registrar}
            >
                <Text className="text-center text-base font-bold text-white">
                    {carregando ? 'Cadastrando...' : 'Cadastrar'}
                </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('SignIn')}>
                <Text className="text-sm text-[#6FB3FF]">
                    Já possui conta? <Text className="font-bold underline">Entrar</Text>
                </Text>
            </Pressable>
        </View>
    );
}
