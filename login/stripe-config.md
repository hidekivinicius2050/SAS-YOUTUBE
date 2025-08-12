# 🔗 CONFIGURAÇÃO DO STRIPE

## 📋 **PASSOS PARA CONFIGURAR O STRIPE**

### 1. **Criar conta no Stripe**
- Acesse: https://stripe.com/
- Crie uma conta gratuita
- Complete a verificação da conta

### 2. **Obter as chaves de API**
- No Dashboard do Stripe, vá em "Developers" > "API keys"
- Copie a **Publishable key** (pk_test_...)
- Copie a **Secret key** (sk_test_...)

### 3. **Configurar o produto no Stripe**
- Vá em "Products" no Dashboard
- Crie um novo produto chamado "TubeMiner PRO"
- Adicione um preço de R$ 19,90/mês
- Copie o **Price ID** (price_...)

### 4. **Configurar Webhook**
- Vá em "Developers" > "Webhooks"
- Clique em "Add endpoint"
- URL: `https://seu-dominio.com/api/webhook`
- Eventos: `checkout.session.completed`
- Copie o **Webhook secret** (whsec_...)

### 5. **Atualizar o código**
No arquivo `server.js`, substitua:
```javascript
const stripe = require('stripe')('sk_test_your_stripe_secret_key');
```
Por:
```javascript
const stripe = require('stripe')('sk_test_SUA_CHAVE_SECRETA_AQUI');
```

No arquivo `buscador.html`, substitua:
```javascript
const stripe = Stripe('your_publishable_key');
```
Por:
```javascript
const stripe = Stripe('pk_test_SUA_CHAVE_PUBLICA_AQUI');
```

E substitua:
```javascript
priceId: 'price_1234567890'
```
Por:
```javascript
priceId: 'price_SEU_PRICE_ID_AQUI'
```

### 6. **Instalar dependência**
Execute no terminal:
```bash
npm install stripe
```

## ⚠️ **IMPORTANTE**

- Use as chaves de **teste** durante o desenvolvimento
- Use as chaves de **produção** quando for ao ar
- Mantenha as chaves secretas seguras
- Nunca compartilhe as chaves secretas

## 🎯 **TESTE**

Para testar o pagamento, use os cartões de teste do Stripe:
- **Sucesso:** 4242 4242 4242 4242
- **Falha:** 4000 0000 0000 0002
- **Data:** Qualquer data futura
- **CVC:** Qualquer 3 dígitos



