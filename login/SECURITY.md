# 🔒 Guia de Segurança - TubeMiner

## ✅ Medidas de Segurança Implementadas

### 1. **Proteção contra Brute Force**
- **Rate Limiting**: Máximo 5 tentativas de login por IP em 15 minutos
- **Bloqueio Temporário**: IP bloqueado por 15 minutos após exceder limite
- **Logs Detalhados**: Todas as tentativas são registradas com IP e User-Agent

### 2. **Validação e Sanitização de Entradas**
- **Sanitização**: Remove caracteres perigosos (`<`, `>`, `javascript:`, event handlers)
- **Validação de Email**: Regex para validar formato de email
- **Validação de Senha**: Tamanho entre 6 e 100 caracteres
- **Prevenção SQL Injection**: Uso de prepared statements

### 3. **Headers de Segurança**
- **X-Content-Type-Options**: `nosniff` - Previne MIME sniffing
- **X-Frame-Options**: `DENY` - Previne clickjacking
- **X-XSS-Protection**: `1; mode=block` - Proteção XSS
- **Strict-Transport-Security**: Força HTTPS
- **Content-Security-Policy**: Controle de recursos permitidos

### 4. **Sistema de Logs de Segurança**
- **Logs de Acesso**: Todas as requisições com IP, método, URL, status
- **Logs de Segurança**: Tentativas de login, brute force, atividades suspeitas
- **Logs de Erro**: Erros detalhados para debugging
- **Retenção**: Logs mantidos por 30 dias, limpeza automática

### 5. **Backup Automático**
- **Backup Diário**: Banco de dados copiado automaticamente
- **Retenção**: Backups mantidos por 7 dias
- **Verificação**: Integridade dos backups verificada
- **Restauração**: Sistema de restauração seguro

### 6. **Rate Limiting Geral**
- **Limite**: 100 requisições por minuto por IP
- **Proteção**: Contra ataques de DDoS simples
- **Flexibilidade**: Configurável via variáveis de ambiente

## 🛠️ Como Usar

### Iniciar Sistema com Segurança
```bash
npm start
```

### Verificar Logs de Segurança
```bash
# Logs de segurança
cat logs/security.log

# Logs de acesso
cat logs/access.log

# Logs de erro
cat logs/error.log
```

### Gerenciar Backups
```javascript
const backupSystem = require('./backup-system');

// Criar backup manual
await backupSystem.createBackup();

// Listar backups
const backups = backupSystem.listBackups();

// Restaurar backup
await backupSystem.restoreBackup('./backups/backup-2024-01-01.db');
```

### Configurar Variáveis de Ambiente
Copie `env.example` para `.env` e configure:
```bash
cp env.example .env
```

## 📊 Monitoramento

### Estatísticas de Segurança
```javascript
const securityLogger = require('./security-logger');
const stats = securityLogger.getSecurityStats();
console.log(stats);
// {
//   totalLogins: 150,
//   failedLogins: 23,
//   bruteForceAttempts: 5,
//   suspiciousActivities: 2
// }
```

### Alertas Automáticos
- Tentativas de brute force são logadas automaticamente
- IPs suspeitos são identificados
- Atividades anômalas são registradas

## 🔧 Configurações Avançadas

### Rate Limiting
```javascript
// Configurar limites personalizados
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: { error: 'Muitas tentativas' }
});
```

### Headers de Segurança
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

## 🚨 Resposta a Incidentes

### 1. **Detectar Ataque**
- Monitorar logs de segurança
- Verificar tentativas de brute force
- Identificar IPs suspeitos

### 2. **Bloquear IP**
```bash
# Bloquear IP no firewall
iptables -A INPUT -s IP_SUSPEITO -j DROP
```

### 3. **Analisar Logs**
```bash
# Buscar atividades suspeitas
grep "SUSPICIOUS_ACTIVITY" logs/security.log

# Verificar tentativas de login
grep "LOGIN_FAILED" logs/security.log
```

### 4. **Restaurar Sistema**
```javascript
// Restaurar backup se necessário
await backupSystem.restoreBackup('./backups/backup-recente.db');
```

## 📋 Checklist de Segurança

### ✅ Implementado
- [x] Rate limiting para login
- [x] Sanitização de entradas
- [x] Headers de segurança
- [x] Logs de segurança
- [x] Backup automático
- [x] Validação de dados
- [x] Prevenção SQL injection
- [x] Proteção XSS básica

### 🔄 Próximos Passos
- [ ] Implementar HTTPS
- [ ] Sistema de notificação por email
- [ ] Monitoramento 24/7
- [ ] Firewall de aplicação (WAF)
- [ ] Criptografia adicional

## 📞 Suporte

Para questões de segurança:
- Email: admin@tubeminer.com
- Logs: `logs/security.log`
- Backup: `backups/`

---

**⚠️ IMPORTANTE**: Mantenha as chaves secretas seguras e nunca as compartilhe!
