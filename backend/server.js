const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'senha-secreta-do-projeto';

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('API está rodando');
});

app.post('/signup', async (req, res) => {
    try {
        const { nome, email, senha, confirmarSenha } = req.body;

        if (!nome || !email || !senha || !confirmarSenha) {
            return res.status(400).json({
                erro: 'Todos os campos são obrigatórios.',
            });
        }

        const emailFormatado = email.trim().toLowerCase();
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado);

        if (!emailValido) {
            return res.status(400).json({
                erro: 'E-mail inválido.',
            });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({
                erro: 'As senhas precisam ser iguais.',
            });
        }

        const [usuariosExistentes] = await db.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [emailFormatado]
        );

        if (usuariosExistentes.length > 0) {
            return res.status(400).json({
                erro: 'Este e-mail já foi cadastrado.',
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await db.execute(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome.trim(), emailFormatado, senhaCriptografada]
        );

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso.',
        });
    } catch (error) {
        console.error('Erro no signup:', error);

        return res.status(500).json({
            erro: 'Erro interno ao cadastrar usuário.',
        });
    }
});

app.post('/signin', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                erro: 'E-mail e senha são obrigatórios.',
            });
        }

        const emailFormatado = email.trim().toLowerCase();

        const [usuarios] = await db.execute(
            'SELECT id, nome, email, senha FROM usuarios WHERE email = ?',
            [emailFormatado]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                erro: 'E-mail ou senha inválidos.',
            });
        }

        const usuario = usuarios[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: 'E-mail ou senha inválidos.',
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            },
        });
    } catch (error) {
        console.error('Erro no signin:', error);

        return res.status(500).json({
            erro: 'Erro interno ao realizar login.',
        });
    }
});

async function testarConexao() {
    try {
        await db.execute('SELECT 1');
        console.log('Conectado ao MySQL com sucesso');
    } catch (error) {
        console.error('Erro ao conectar no MySQL:', error);
    }
}

app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    await testarConexao();
});