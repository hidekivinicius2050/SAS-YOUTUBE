# 📧 Configuração AWS SES - TubeMiner

## 📋 Passos para Configurar

### 1. **Criar Conta AWS**
1. Acesse: https://aws.amazon.com/
2. Crie uma conta AWS (gratuita por 12 meses)
3. Acesse o Console AWS

### 2. **Configurar SES**
1. No Console AWS, procure por "SES" (Simple Email Service)
2. Clique em "Get started"
3. Escolha sua região (recomendado: us-east-1)

### 3. **Verificar Email de Origem**
1. No SES, vá em "Verified identities"
2. Clique em "Create identity"
3. Escolha "Email address"
4. Digite: `noreply@tubeminer.com` (ou seu domínio)
5. Clique em "Create identity"
6. Verifique o email recebido

### 4. **Sair do Sandbox (Opcional)**
- Por padrão, SES está em modo sandbox
- Para enviar para qualquer email, solicite sair do sandbox
- Ou mantenha em sandbox e verifique emails de destino

### 5. **Criar Usuário IAM**
1. Vá para IAM no Console AWS
2. Clique em "Users" → "Create user"
3. Nome: `tubeminer-ses-user`
4. Anexe política: `AmazonSESFullAccess`
5. Crie Access Key e Secret Key

### 6. **Configurar Variáveis de Ambiente**

#### No arquivo `env.example`:
```bash
# AWS SES Configuration
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_REGION=us-east-1

# Email Configuration
FROM_EMAIL=noreply@tubeminer.com
FROM_NAME=TubeMiner
```

#### No arquivo `email-service.js`:
```javascript
this.sesClient = new SESClient({
    region: 'us-east-1', // Sua região
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
```

## 🔧 Tipos de Email Implementados

### 1. **Email de Boas-vindas**
- Enviado automaticamente após registro
- Informações sobre plano gratuito
- Link para acessar a plataforma

### 2. **Recuperação de Senha**
- Token seguro válido por 1 hora
- Link para redefinir senha
- Avisos de segurança

### 3. **Confirmação de Pagamento**
- Enviado após pagamento confirmado
- Detalhes do plano PRO
- Acesso aos recursos premium

### 4. **Alerta de Segurança**
- Atividades suspeitas detectadas
- Informações sobre IP e localização
- Instruções de segurança

## 📊 Monitoramento

### **Logs de Email**
```javascript
console.log(`[EMAIL] Email enviado com sucesso para ${email}:`, messageId);
console.error(`[EMAIL] Erro ao enviar email:`, error);
```

### **Métricas no AWS SES**
- Taxa de entrega
- Taxa de rejeição
- Taxa de bounce
- Queixas de spam

## 🚨 Troubleshooting

### **Erro: "Email address not verified"**
- Verifique se o email de origem está verificado no SES
- Em modo sandbox, emails de destino também precisam ser verificados

### **Erro: "Access Denied"**
- Verifique se as credenciais AWS estão corretas
- Confirme se o usuário IAM tem permissões SES

### **Erro: "Region not supported"**
- Verifique se a região está correta
- Algumas regiões não suportam SES

### **Emails não chegando**
- Verifique a pasta de spam
- Confirme se o domínio não está bloqueado
- Verifique logs do SES no Console AWS

## 🔒 Segurança

### **Boas Práticas**
- ✅ Use variáveis de ambiente para credenciais
- ✅ Nunca commite credenciais no código
- ✅ Use IAM roles quando possível
- ✅ Monitore métricas de entrega
- ✅ Configure SPF/DKIM para seu domínio

### **Configurações Recomendadas**
```javascript
// Rate limiting para emails
const emailLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5, // máximo 5 emails por minuto
});

// Verificar domínio
await emailService.verifyEmailIdentity('seu-dominio.com');
```

## 📞 Suporte

Para problemas com AWS SES:
- Documentação oficial: https://docs.aws.amazon.com/ses/
- Console AWS SES: https://console.aws.amazon.com/ses/
- Logs do servidor: `logs/error.log`

---

**⚠️ IMPORTANTE**: Mantenha suas credenciais AWS seguras e nunca as compartilhe!








<<<<<<< HEAD

=======
>>>>>>> c14af1105adcad036b4e6979e1017aa14437bc53
