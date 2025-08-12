const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

class EmailService {
    constructor() {
        this.sesClient = new SESClient({
            region: 'us-east-1', // Altere para sua região AWS
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'SUA_ACCESS_KEY_AQUI',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'SUA_SECRET_KEY_AQUI'
            }
        });
        
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@tubeminer.com';
        this.fromName = process.env.FROM_NAME || 'TubeMiner';
    }
    
    // Enviar email de boas-vindas
    async sendWelcomeEmail(userEmail, userName) {
        const subject = 'Bem-vindo ao TubeMiner! 🎉';
        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Bem-vindo ao TubeMiner</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Bem-vindo ao TubeMiner!</h1>
                        <p>Sua conta foi criada com sucesso</p>
                    </div>
                    <div class="content">
                        <h2>Olá, ${userName}!</h2>
                        <p>Seja bem-vindo ao TubeMiner, a plataforma mais avançada para análise de vídeos virais do YouTube!</p>
                        
                        <h3>🚀 O que você pode fazer agora:</h3>
                        <ul>
                            <li><strong>1 Busca Gratuita:</strong> Teste nossa plataforma sem custo</li>
                            <li><strong>Filtros Avançados:</strong> Encontre vídeos específicos</li>
                            <li><strong>Análise Detalhada:</strong> Veja estatísticas completas</li>
                        </ul>
                        
                        <p><strong>💡 Dica:</strong> Após sua busca gratuita, assine o plano PRO por apenas R$ 19,90/mês para buscas ilimitadas!</p>
                        
                        <a href="http://localhost:3000" class="button">Acessar TubeMiner</a>
                        
                        <h3>🔒 Sua conta está segura</h3>
                        <p>Implementamos as mais rigorosas medidas de segurança para proteger seus dados.</p>
                    </div>
                    <div class="footer">
                        <p>Este email foi enviado automaticamente. Não responda a este email.</p>
                        <p>&copy; 2024 TubeMiner. Todos os direitos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(userEmail, subject, htmlBody);
    }
    
    // Enviar email de recuperação de senha
    async sendPasswordResetEmail(userEmail, resetToken) {
        const subject = 'Recuperação de Senha - TubeMiner';
        const resetLink = `http://localhost:3000/reset-password.html?token=${resetToken}`;
        
        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Recuperação de Senha</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Recuperação de Senha</h1>
                        <p>TubeMiner</p>
                    </div>
                    <div class="content">
                        <h2>Olá!</h2>
                        <p>Recebemos uma solicitação para redefinir a senha da sua conta TubeMiner.</p>
                        
                        <a href="${resetLink}" class="button">Redefinir Senha</a>
                        
                        <div class="warning">
                            <strong>⚠️ Importante:</strong>
                            <ul>
                                <li>Este link é válido por apenas 1 hora</li>
                                <li>Se você não solicitou esta recuperação, ignore este email</li>
                                <li>Nunca compartilhe este link com outras pessoas</li>
                            </ul>
                        </div>
                        
                        <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; color: #666;">${resetLink}</p>
                    </div>
                    <div class="footer">
                        <p>Este email foi enviado automaticamente. Não responda a este email.</p>
                        <p>&copy; 2024 TubeMiner. Todos os direitos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(userEmail, subject, htmlBody);
    }
    
    // Enviar email de confirmação de pagamento
    async sendPaymentConfirmationEmail(userEmail, userName, planDetails) {
        const subject = 'Pagamento Confirmado - TubeMiner PRO';
        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Pagamento Confirmado</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Pagamento Confirmado!</h1>
                        <p>Bem-vindo ao TubeMiner PRO</p>
                    </div>
                    <div class="content">
                        <h2>Parabéns, ${userName}!</h2>
                        
                        <div class="success">
                            <h3>🎉 Seu pagamento foi processado com sucesso!</h3>
                            <p><strong>Plano:</strong> ${planDetails.name}</p>
                            <p><strong>Valor:</strong> ${planDetails.amount}</p>
                            <p><strong>Próxima cobrança:</strong> ${planDetails.nextBilling}</p>
                        </div>
                        
                        <h3>🚀 Agora você tem acesso a:</h3>
                        <ul>
                            <li>✅ Buscas ilimitadas</li>
                            <li>✅ Filtros avançados</li>
                            <li>✅ Suporte prioritário</li>
                            <li>✅ Relatórios detalhados</li>
                        </ul>
                        
                        <a href="http://localhost:3000/buscador.html" class="button">Começar a Usar</a>
                        
                        <p><strong>📧 Suporte:</strong> Se precisar de ajuda, entre em contato conosco.</p>
                    </div>
                    <div class="footer">
                        <p>Este email foi enviado automaticamente. Não responda a este email.</p>
                        <p>&copy; 2024 TubeMiner. Todos os direitos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(userEmail, subject, htmlBody);
    }
    
    // Enviar email de alerta de segurança
    async sendSecurityAlertEmail(userEmail, userName, alertDetails) {
        const subject = '🚨 Alerta de Segurança - TubeMiner';
        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Alerta de Segurança</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    .alert { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚨 Alerta de Segurança</h1>
                        <p>TubeMiner</p>
                    </div>
                    <div class="content">
                        <h2>Olá, ${userName}!</h2>
                        
                        <div class="alert">
                            <h3>⚠️ Atividade Suspeita Detectada</h3>
                            <p><strong>Tipo:</strong> ${alertDetails.type}</p>
                            <p><strong>Data/Hora:</strong> ${alertDetails.timestamp}</p>
                            <p><strong>IP:</strong> ${alertDetails.ip}</p>
                            <p><strong>Localização:</strong> ${alertDetails.location || 'Não identificada'}</p>
                        </div>
                        
                        <h3>🔒 O que você deve fazer:</h3>
                        <ul>
                            <li>Verifique se foi você que fez essa ação</li>
                            <li>Se não foi você, altere sua senha imediatamente</li>
                            <li>Ative a autenticação de dois fatores (se disponível)</li>
                            <li>Entre em contato conosco se suspeitar de fraude</li>
                        </ul>
                        
                        <a href="http://localhost:3000" class="button">Acessar Minha Conta</a>
                        
                        <p><strong>📧 Suporte:</strong> Se precisar de ajuda, entre em contato conosco.</p>
                    </div>
                    <div class="footer">
                        <p>Este email foi enviado automaticamente. Não responda a este email.</p>
                        <p>&copy; 2024 TubeMiner. Todos os direitos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(userEmail, subject, htmlBody);
    }
    
    // Função principal para enviar email
    async sendEmail(toEmail, subject, htmlBody) {
        try {
            const command = new SendEmailCommand({
                Source: `${this.fromName} <${this.fromEmail}>`,
                Destination: {
                    ToAddresses: [toEmail]
                },
                Message: {
                    Subject: {
                        Data: subject,
                        Charset: 'UTF-8'
                    },
                    Body: {
                        Html: {
                            Data: htmlBody,
                            Charset: 'UTF-8'
                        }
                    }
                }
            });
            
            const result = await this.sesClient.send(command);
            console.log(`[EMAIL] Email enviado com sucesso para ${toEmail}:`, result.MessageId);
            return { success: true, messageId: result.MessageId };
            
        } catch (error) {
            console.error(`[EMAIL] Erro ao enviar email para ${toEmail}:`, error);
            return { success: false, error: error.message };
        }
    }
    
    // Verificar se o email está verificado no SES
    async verifyEmailIdentity(email) {
        try {
            const { SESClient, VerifyEmailIdentityCommand } = require('@aws-sdk/client-ses');
            const command = new VerifyEmailIdentityCommand({
                EmailAddress: email
            });
            
            await this.sesClient.send(command);
            console.log(`[EMAIL] Solicitação de verificação enviada para ${email}`);
            return { success: true };
            
        } catch (error) {
            console.error(`[EMAIL] Erro ao verificar email ${email}:`, error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();








<<<<<<< HEAD

=======
>>>>>>> c14af1105adcad036b4e6979e1017aa14437bc53
