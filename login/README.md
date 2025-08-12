# 🎯 TubeMine - Plataforma de Busca de Vídeos Virais

## 📋 Descrição
Sistema completo de busca e análise de vídeos do YouTube com sistema de planos, paginação e filtros avançados.

## 🚀 Funcionalidades

### 🔐 Sistema de Autenticação
- **Login/Registro** com validação
- **Recuperação de senha** via email
- **Sessões seguras** com cookies
- **Proteção de rotas** autenticadas

### 🎯 Buscador de Vídeos
- **API do YouTube** integrada
- **Filtros avançados**: duração, data, views, likes, comentários, canal, inscritos
- **Ordenação** por qualquer critério
- **Paginação** com 10 vídeos por página
- **Cache inteligente** para otimizar buscas

### 💳 Sistema de Planos
- **Plano Gratuito**: 1 busca por dia
- **Plano PRO**: Buscas ilimitadas
- **Integração Stripe** para pagamentos
- **Cobrança mensal** automática
- **Webhooks** para sincronização

### 👤 Painel de Usuário
- **Menu de perfil** com avatar
- **Alteração de senha**
- **Suporte WhatsApp**
- **Logout seguro**

### 🔧 Painel Administrativo
- **Gestão completa** de usuários
- **Edição de planos** e status
- **Ativação/desativação** de contas
- **Estatísticas** em tempo real

## 🛠️ Tecnologias

### Backend
- **Node.js** com Express
- **SQLite3** para banco de dados
- **bcryptjs** para hash de senhas
- **express-session** para sessões
- **helmet** para segurança
- **Stripe** para pagamentos
- **AWS SES** para emails

### Frontend
- **HTML5** semântico
- **CSS3** nativo com glassmorphism
- **JavaScript** vanilla ES6+
- **Responsivo** para mobile

## 📦 Instalação

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Passos
1. **Clone o repositório**
```bash
git clone https://github.com/hidekivinicius2050/SAS-YOUTUBE.git
cd SAS-YOUTUBE/login
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env com:
STRIPE_SECRET_KEY=sua_chave_secreta_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret
AWS_SES_ACCESS_KEY=sua_chave_aws
AWS_SES_SECRET_KEY=sua_chave_secreta_aws
```

4. **Inicie o servidor**
```bash
npm start
```

5. **Acesse o sistema**
- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Credenciais admin**: admin@tubeminer.com / admin123

## 🔧 Configuração

### API do YouTube
O sistema usa uma API key pública para demonstração. Para produção:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e ative a YouTube Data API v3
3. Gere uma API key
4. Substitua no arquivo `buscador.html`

### Stripe
1. Crie uma conta no [Stripe](https://stripe.com/)
2. Obtenha as chaves de API
3. Configure o webhook para `/api/webhook/stripe`
4. Atualize as variáveis de ambiente

### AWS SES
1. Configure o AWS SES para envio de emails
2. Adicione as credenciais no `.env`

## 📊 Estrutura do Projeto

```
login/
├── server.js              # Servidor principal
├── package.json           # Dependências
├── database.db           # Banco SQLite
├── index.html            # Página de login
├── registro.html         # Página de registro
├── esqueceu-senha.html   # Recuperação de senha
├── buscador.html         # Buscador principal
├── admin.html            # Painel administrativo
├── README.md             # Este arquivo
└── test-api.js           # Teste da API
```

## 🔒 Segurança

### Implementado
- **Rate limiting** para prevenir spam
- **CORS** configurado adequadamente
- **Helmet** para headers de segurança
- **Input sanitization** e validação
- **Session management** seguro
- **CSRF protection**
- **SQL injection** prevention

### Recomendações para Produção
- Use **HTTPS** em produção
- Configure **firewall** adequado
- Implemente **monitoring** e logs
- Use **variáveis de ambiente** para secrets
- Configure **backup** automático do banco

## 🎨 Design

### Características
- **Glassmorphism** moderno
- **Gradientes** elegantes
- **Animações** suaves
- **Responsivo** para todos os dispositivos
- **Dark theme** profissional

### Componentes
- **Cards** com blur e transparência
- **Botões** com hover effects
- **Modais** elegantes
- **Tabelas** responsivas
- **Paginação** customizada

## 📈 Funcionalidades Avançadas

### Sistema de Cache
- **Cache inteligente** por busca
- **Expiração** automática
- **Otimização** de performance

### Paginação
- **10 vídeos** por página
- **Navegação** intuitiva
- **Informações** de progresso
- **Design** responsivo

### Filtros Avançados
- **Duração** do vídeo
- **Data** de upload
- **Views** e likes
- **Comentários**
- **Data** de criação do canal
- **Inscritos** do canal

## 🚀 Deploy

### Opções Recomendadas
- **Heroku** (fácil deploy)
- **Vercel** (otimizado para Node.js)
- **AWS EC2** (controle total)
- **DigitalOcean** (custo-benefício)

### Variáveis de Ambiente Necessárias
```env
NODE_ENV=production
PORT=3000
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
AWS_SES_ACCESS_KEY=your_aws_access_key_here
AWS_SES_SECRET_KEY=your_aws_secret_key_here
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

**Hideki Vinicius**
- GitHub: [@hidekivinicius2050](https://github.com/hidekivinicius2050)
- Email: hidekivinicius2050@gmail.com

## 🙏 Agradecimentos

- **YouTube Data API** pela plataforma
- **Stripe** pelos pagamentos
- **AWS** pelos serviços em nuvem
- **Comunidade open source** pelo suporte

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!**




