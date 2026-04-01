import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
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

    const entrar = async () => {
        try {
            setCarregando(true);
            setErroLogin('');

            const response = await fetch('http://localhost:3000/signin', {
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
                    data.erro || data.mensagem || '♥ E-mail ou senha inválidos. ♥'
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
            setErroLogin(
                '♥ Erro ao conectar. Tente novamente! ♥'
            );
        } finally {
            setCarregando(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/cadeadinho.jpg')}
                style={styles.image}
            />

            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Entre para gerenciar suas senhas</Text>

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#c97b95"
                value={email}
                onChangeText={handleChangeEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {email.trim() !== '' && !emailValido && (
                <Text style={styles.errorText}>♥ Informe um e-mail válido! ♥</Text>
            )}

            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#c97b95"
                value={senha}
                onChangeText={handleChangeSenha}
                secureTextEntry
            />

            {erroLogin !== '' && (
                <Text style={styles.errorText}>{erroLogin}</Text>
            )}

            <Pressable
                style={[styles.button, !podeEntrar && styles.buttonDisabled]}
                disabled={!podeEntrar}
                onPress={entrar}
            >
                <Text style={styles.buttonText}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.linkText}>
                    Não possui conta? <Text style={styles.linkHighlight}>Cadastre-se</Text>
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 110,
        height: 110,
        marginBottom: 16,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#eb6589',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#eb6589',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        width: '50%',
        backgroundColor: '#ffe7ed',
        borderWidth: 2,
        borderColor: '#eb6589',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        color: '#eb6589',
        fontSize: 15,
    },
    button: {
        width: '50%',
        backgroundColor: '#eb6589',
        borderWidth: 2,
        borderColor: '#c10a38',
        borderRadius: 12,
        paddingVertical: 12,
        marginTop: 6,
        marginBottom: 18,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
    linkText: {
        color: '#eb6589',
        fontSize: 14,
    },
    linkHighlight: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    errorText: {
        width: '50%',
        color: '#ff265c',
        fontSize: 13,
        marginTop: -6,
        marginBottom: 10,
    },
});