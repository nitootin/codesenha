const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'senha-secreta-do-projeto';

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
            'SELECT id FROM gerador_senhas.usuarios WHERE email = ?',
            [emailFormatado]
        );

        if (usuariosExistentes.length > 0) {
            return res.status(400).json({
                erro: 'Este e-mail já foi cadastrado.',
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await db.execute(
            'INSERT INTO gerador_senhas.usuarios (nome, email, senha) VALUES (?, ?, ?)',
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
            'SELECT id, nome, email, senha FROM gerador_senhas.usuarios WHERE email = ?',
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

async function ensureSchema() {
    try {
        
        await db.execute(`
            CREATE TABLE IF NOT EXISTS gerador_senhas.usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        
        await db.execute(`
            CREATE TABLE IF NOT EXISTS gerador_senhas.historico (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                nome_aplicativo VARCHAR(255) NOT NULL,
                senha VARCHAR(255) NOT NULL,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES gerador_senhas.usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        console.log('Schema verificado/criado (usuarios, historico)');
    } catch (error) {
        console.error('Erro ao garantir schema do banco:', error);
    }
}

app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    await testarConexao();
    await ensureSchema();
});


function getUserIdFromHeader(req) {
    const auth = req.headers.authorization;
    if (!auth) return null;
    const parts = auth.split(' ');
    if (parts.length !== 2) return null;
    const token = parts[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.id;
    } catch (e) {
        return null;
    }
}

function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ erro: 'Token não fornecido.' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ erro: 'Authorization inválido.' });
    const token = parts[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (e) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
}

app.post('/historico', requireAuth, async (req, res) => {
    try {
        const { nomeAplicativo, senha } = req.body;
        if (!nomeAplicativo || !senha) {
            return res.status(400).json({ erro: 'Nome do aplicativo e senha são obrigatórios.' });
        }

        const usuarioId = req.userId;

        await db.execute(
            'INSERT INTO gerador_senhas.historico (usuario_id, nome_aplicativo, senha, criado_em) VALUES (?, ?, ?, NOW())',
            [usuarioId, nomeAplicativo, senha]
        );

        return res.status(201).json({ mensagem: 'Senha salva no histórico.' });
    } catch (error) {
        console.error('Erro ao salvar historico:', error);
        return res.status(500).json({ erro: 'Erro interno ao salvar histórico.' });
    }
});

app.get('/historico', requireAuth, async (req, res) => {
    try {
        const usuarioId = req.userId;

    const query = 'SELECT id, nome_aplicativo AS nomeAplicativo, senha, criado_em FROM gerador_senhas.historico WHERE usuario_id = ? ORDER BY criado_em DESC';
        const [rows] = await db.execute(query, [usuarioId]);

        const resultado = rows.map((r) => ({
            id: r.id.toString(),
            nomeAplicativo: r.nomeAplicativo,
            senha: r.senha,
        }));

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Erro ao buscar historico:', error);
        return res.status(500).json({ erro: 'Erro interno ao buscar histórico.' });
    }
});


app.delete('/historico/:id', requireAuth, async (req, res) => {
    try {
        const usuarioId = req.userId;
        const id = req.params.id;

    const [result] = await db.execute('DELETE FROM gerador_senhas.historico WHERE id = ? AND usuario_id = ?', [id, usuarioId]);

        
        const affectedRows = result.affectedRows || result.affected_rows || 0;
        if (affectedRows === 0) {
            return res.status(404).json({ erro: 'Item não encontrado ou sem permissão.' });
        }

        return res.status(200).json({ mensagem: 'Item deletado.' });
    } catch (error) {
        console.error('Erro ao deletar historico:', error);
        return res.status(500).json({ erro: 'Erro interno ao deletar histórico.' });
    }
});