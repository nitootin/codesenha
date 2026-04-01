# CodeSenha

Sistema fullstack desenvolvido para gerenciamento de dados e operações, com backend em **Spring Boot** e frontend em **React**, focado em organização, escalabilidade e boas práticas de desenvolvimento.

---

## Sobre o Projeto

O **CodeSenha** é uma aplicação web completa que permite gerenciar informações de forma estruturada, com comunicação entre frontend e backend via API REST.

---

##  Tecnologias Utilizadas

### Backend

* Java 17+
* Spring Boot
* Spring Data JPA
* Hibernate
* Maven

### Frontend

* React
* JavaScript (ES6+)
* Axios
* CSS

---

## Estrutura do Projeto

```bash
codesenha/
│
├── backend/                # API Spring Boot
├── frontend/               # Aplicação React
└── README.md
```

---

## Como Executar o Projeto

### Pré-requisitos

Antes de começar, você precisa ter instalado:

* Java 17+
* Node.js 18+
* Maven
* Git

---

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/codesenha.git
cd codesenha
```

---

### 2. Rodar o Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

ou no Windows:

```bash
mvnw.cmd spring-boot:run
```

A API estará disponível em:
http://localhost:8080

---

### 3. Rodar o Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

ou:

```bash
npm start
```

A aplicação estará disponível em:
http://localhost:5173

---

## Integração

O frontend consome a API via Axios utilizando:

```js
http://localhost:8080/api
```

---

## Funcionalidades

* Cadastro de dados
* Listagem de informações
* Integração frontend/backend
* Estrutura escalável

---

## Boas Práticas

* Arquitetura em camadas (Controller, Service, Repository)
* Uso de DTOs
* Consumo de API com Axios
* Organização modular

---

## Melhorias Futuras

* Autenticação com JWT
* Controle de usuários
* Dashboard com métricas
* Deploy em produção

---

## Autor

Phillip Alves Medeiros


