import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';

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

    const registrar = async () => {
        try {
            setCarregando(true);
            setErroCadastro('');

            const response = await fetch('http://localhost:3000/signup', {
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
                    data.erro || data.mensagem || '♥ Não foi possível realizar o cadastro. ♥'
                );
                return;
            }

            navigation.navigate('SignIn', { email: email.trim() });
        } catch (error) {
            console.log('ERRO FETCH SIGNUP:', error);
            setErroCadastro(
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

            <Text style={styles.title}>Cadastro</Text>
            <Text style={styles.subtitle}>Crie sua conta para continuar</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#c97b95"
                value={nome}
                onChangeText={handleChangeNome}
            />

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

            <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                placeholderTextColor="#c97b95"
                value={confirmarSenha}
                onChangeText={handleChangeConfirmarSenha}
                secureTextEntry
            />

            {confirmarSenha !== '' && !senhasIguais && (
                <Text style={styles.errorText}>♥ As senhas precisam ser iguais! ♥</Text>
            )}

            {erroCadastro !== '' && (
                <Text style={styles.errorText}>{erroCadastro}</Text>
            )}

            <Pressable
                style={[styles.button, !podeRegistrar && styles.buttonDisabled]}
                disabled={!podeRegistrar}
                onPress={registrar}
            >
                <Text style={styles.buttonText}>
                    {carregando ? 'Cadastrando...' : 'Cadastrar'}
                </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.linkText}>
                    Já possui conta? <Text style={styles.linkHighlight}>Entrar</Text>
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