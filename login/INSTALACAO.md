# Instalação e Execução do TubeMiner

## Pré-requisitos

Para executar o sistema TubeMiner, você precisa ter o Node.js instalado no seu computador.

### 1. Instalar o Node.js

1. Acesse o site oficial do Node.js: https://nodejs.org/
2. Baixe a versão LTS (Long Term Support) para Windows
3. Execute o instalador e siga as instruções
4. Reinicie o terminal/PowerShell após a instalação

### 2. Verificar a instalação

Abra o PowerShell e execute:
```bash
node --version
npm --version
```

Se ambos os comandos retornarem versões, a instalação foi bem-sucedida.

## Executando o Projeto

### 1. Navegar para a pasta do projeto
```bash
cd C:\Users\samur\Downloads\Projeto-youtube\login
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Iniciar o servidor
```bash
npm start
```

### 4. Acessar o sistema

Após iniciar o servidor, você verá mensagens como:
- Servidor rodando em http://localhost:3000
- Painel admin: http://localhost:3000/admin

## Credenciais de Acesso

### Clientes de Exemplo
- **João Silva**: joao@exemplo.com / 123456
- **Maria Santos**: maria@exemplo.com / 123456
- **Pedro Costa**: pedro@exemplo.com / 123456

### Administrador
- **Email**: admin@tubeminer.com
- **Senha**: admin123

## Funcionalidades

### Páginas do Cliente
- **Login**: http://localhost:3000
- **Registro**: http://localhost:3000/registro.html
- **Esqueceu Senha**: http://localhost:3000/esqueceu-senha.html

### Painel Administrativo
- **Admin**: http://localhost:3000/admin

## Estrutura do Sistema

- **Banco de dados**: SQLite (tubeminer.db será criado automaticamente)
- **Backend**: Node.js + Express
- **Frontend**: HTML + Tailwind CSS + JavaScript
- **Autenticação**: bcryptjs para senhas criptografadas

## Solução de Problemas

### Erro: "npm não é reconhecido"
- Reinstale o Node.js
- Reinicie o terminal
- Verifique se o Node.js foi adicionado ao PATH do sistema

### Erro: "Porta 3000 já está em uso"
- Feche outros aplicativos que possam estar usando a porta 3000
- Ou altere a porta no arquivo server.js (linha 9)

### Erro de conexão com banco de dados
- Verifique se o arquivo tubeminer.db foi criado
- Se não, delete o arquivo e reinicie o servidor

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento (com auto-reload)
npm run dev

# Executar em modo produção
npm start

# Parar o servidor
Ctrl + C
```

## Suporte

Se encontrar problemas, verifique:
1. Se o Node.js está instalado corretamente
2. Se todas as dependências foram instaladas
3. Se a porta 3000 está disponível
4. Se há permissões de escrita na pasta do projeto




