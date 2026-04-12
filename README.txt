# Projeto Codesenha

Sistema composto por:

* Frontend: Expo (React Native)
* Backend: Node.js com Express
* Banco de dados: MySQL
* Ambiente containerizado com Docker

---

# Pré-requisitos

Antes de iniciar, instale:

* Docker Desktop
* Node.js (versão 18 ou superior)
* Android Studio (opcional, para emulador)

---

# Execução com Docker (backend + banco)

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Para parar os containers:

```bash
docker compose down
```

Para remover também os dados do banco:

```bash
docker compose down -v
```

---

# Portas do sistema

| Serviço      | Endereço                                       |
| ------------ | ---------------------------------------------- |
| Frontend Web | [http://localhost:8081](http://localhost:8081) |
| Backend API  | [http://localhost:3000](http://localhost:3000) |
| MySQL        | localhost:3307                                 |

Observação: o MySQL não é acessado pelo navegador. Utilize ferramentas como DBeaver ou MySQL Workbench.

---

# Rodando o frontend (WEB)

## Opção 1 — Via Docker

Acesse:

[http://localhost:8081](http://localhost:8081)

---

## Opção 2 — Rodando localmente (recomendado)

Na raiz do projeto:

```bash
npm install
npx expo start
```

Depois pressione:

```bash
w
```

Isso abrirá o projeto no navegador.

---

# Rodando no Android Studio (emulador)

## 1. Iniciar o emulador

* Abra o Android Studio
* Vá em Device Manager
* Inicie um dispositivo virtual

---

## 2. Rodar o frontend

Na raiz do projeto:

```bash
npx expo start
```

Com o emulador aberto, pressione:

```bash
a
```

Ou clique em "Run on Android device/emulator".

---

# Configuração da API para Android

Se o aplicativo estiver chamando:

[http://localhost:3000](http://localhost:3000)

Isso não funcionará no emulador.

Substitua por:

[http://10.0.2.2:3000](http://10.0.2.2:3000)

Esse endereço permite que o emulador acesse o backend rodando na sua máquina.

---

# Rodando no celular com Expo Go

## 1. Instale o aplicativo

Baixe o app Expo Go:

* Android: Google Play
* iOS: App Store

---

## 2. Inicie o projeto

```bash
npx expo start
```

---

## 3. Conectar

* Escaneie o QR Code exibido no terminal ou navegador
* O app abrirá automaticamente no celular

---

# Estrutura do projeto

```
codesenha/
├── docker-compose.yml
├── Dockerfile.frontend
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   └── init.sql
├── screens/
├── services/
├── assets/
├── App.js
├── index.js
└── package.json
```

---

# Observações importantes

* Para desenvolvimento mobile, utilize o frontend rodando localmente (não via Docker)
* O backend pode permanecer rodando via Docker normalmente
* O Expo dentro do Docker é mais indicado para uso web

---

# Teste rápido

Após subir tudo:

Backend:
[http://localhost:3000](http://localhost:3000)

Frontend:
[http://localhost:8081](http://localhost:8081)

Se ambos responderem, o ambiente está funcionando corretamente
