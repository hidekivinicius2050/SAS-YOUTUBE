const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class BackupSystem {
    constructor() {
        this.backupDir = path.join(__dirname, 'backups');
        this.dbPath = path.join(__dirname, 'tubeminer.db');
        
        // Criar diretório de backup se não existir
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    
    // Criar backup do banco de dados
    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `backup-${timestamp}.db`);
            
            // Verificar se o banco existe
            if (!fs.existsSync(this.dbPath)) {
                throw new Error('Banco de dados não encontrado');
            }
            
            // Copiar arquivo do banco
            fs.copyFileSync(this.dbPath, backupPath);
            
            // Comprimir backup (opcional)
            // const compressedPath = backupPath + '.gz';
            // await this.compressFile(backupPath, compressedPath);
            
            console.log(`[BACKUP] Backup criado: ${backupPath}`);
            
            // Limpar backups antigos
            this.cleanOldBackups();
            
            return backupPath;
        } catch (error) {
            console.error('[BACKUP] Erro ao criar backup:', error);
            throw error;
        }
    }
    
    // Restaurar backup
    async restoreBackup(backupPath) {
        try {
            if (!fs.existsSync(backupPath)) {
                throw new Error('Arquivo de backup não encontrado');
            }
            
            // Fazer backup do banco atual antes de restaurar
            const currentBackup = await this.createBackup();
            
            // Restaurar backup
            fs.copyFileSync(backupPath, this.dbPath);
            
            console.log(`[BACKUP] Backup restaurado de: ${backupPath}`);
            console.log(`[BACKUP] Backup do banco atual salvo em: ${currentBackup}`);
            
            return true;
        } catch (error) {
            console.error('[BACKUP] Erro ao restaurar backup:', error);
            throw error;
        }
    }
    
    // Limpar backups antigos (manter apenas últimos 7 dias)
    cleanOldBackups() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            files.forEach(file => {
                if (file.startsWith('backup-') && file.endsWith('.db')) {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.mtime < sevenDaysAgo) {
                        fs.unlinkSync(filePath);
                        console.log(`[BACKUP] Backup antigo removido: ${file}`);
                    }
                }
            });
        } catch (error) {
            console.error('[BACKUP] Erro ao limpar backups antigos:', error);
        }
    }
    
    // Listar backups disponíveis
    listBackups() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backups = [];
            
            files.forEach(file => {
                if (file.startsWith('backup-') && file.endsWith('.db')) {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    
                    backups.push({
                        name: file,
                        path: filePath,
                        size: stats.size,
                        created: stats.mtime,
                        sizeFormatted: this.formatFileSize(stats.size)
                    });
                }
            });
            
            return backups.sort((a, b) => b.created - a.created);
        } catch (error) {
            console.error('[BACKUP] Erro ao listar backups:', error);
            return [];
        }
    }
    
    // Formatar tamanho do arquivo
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Verificar integridade do backup
    async verifyBackup(backupPath) {
        try {
            const db = new sqlite3.Database(backupPath);
            
            return new Promise((resolve, reject) => {
                db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
                    db.close();
                    
                    if (err) {
                        reject(new Error('Backup corrompido'));
                    } else {
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            throw new Error('Erro ao verificar backup');
        }
    }
    
    // Iniciar backup automático
    startAutoBackup(intervalHours = 24) {
        const intervalMs = intervalHours * 60 * 60 * 1000;
        
        console.log(`[BACKUP] Backup automático iniciado - intervalo: ${intervalHours} horas`);
        
        // Fazer backup inicial
        this.createBackup();
        
        // Agendar backups futuros
        setInterval(() => {
            this.createBackup();
        }, intervalMs);
    }
}

module.exports = new BackupSystem();

