const fs = require('fs');
const path = require('path');

class SecurityLogger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.securityLogFile = path.join(this.logDir, 'security.log');
        this.accessLogFile = path.join(this.logDir, 'access.log');
        this.errorLogFile = path.join(this.logDir, 'error.log');
        
        // Criar diretório de logs se não existir
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    
    // Log de eventos de segurança
    logSecurity(event, details) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [SECURITY] ${event} - ${JSON.stringify(details)}\n`;
        
        fs.appendFileSync(this.securityLogFile, logEntry);
        console.log(`[SECURITY] ${event}`, details);
    }
    
    // Log de acesso
    logAccess(req, res, responseTime) {
        const timestamp = new Date().toISOString();
        const ip = req.ip || req.connection.remoteAddress;
        const method = req.method;
        const url = req.url;
        const userAgent = req.get('User-Agent') || 'Unknown';
        const statusCode = res.statusCode;
        
        const logEntry = `[${timestamp}] ${ip} - ${method} ${url} - ${statusCode} - ${responseTime}ms - ${userAgent}\n`;
        
        fs.appendFileSync(this.accessLogFile, logEntry);
    }
    
    // Log de erros
    logError(error, context = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [ERROR] ${error.message} - Stack: ${error.stack} - Context: ${JSON.stringify(context)}\n`;
        
        fs.appendFileSync(this.errorLogFile, logEntry);
        console.error('[ERROR]', error.message, context);
    }
    
    // Log de tentativas de brute force
    logBruteForce(ip, details) {
        this.logSecurity('BRUTE_FORCE_DETECTED', {
            ip,
            timestamp: new Date().toISOString(),
            details
        });
    }
    
    // Log de login falhado
    logFailedLogin(ip, email, reason) {
        this.logSecurity('LOGIN_FAILED', {
            ip,
            email: email ? email.substring(0, 3) + '***' : 'unknown',
            reason,
            timestamp: new Date().toISOString()
        });
    }
    
    // Log de login bem-sucedido
    logSuccessfulLogin(ip, email, userId) {
        this.logSecurity('LOGIN_SUCCESS', {
            ip,
            email: email ? email.substring(0, 3) + '***' : 'unknown',
            userId,
            timestamp: new Date().toISOString()
        });
    }
    
    // Log de tentativas suspeitas
    logSuspiciousActivity(ip, activity, details) {
        this.logSecurity('SUSPICIOUS_ACTIVITY', {
            ip,
            activity,
            details,
            timestamp: new Date().toISOString()
        });
    }
    
    // Limpar logs antigos (manter apenas últimos 30 dias)
    cleanOldLogs() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const logFiles = [this.securityLogFile, this.accessLogFile, this.errorLogFile];
        
        logFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                if (stats.mtime < thirtyDaysAgo) {
                    // Manter apenas as últimas 1000 linhas
                    const lines = fs.readFileSync(file, 'utf8').split('\n');
                    if (lines.length > 1000) {
                        const recentLines = lines.slice(-1000);
                        fs.writeFileSync(file, recentLines.join('\n') + '\n');
                    }
                }
            }
        });
    }
    
    // Obter estatísticas de segurança
    getSecurityStats() {
        const stats = {
            totalLogins: 0,
            failedLogins: 0,
            bruteForceAttempts: 0,
            suspiciousActivities: 0
        };
        
        if (fs.existsSync(this.securityLogFile)) {
            const content = fs.readFileSync(this.securityLogFile, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach(line => {
                if (line.includes('LOGIN_SUCCESS')) stats.totalLogins++;
                if (line.includes('LOGIN_FAILED')) stats.failedLogins++;
                if (line.includes('BRUTE_FORCE_DETECTED')) stats.bruteForceAttempts++;
                if (line.includes('SUSPICIOUS_ACTIVITY')) stats.suspiciousActivities++;
            });
        }
        
        return stats;
    }
}

module.exports = new SecurityLogger();

