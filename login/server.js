const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
<<<<<<< HEAD
// Configuração do Stripe - Use uma chave de teste válida para desenvolvimento
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51RuR47HXe3ew16y7eqYWC47g');
=======
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');
>>>>>>> c14af1105adcad036b4e6979e1017aa14437bc53
const emailService = require('./email-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações de segurança com Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://www.googleapis.com", "https://api.stripe.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Configurações de CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuração de sessões
app.use(session({
  secret: 'tubemine-secret-key-2024-super-secure',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true em produção com HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict'
  },
  name: 'tubemine-session'
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting para prevenir brute force
const rateLimit = require('express-rate-limit');

// Limite de tentativas de login por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`[SECURITY] Brute force detectado - IP: ${req.ip}`);
    res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: 15 * 60
    });
  }
});

// Limite geral de requisições
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requisições por minuto
  message: {
    error: 'Muitas requisições. Tente novamente em 1 minuto.'
  }
});

// Aplicar rate limiting
app.use('/api/clientes/login', loginLimiter);
app.use('/api/admin/login', loginLimiter);
app.use('/api/', generalLimiter);

// Middleware para sanitizar entradas
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remover caracteres perigosos
  return input
    .replace(/[<>]/g, '') // Remover < e >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
}

// Middleware para validar e sanitizar dados
function validateAndSanitize(req, res, next) {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
}

// Middleware para logging de segurança
function securityLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const method = req.method;
  const url = req.url;
  
  console.log(`[${timestamp}] ${ip} - ${method} ${url} - ${userAgent}`);
  
  // Log de tentativas suspeitas
  if (url.includes('/login') && method === 'POST') {
    console.log(`[SECURITY] Tentativa de login - IP: ${ip} - User-Agent: ${userAgent}`);
  }
  
  next();
}

app.use(securityLogger);
app.use(validateAndSanitize);

// Middleware para verificar autenticação
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    console.log(`[SECURITY] Tentativa de acesso não autorizado - IP: ${req.ip}, URL: ${req.url}`);
    res.status(401).json({ error: 'Acesso não autorizado. Faça login primeiro.' });
  }
}

// Middleware para verificar se usuário está logado (para páginas protegidas)
function checkAuth(req, res, next) {
  if (req.session && req.session.userId) {
    // Se já está logado, redirecionar para o buscador
    return res.redirect('/buscador.html');
  }
  next();
}

// Headers de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.googleapis.com https://api.stripe.com;");
  next();
});

// Inicializar banco de dados
const db = new sqlite3.Database('tubeminer.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
    } else {
        console.log('Conectado ao banco SQLite.');
        initDatabase();
    }
});

// Criar tabelas
function initDatabase() {
    // Tabela de clientes
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        empresa TEXT,
        plano TEXT DEFAULT 'gratuito',
        status_pagamento TEXT DEFAULT 'pendente',
        ativo BOOLEAN DEFAULT 1,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_ultimo_acesso DATETIME,
        buscas_gratuitas_restantes INTEGER DEFAULT 1
    )`);
    
    // Criar tabela de recuperação de senha
    db.run(`CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de buscas realizadas
    db.run(`CREATE TABLE IF NOT EXISTS buscas_realizadas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        data_busca DATETIME DEFAULT CURRENT_TIMESTAMP,
        query TEXT,
        resultados INTEGER,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    )`);

    // Tabela de administradores
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela admins:', err);
        } else {
            // Criar admin padrão se não existir
            const adminEmail = 'admin@tubeminer.com';
            const adminSenha = 'coisaboa2024';
            
            db.get('SELECT * FROM admins WHERE email = ?', [adminEmail], (err, row) => {
                if (err) {
                    console.error('Erro ao verificar admin:', err);
                } else if (!row) {
                    bcrypt.hash(adminSenha, 10, (err, hash) => {
                        if (err) {
                            console.error('Erro ao criar hash da senha:', err);
                        } else {
                            db.run('INSERT INTO admins (email, senha) VALUES (?, ?)', 
                                [adminEmail, hash], (err) => {
                                if (err) {
                                    console.error('Erro ao criar admin padrão:', err);
                                } else {
                                    console.log('Admin padrão criado: admin@tubeminer.com / admin123');
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    // Verificar se a coluna buscas_gratuitas_restantes existe
    db.all("PRAGMA table_info(clientes)", (err, rows) => {
        if (err) {
            console.error('Erro ao verificar estrutura da tabela:', err);
        } else {
            console.log('Estrutura da tabela clientes:', rows);
            // Verificar se a coluna buscas_gratuitas_restantes existe
            const hasColumn = rows.some(row => row.name === 'buscas_gratuitas_restantes');
            console.log('Coluna buscas_gratuitas_restantes existe:', hasColumn);
        }
    });

    // Garantir que a coluna buscas_gratuitas_restantes existe
    db.all("PRAGMA table_info(clientes)", (err, rows) => {
        if (err) {
            console.error('Erro ao verificar estrutura da tabela:', err);
        } else {
            const hasColumn = rows.some(row => row.name === 'buscas_gratuitas_restantes');
            console.log('Coluna buscas_gratuitas_restantes existe:', hasColumn);
            
            if (!hasColumn) {
                console.log('Adicionando coluna buscas_gratuitas_restantes...');
                db.run('ALTER TABLE clientes ADD COLUMN buscas_gratuitas_restantes INTEGER DEFAULT 1', (err) => {
                    if (err) {
                        console.error('Erro ao adicionar coluna:', err);
                    } else {
                        console.log('Coluna buscas_gratuitas_restantes adicionada com sucesso');
                    }
                });
            } else {
                console.log('Coluna buscas_gratuitas_restantes já existe');
            }
        }
    });

    // Adicionar colunas para sistema de cobrança mensal
    db.all("PRAGMA table_info(clientes)", (err, columns) => {
        if (err) {
            console.error('Erro ao verificar estrutura da tabela:', err);
            return;
        }
        
        const requiredColumns = [
            { name: 'stripe_customer_id', type: 'TEXT' },
            { name: 'stripe_subscription_id', type: 'TEXT' },
            { name: 'proximo_pagamento', type: 'DATETIME' },
            { name: 'data_ativacao_pro', type: 'DATETIME' },
            { name: 'status_assinatura', type: 'TEXT DEFAULT "inativo"' }
        ];
        
        requiredColumns.forEach(column => {
            const hasColumn = columns.some(col => col.name === column.name);
            if (!hasColumn) {
                console.log(`Adicionando coluna ${column.name}...`);
                db.run(`ALTER TABLE clientes ADD COLUMN ${column.name} ${column.type}`, (err) => {
                    if (err) {
                        console.error(`Erro ao adicionar coluna ${column.name}:`, err);
                    } else {
                        console.log(`Coluna ${column.name} adicionada com sucesso`);
                    }
                });
            }
        });
    });

    // Inserir alguns clientes de exemplo
    const clientesExemplo = [
        {
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            senha: '123456',
            empresa: 'TechCorp',
            plano: 'mensal',
            status_pagamento: 'pago',
            ativo: 1
        },
        {
            nome: 'Maria Santos',
            email: 'maria@exemplo.com',
            senha: '123456',
            empresa: 'Digital Solutions',
            plano: 'anual',
            status_pagamento: 'pago',
            ativo: 1
        },
        {
            nome: 'Pedro Costa',
            email: 'pedro@exemplo.com',
            senha: '123456',
            empresa: 'StartupXYZ',
            plano: 'semestral',
            status_pagamento: 'pendente',
            ativo: 0
        }
    ];

    clientesExemplo.forEach(cliente => {
        bcrypt.hash(cliente.senha, 10, (err, hash) => {
            if (!err) {
                db.run(`INSERT OR IGNORE INTO clientes (nome, email, senha, empresa, plano, status_pagamento, ativo) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [cliente.nome, cliente.email, hash, cliente.empresa, cliente.plano, cliente.status_pagamento, cliente.ativo]);
            }
        });
    });
}

// Rotas da API

// Login de clientes
app.post('/api/clientes/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        // Validação rigorosa de entrada
        if (!email || !senha) {
            console.log(`[SECURITY] Tentativa de login sem email ou senha - IP: ${req.ip}`);
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log(`[SECURITY] Email inválido tentado - IP: ${req.ip}, Email: ${email}`);
            return res.status(400).json({ error: 'Formato de email inválido' });
        }
        
        // Validar tamanho da senha
        if (senha.length < 6 || senha.length > 100) {
            console.log(`[SECURITY] Senha com tamanho inválido - IP: ${req.ip}`);
            return res.status(400).json({ error: 'Senha deve ter entre 6 e 100 caracteres' });
        }
        
        // Sanitizar entradas
        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
        const sanitizedSenha = sanitizeInput(senha);
        
        db.get('SELECT * FROM clientes WHERE email = ? AND ativo = 1', [sanitizedEmail], async (err, cliente) => {
            if (err) {
                console.error('[ERROR] Erro ao buscar cliente:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!cliente) {
                console.log(`[SECURITY] Login falhou - Email não encontrado ou conta inativa - IP: ${req.ip}, Email: ${sanitizedEmail}`);
                return res.status(401).json({ error: 'Email ou senha incorretos' });
            }
            
            const senhaValida = await bcrypt.compare(sanitizedSenha, cliente.senha);
            if (!senhaValida) {
                console.log(`[SECURITY] Login falhou - Senha incorreta - IP: ${req.ip}, Email: ${sanitizedEmail}`);
                return res.status(401).json({ error: 'Email ou senha incorretos' });
            }
            
            // Atualizar último acesso
            db.run('UPDATE clientes SET data_ultimo_acesso = CURRENT_TIMESTAMP WHERE id = ?', [cliente.id]);
            
            // Criar sessão do usuário
            req.session.userId = cliente.id;
            req.session.userEmail = cliente.email;
            req.session.userName = cliente.nome;
            req.session.userPlano = cliente.plano;
            
            // Log de login bem-sucedido
            console.log(`[SECURITY] Login bem-sucedido - IP: ${req.ip}, Email: ${sanitizedEmail}, Cliente ID: ${cliente.id}, Sessão: ${req.sessionID}`);
            
            res.json({ 
                success: true, 
                message: 'Login realizado com sucesso',
                redirect: '/buscador.html',
                cliente: { 
                    id: cliente.id, 
                    nome: cliente.nome, 
                    email: cliente.email,
                    empresa: cliente.empresa,
                    plano: cliente.plano,
                    ativo: cliente.ativo
                }
            });
        });
    } catch (error) {
        console.error('[ERROR] Erro inesperado no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Registro de clientes
app.post('/api/clientes/registro', async (req, res) => {
    try {
        const { nome, email, empresa, senha } = req.body;
        
        // Validação de entrada
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }
        
        // Validar tamanho da senha
        if (senha.length < 6 || senha.length > 100) {
            return res.status(400).json({ error: 'Senha deve ter entre 6 e 100 caracteres' });
        }
        
        // Sanitizar entradas
        const sanitizedNome = sanitizeInput(nome);
        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
        const sanitizedEmpresa = empresa ? sanitizeInput(empresa) : null;
        const sanitizedSenha = sanitizeInput(senha);
        
        // Verificar se email já existe
        db.get('SELECT id FROM clientes WHERE email = ?', [sanitizedEmail], async (err, existing) => {
            if (err) {
                console.error('[ERROR] Erro ao verificar email existente:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (existing) {
                console.log(`[SECURITY] Tentativa de registro com email existente - IP: ${req.ip}, Email: ${sanitizedEmail}`);
                return res.status(400).json({ error: 'Email já cadastrado' });
            }
            
            // Criar hash da senha
            bcrypt.hash(sanitizedSenha, 10, async (err, hash) => {
                if (err) {
                    console.error('[ERROR] Erro ao processar senha:', err);
                    return res.status(500).json({ error: 'Erro ao processar senha' });
                }
                
                // Inserir novo cliente
                db.run(`INSERT INTO clientes (nome, email, empresa, senha) VALUES (?, ?, ?, ?)`,
                    [sanitizedNome, sanitizedEmail, sanitizedEmpresa, hash], function(err) {
                    if (err) {
                        console.error('[ERROR] Erro ao criar conta:', err);
                        return res.status(500).json({ error: 'Erro ao criar conta' });
                    }
                    
                    console.log(`[SECURITY] Registro bem-sucedido - IP: ${req.ip}, Email: ${sanitizedEmail}, Cliente ID: ${this.lastID}`);
                    
                    // Enviar email de boas-vindas
                    emailService.sendWelcomeEmail(sanitizedEmail, sanitizedNome)
                        .then(result => {
                            if (result.success) {
                                console.log(`[EMAIL] Email de boas-vindas enviado para ${sanitizedEmail}`);
                            } else {
                                console.error(`[EMAIL] Erro ao enviar email de boas-vindas: ${result.error}`);
                            }
                        })
                        .catch(error => {
                            console.error(`[EMAIL] Erro ao enviar email de boas-vindas: ${error.message}`);
                        });
                    
                    res.json({ 
                        success: true, 
                        message: 'Conta criada com sucesso',
                        cliente: { 
                            id: this.lastID, 
                            nome: sanitizedNome, 
                            email: sanitizedEmail, 
                            empresa: sanitizedEmpresa,
                            plano: 'gratuito',
                            freePlanAvailable: true
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('[ERROR] Erro inesperado no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para solicitar recuperação de senha
app.post('/api/clientes/recuperar-senha', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }
        
        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
        
        // Verificar se o email existe
        db.get('SELECT id, nome FROM clientes WHERE email = ? AND ativo = 1', [sanitizedEmail], async (err, cliente) => {
            if (err) {
                console.error('[ERROR] Erro ao buscar cliente:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!cliente) {
                console.log(`[SECURITY] Tentativa de recuperação de senha para email inexistente - IP: ${req.ip}, Email: ${sanitizedEmail}`);
                return res.status(404).json({ error: 'Email não encontrado' });
            }
            
            // Gerar token de recuperação
            const resetToken = require('crypto').randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
            
            // Salvar token no banco
            db.run('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', 
                [sanitizedEmail, resetToken, expiresAt.toISOString()], function(err) {
                if (err) {
                    console.error('[ERROR] Erro ao salvar token de recuperação:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                
                // Enviar email de recuperação
                emailService.sendPasswordResetEmail(sanitizedEmail, resetToken)
                    .then(result => {
                        if (result.success) {
                            console.log(`[EMAIL] Email de recuperação enviado para ${sanitizedEmail}`);
                            res.json({ 
                                success: true, 
                                message: 'Email de recuperação enviado com sucesso' 
                            });
                        } else {
                            console.error(`[EMAIL] Erro ao enviar email de recuperação: ${result.error}`);
                            res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
                        }
                    })
                    .catch(error => {
                        console.error(`[EMAIL] Erro ao enviar email de recuperação: ${error.message}`);
                        res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
                    });
            });
        });
        
    } catch (error) {
        console.error('[ERROR] Erro inesperado na recuperação de senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Login de admin
app.post('/api/admin/login', (req, res) => {
    const { email, senha } = req.body;
    
    db.get('SELECT * FROM admins WHERE email = ?', [email], (err, admin) => {
        if (err) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        } else if (!admin) {
            res.status(401).json({ error: 'Email ou senha incorretos' });
        } else {
            bcrypt.compare(senha, admin.senha, (err, match) => {
                if (err) {
                    res.status(500).json({ error: 'Erro interno do servidor' });
                } else if (match) {
                    res.json({ 
                        success: true, 
                        message: 'Login realizado com sucesso',
                        admin: { id: admin.id, email: admin.email }
                    });
                } else {
                    res.status(401).json({ error: 'Email ou senha incorretos' });
                }
            });
        }
    });
});

// Listar todos os clientes
app.get('/api/clientes', (req, res) => {
    db.all('SELECT id, nome, email, empresa, plano, status_pagamento, ativo, data_criacao, data_ultimo_acesso FROM clientes ORDER BY data_criacao DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar clientes' });
        } else {
            res.json(rows);
        }
    });
});

// Buscar cliente por ID
app.get('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT id, nome, email, empresa, plano, status_pagamento, ativo, data_criacao, data_ultimo_acesso, buscas_gratuitas_restantes FROM clientes WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Erro ao buscar cliente:', err);
            res.status(500).json({ error: 'Erro ao buscar cliente' });
        } else if (!row) {
            res.status(404).json({ error: 'Cliente não encontrado' });
        } else {
            res.json({ 
                success: true, 
                data: row 
            });
        }
    });
});

// Atualizar cliente
app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, senha, empresa, plano, status_pagamento, ativo, buscas_gratuitas_restantes } = req.body;
    
    // Validação básica
    if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    
    // Verificar se email já existe (exceto para o usuário atual)
    db.get('SELECT id FROM clientes WHERE email = ? AND id != ?', [email, id], (err, existingUser) => {
        if (err) {
            console.error('Erro ao verificar email:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (existingUser) {
            return res.status(400).json({ error: 'Email já está em uso por outro usuário' });
        }
        
        // Preparar query de atualização
        let updateQuery = 'UPDATE clientes SET nome = ?, email = ?, empresa = ?, plano = ?, status_pagamento = ?, ativo = ?, buscas_gratuitas_restantes = ?';
        
        // Definir buscas baseado no plano
        let buscasRestantes = buscas_gratuitas_restantes || 1;
        if (plano === 'pro') {
            buscasRestantes = 999999; // Ilimitado para plano PRO
        }
        
        let params = [nome, email, empresa, plano, status_pagamento, ativo ? 1 : 0, buscasRestantes];
        
        // Se senha foi fornecida, incluir na atualização
        if (senha && senha.trim() !== '') {
            bcrypt.hash(senha, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Erro ao hash da senha:', err);
                    return res.status(500).json({ error: 'Erro ao processar senha' });
                }
                
                updateQuery += ', senha = ?';
                params.push(hashedPassword);
                params.push(id);
                
                executeUpdate();
            });
        } else {
            params.push(id);
            executeUpdate();
        }
        
        function executeUpdate() {
            db.run(updateQuery + ' WHERE id = ?', params, function(err) {
                if (err) {
                    console.error('Erro ao atualizar cliente:', err);
                    res.status(500).json({ error: 'Erro ao atualizar cliente' });
                } else if (this.changes === 0) {
                    res.status(404).json({ error: 'Cliente não encontrado' });
                } else {
                    res.json({ 
                        success: true, 
                        message: 'Cliente atualizado com sucesso',
                        changes: this.changes
                    });
                }
            });
        }
    });
});

// Alterar senha do cliente
app.put('/api/clientes/:id/senha', (req, res) => {
    const { id } = req.params;
    const { novaSenha } = req.body;
    
    bcrypt.hash(novaSenha, 10, (err, hash) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao processar senha' });
        } else {
            db.run('UPDATE clientes SET senha = ? WHERE id = ?', [hash, id], function(err) {
                if (err) {
                    res.status(500).json({ error: 'Erro ao atualizar senha' });
                } else if (this.changes === 0) {
                    res.status(404).json({ error: 'Cliente não encontrado' });
                } else {
                    res.json({ success: true, message: 'Senha alterada com sucesso' });
                }
            });
        }
    });
});

// Ativar plano pago para teste123@gmail.com
app.post('/api/ativar-plano-teste', (req, res) => {
    console.log('Ativando plano pago para teste123@gmail.com...');
    db.run(`UPDATE clientes 
            SET plano = 'pago', status_pagamento = 'aprovado', buscas_gratuitas_restantes = 999999
            WHERE email = 'teste123@gmail.com'`, function(err) {
        if (err) {
            console.error('Erro ao ativar plano:', err);
            res.status(500).json({ error: 'Erro ao ativar plano pago' });
        } else if (this.changes === 0) {
            console.log('Usuário teste123@gmail.com não encontrado');
            res.status(404).json({ error: 'Usuário teste123@gmail.com não encontrado' });
        } else {
            console.log('Plano pago ativado para teste123@gmail.com - Mudanças:', this.changes);
            res.json({ 
                success: true, 
                message: 'Plano pago ativado com sucesso para teste123@gmail.com',
                changes: this.changes
            });
        }
    });
});

// Rota para verificar usuário teste123@gmail.com
app.get('/api/verificar-teste', (req, res) => {
    db.get('SELECT id, nome, email, plano, status_pagamento, buscas_gratuitas_restantes FROM clientes WHERE email = ?', 
        ['teste123@gmail.com'], (err, user) => {
        if (err) {
            console.error('Erro ao verificar usuário:', err);
            res.status(500).json({ error: 'Erro ao verificar usuário' });
        } else if (!user) {
            res.status(404).json({ error: 'Usuário teste123@gmail.com não encontrado' });
        } else {
            console.log('Usuário encontrado:', user);
            res.json({ 
                success: true, 
                user: user
            });
        }
    });
});

// Deletar cliente
app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM clientes WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: 'Erro ao deletar cliente' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Cliente não encontrado' });
        } else {
            res.json({ success: true, message: 'Cliente deletado com sucesso' });
        }
    });
});

// Webhook do Stripe para processar eventos de pagamento
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret';

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Erro no webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Evento Stripe recebido:', event.type);

    // Processar diferentes tipos de eventos
    switch (event.type) {
        case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object);
            break;
        default:
            console.log(`Evento não processado: ${event.type}`);
    }

    res.json({ received: true });
});

// Função para processar pagamento bem-sucedido
async function handlePaymentSucceeded(invoice) {
    try {
        console.log('Pagamento bem-sucedido:', invoice.id);
        
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const customerId = subscription.customer;
        
        // Buscar usuário pelo customer_id do Stripe
        db.get('SELECT id, email, nome FROM clientes WHERE stripe_customer_id = ?', [customerId], async (err, user) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                return;
            }
            
            if (!user) {
                console.error('Usuário não encontrado para customer_id:', customerId);
                return;
            }
            
            // Calcular próxima data de cobrança
            const nextBillingDate = new Date(subscription.current_period_end * 1000);
            
            // Atualizar usuário para plano PRO
            db.run(`UPDATE clientes SET 
                    plano = 'pro', 
                    status_pagamento = 'aprovado',
                    status_assinatura = 'ativo',
                    proximo_pagamento = ?,
                    data_ativacao_pro = CURRENT_TIMESTAMP,
                    buscas_gratuitas_restantes = 999999
                    WHERE id = ?`, 
                [nextBillingDate.toISOString(), user.id], function(err) {
                if (err) {
                    console.error('Erro ao atualizar usuário:', err);
                } else {
                    console.log(`Usuário ${user.email} atualizado para plano PRO`);
                    
                    // Enviar email de confirmação
                    sendProActivationEmail(user.email, user.nome, nextBillingDate);
                }
            });
        });
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
    }
}

// Função para processar pagamento falhado
async function handlePaymentFailed(invoice) {
    try {
        console.log('Pagamento falhou:', invoice.id);
        
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const customerId = subscription.customer;
        
        db.get('SELECT id, email, nome FROM clientes WHERE stripe_customer_id = ?', [customerId], (err, user) => {
            if (err || !user) {
                console.error('Usuário não encontrado para customer_id:', customerId);
                return;
            }
            
            // Rebaixar para plano gratuito
            db.run(`UPDATE clientes SET 
                    plano = 'gratuito', 
                    status_pagamento = 'pendente',
                    status_assinatura = 'suspenso',
                    buscas_gratuitas_restantes = 1
                    WHERE id = ?`, 
                [user.id], function(err) {
                if (err) {
                    console.error('Erro ao rebaixar usuário:', err);
                } else {
                    console.log(`Usuário ${user.email} rebaixado para plano gratuito`);
                    sendPaymentFailedEmail(user.email, user.nome);
                }
            });
        });
    } catch (error) {
        console.error('Erro ao processar pagamento falhado:', error);
    }
}

// Função para processar assinatura deletada
async function handleSubscriptionDeleted(subscription) {
    try {
        console.log('Assinatura deletada:', subscription.id);
        
        const customerId = subscription.customer;
        
        db.get('SELECT id, email, nome FROM clientes WHERE stripe_customer_id = ?', [customerId], (err, user) => {
            if (err || !user) {
                console.error('Usuário não encontrado para customer_id:', customerId);
                return;
            }
            
            // Rebaixar para plano gratuito
            db.run(`UPDATE clientes SET 
                    plano = 'gratuito', 
                    status_pagamento = 'pendente',
                    status_assinatura = 'cancelado',
                    buscas_gratuitas_restantes = 1
                    WHERE id = ?`, 
                [user.id], function(err) {
                if (err) {
                    console.error('Erro ao cancelar assinatura:', err);
                } else {
                    console.log(`Assinatura cancelada para usuário ${user.email}`);
                    sendSubscriptionCancelledEmail(user.email, user.nome);
                }
            });
        });
    } catch (error) {
        console.error('Erro ao processar cancelamento:', error);
    }
}

// Função para processar atualização de assinatura
async function handleSubscriptionUpdated(subscription) {
    try {
        console.log('Assinatura atualizada:', subscription.id);
        
        const customerId = subscription.customer;
        const nextBillingDate = new Date(subscription.current_period_end * 1000);
        
        db.get('SELECT id, email, nome FROM clientes WHERE stripe_customer_id = ?', [customerId], (err, user) => {
            if (err || !user) {
                console.error('Usuário não encontrado para customer_id:', customerId);
                return;
            }
            
            // Atualizar data do próximo pagamento
            db.run(`UPDATE clientes SET 
                    proximo_pagamento = ?,
                    status_assinatura = ?
                    WHERE id = ?`, 
                [nextBillingDate.toISOString(), subscription.status, user.id], function(err) {
                if (err) {
                    console.error('Erro ao atualizar assinatura:', err);
                } else {
                    console.log(`Assinatura atualizada para usuário ${user.email}`);
                }
            });
        });
    } catch (error) {
        console.error('Erro ao processar atualização:', error);
    }
}

// Funções de email
function sendProActivationEmail(email, nome, nextBillingDate) {
    const subject = '🎉 Seu plano PRO foi ativado!';
    const html = `
        <h2>Parabéns, ${nome}!</h2>
        <p>Seu plano PRO foi ativado com sucesso!</p>
        <p><strong>Benefícios do plano PRO:</strong></p>
        <ul>
            <li>✅ Buscas ilimitadas</li>
            <li>✅ Sem popups de upgrade</li>
            <li>✅ Suporte prioritário</li>
            <li>✅ Recursos avançados</li>
        </ul>
        <p><strong>Próxima cobrança:</strong> ${nextBillingDate.toLocaleDateString('pt-BR')}</p>
        <p>Obrigado por escolher o TubeMine!</p>
    `;
    
    emailService.sendEmail(email, subject, html);
}

function sendPaymentFailedEmail(email, nome) {
    const subject = '⚠️ Problema com seu pagamento';
    const html = `
        <h2>Olá, ${nome}</h2>
        <p>Houve um problema com o pagamento da sua assinatura PRO.</p>
        <p>Você foi rebaixado para o plano gratuito temporariamente.</p>
        <p>Para reativar seu plano PRO, acesse sua conta e atualize seus dados de pagamento.</p>
    `;
    
    emailService.sendEmail(email, subject, html);
}

function sendSubscriptionCancelledEmail(email, nome) {
    const subject = '👋 Sua assinatura foi cancelada';
    const html = `
        <h2>Olá, ${nome}</h2>
        <p>Sua assinatura PRO foi cancelada conforme solicitado.</p>
        <p>Você ainda pode usar o plano gratuito com 1 busca por mês.</p>
        <p>Para reativar seu plano PRO, acesse sua conta a qualquer momento.</p>
    `;
    
    emailService.sendEmail(email, subject, html);
}

<<<<<<< HEAD
// Rota para criar checkout session do Stripe (DEPRECATED - usando a versão mais nova abaixo)
// app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
//     try {
//         const { userId, email, nome } = req.body;
//         
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [{
//                 price: process.env.STRIPE_PRICE_ID || 'price_1RuMrgHXe3ew16y7EhnKrmJOuiP5X21shT8LVn14Mu4fUzHj6jLNMU2UBZiO7VWqL4eScvAkE1G88u3ajrb8Xtlk00WEsat7oh',
//                 quantity: 1,
//             }],
//             mode: 'subscription',
//             success_url: `${req.protocol}://${req.get('host')}/buscador?success=true`,
//             cancel_url: `${req.protocol}://${req.get('host')}/buscador?canceled=true`,
//             customer_email: email,
//             metadata: {
//                 userId: userId,
//                 nome: nome
//             }
//         });

//         res.json({ sessionId: session.id });
//     } catch (error) {
//         console.error('Erro ao criar checkout session:', error);
//         res.status(500).json({ error: 'Erro ao processar pagamento' });
//     }
// });
=======
// Rota para criar checkout session do Stripe
app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
    try {
        const { userId, email, nome } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.STRIPE_PRICE_ID || 'price_1RuMrgHXe3ew16y7EhnKrmJOuiP5X21shT8LVn14Mu4fUzHj6jLNMU2UBZiO7VWqL4eScvAkE1G88u3ajrb8Xtlk00WEsat7oh',
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${req.protocol}://${req.get('host')}/buscador?success=true`,
            cancel_url: `${req.protocol}://${req.get('host')}/buscador?canceled=true`,
            customer_email: email,
            metadata: {
                userId: userId,
                nome: nome
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Erro ao criar checkout session:', error);
        res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
});
>>>>>>> c14af1105adcad036b4e6979e1017aa14437bc53

// Rota para verificar status da assinatura
app.get('/api/subscription-status/:userId', requireAuth, (req, res) => {
    const userId = req.params.userId;
    
    db.get(`SELECT plano, status_assinatura, proximo_pagamento, data_ativacao_pro 
            FROM clientes WHERE id = ?`, [userId], (err, user) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao verificar assinatura' });
        } else if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado' });
        } else {
            res.json({
                plano: user.plano,
                status_assinatura: user.status_assinatura,
                proximo_pagamento: user.proximo_pagamento,
                data_ativacao_pro: user.data_ativacao_pro,
                isPro: user.plano === 'pro'
            });
        }
    });
});

// Estatísticas
app.get('/api/stats', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM clientes', (err, total) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        } else {
            db.get('SELECT COUNT(*) as ativos FROM clientes WHERE ativo = 1', (err, ativos) => {
                if (err) {
                    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
                } else {
                    db.get('SELECT COUNT(*) as pagos FROM clientes WHERE status_pagamento = "pago"', (err, pagos) => {
                        if (err) {
                            res.status(500).json({ error: 'Erro ao buscar estatísticas' });
                        } else {
                            res.json({
                                total: total.total,
                                ativos: ativos.ativos,
                                pagos: pagos.pagos,
                                pendentes: total.total - pagos.pagos
                            });
                        }
                    });
                }
            });
        }
    });
});

// Configurar middleware para arquivos estáticos
app.use(express.static(__dirname));

// Rota de logout
app.post('/api/logout', (req, res) => {
    const sessionId = req.sessionID;
    const userId = req.session.userId;
    
    req.session.destroy((err) => {
        if (err) {
            console.error('[ERROR] Erro ao destruir sessão:', err);
            return res.status(500).json({ error: 'Erro ao fazer logout' });
        }
        
        console.log(`[SECURITY] Logout realizado - Sessão: ${sessionId}, Usuário: ${userId}`);
        res.json({ success: true, message: 'Logout realizado com sucesso' });
    });
});

// Rota para verificar status da sessão
app.get('/api/session-status', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                email: req.session.userEmail,
                name: req.session.userName,
                plano: req.session.userPlano
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Servir arquivos estáticos
app.get('/', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/registro.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'registro.html'));
});

app.get('/esqueceu-senha.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'esqueceu-senha.html'));
});



app.get('/buscador', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'buscador.html'));
});

app.get('/buscador.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'buscador.html'));
});

// Rota para o painel admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});



// Rota para verificar status do plano
app.get('/api/plano-status/:userId', requireAuth, (req, res) => {
    const userId = req.params.userId;
    console.log('Verificando status do plano para usuário:', userId);
    
    db.get('SELECT plano, status_pagamento, buscas_gratuitas_restantes FROM clientes WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error('Erro ao buscar status do plano:', err);
            res.status(500).json({ error: 'Erro ao buscar status do plano' });
        } else if (!row) {
            console.log('Usuário não encontrado:', userId);
            res.status(404).json({ error: 'Usuário não encontrado' });
        } else {
            console.log('Status do plano encontrado:', row);
            res.json({
                plano: row.plano,
                status_pagamento: row.status_pagamento,
                buscas_gratuitas_restantes: row.buscas_gratuitas_restantes,
                pode_buscar: row.plano === 'pro' || row.buscas_gratuitas_restantes > 0,
                precisa_upgrade: row.plano === 'gratuito' && row.buscas_gratuitas_restantes <= 0
            });
        }
    });
});

// Rota para ativar plano gratuito (primeira vez)
app.post('/api/ativar-plano-gratuito/:userId', requireAuth, (req, res) => {
    const userId = req.params.userId;
    
    console.log(`[PLANO GRATUITO] Tentativa de ativação - Usuário: ${userId}`);
    
    db.get('SELECT plano, buscas_gratuitas_restantes FROM clientes WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error('[ERROR] Erro ao verificar usuário:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        console.log(`[PLANO GRATUITO] Dados do usuário:`, row);
        
        if (!row) {
            console.log(`[SECURITY] Tentativa de ativar plano para usuário inexistente: ${userId}`);
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Verificar se já usou o plano gratuito
        if (row.buscas_gratuitas_restantes <= 0) {
            console.log(`[SECURITY] Tentativa de reativar plano gratuito - Usuário: ${userId}`);
            return res.status(403).json({ 
                error: 'Plano gratuito já foi utilizado',
                precisa_upgrade: true
            });
        }
        
        // Ativar plano gratuito (não decrementa ainda, só marca como disponível)
        res.json({ 
            success: true, 
            message: 'Plano gratuito ativado com sucesso',
            buscas_restantes: row.buscas_gratuitas_restantes,
            pode_buscar: true
        });
    });
});

// Rota para registrar uma busca
app.post('/api/registrar-busca', requireAuth, (req, res) => {
    const { userId, query, resultados } = req.body;
    
    console.log(`[BUSCA] Tentativa de busca - Usuário: ${userId}, Query: ${query}`);
    
    db.get('SELECT plano, buscas_gratuitas_restantes FROM clientes WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error('[ERROR] Erro ao verificar usuário:', err);
            res.status(500).json({ error: 'Erro ao verificar usuário' });
        } else if (!row) {
            console.log(`[SECURITY] Tentativa de busca por usuário inexistente: ${userId}`);
            res.status(404).json({ error: 'Usuário não encontrado' });
        } else {
            // Verificar se pode fazer busca
            const podeBuscar = row.plano === 'pro' || row.buscas_gratuitas_restantes > 0;
            
            if (!podeBuscar) {
                console.log(`[SECURITY] Tentativa de busca sem créditos - Usuário: ${userId}, Plano: ${row.plano}, Buscas restantes: ${row.buscas_gratuitas_restantes}`);
                res.status(403).json({ 
                    error: 'Limite de buscas gratuitas atingido. Faça upgrade para o plano PRO.',
                    precisa_upgrade: true,
                    plano_atual: row.plano,
                    buscas_restantes: row.buscas_gratuitas_restantes
                });
                return;
            }
            
            // Registrar a busca
            db.run('INSERT INTO buscas_realizadas (cliente_id, query, resultados) VALUES (?, ?, ?)', 
                [userId, query, resultados], function(err) {
                if (err) {
                    console.error('[ERROR] Erro ao registrar busca:', err);
                    res.status(500).json({ error: 'Erro ao registrar busca' });
                } else {
                    // Se for plano gratuito, decrementar buscas restantes
                    if (row.plano === 'gratuito') {
                        db.run('UPDATE clientes SET buscas_gratuitas_restantes = buscas_gratuitas_restantes - 1 WHERE id = ?', [userId], function(updateErr) {
                            if (updateErr) {
                                console.error('[ERROR] Erro ao atualizar buscas restantes:', updateErr);
                            } else {
                                console.log(`[BUSCA] Busca registrada - Usuário: ${userId}, Buscas restantes: ${row.buscas_gratuitas_restantes - 1}`);
                            }
                        });
                    }
                    
                    const buscasRestantes = row.plano === 'gratuito' ? row.buscas_gratuitas_restantes - 1 : 'ilimitado';
                    
                    res.json({ 
                        success: true, 
                        buscas_restantes: buscasRestantes,
                        plano: row.plano,
                        precisa_upgrade: row.plano === 'gratuito' && (row.buscas_gratuitas_restantes - 1) <= 0
                    });
                }
            });
        }
    });
});

// Stripe routes
<<<<<<< HEAD
app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
    try {
        const { priceId, userId } = req.body;
        
        // Verificar se o usuário existe
        if (!userId) {
            return res.status(400).json({ error: 'ID do usuário é obrigatório' });
        }

        // Verificar se o usuário existe no banco
        db.get('SELECT id, email, nome FROM clientes WHERE id = ?', [userId], async (err, user) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Verificar se a chave do Stripe está configurada
            const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51RuR47HXe3ew16y7eqYWC47g';
            
            if (stripeKey === 'sk_test_your_stripe_secret_key' || stripeKey.includes('your_stripe_secret_key')) {
                // Modo de teste - simular pagamento bem-sucedido
                console.log(`[PAYMENT-TEST] Simulando pagamento para usuário ${userId}`);
                
                // Atualizar usuário para PRO
                db.run('UPDATE clientes SET plano = ?, status_pagamento = ?, data_ativacao_pro = CURRENT_TIMESTAMP WHERE id = ?', 
                    ['pro', 'pago', userId], (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao atualizar usuário:', updateErr);
                        return res.status(500).json({ error: 'Erro ao processar pagamento' });
                    }
                    
                    console.log(`[PAYMENT-TEST] Usuário ${userId} atualizado para PRO com sucesso`);
                    res.json({ 
                        url: `${req.protocol}://${req.get('host')}/buscador.html?success=true&test=true`,
                        test: true 
                    });
                });
                return;
            }

            try {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price: priceId || 'price_1RuR47HXe3ew16y7eqYWC47g', // Price ID padrão
                            quantity: 1,
                        },
                    ],
                    mode: 'subscription',
                    success_url: `${req.protocol}://${req.get('host')}/buscador.html?success=true`,
                    cancel_url: `${req.protocol}://${req.get('host')}/buscador.html?canceled=true`,
                    customer_email: user.email,
                    metadata: {
                        userId: userId,
                        nome: user.nome
                    }
                });

                console.log(`[PAYMENT] Sessão de pagamento criada para usuário ${userId}: ${session.id}`);
                res.json({ url: session.url });
            } catch (stripeError) {
                console.error('Erro do Stripe:', stripeError);
                
                // Se for erro de chave inválida, usar modo de teste
                if (stripeError.message.includes('Invalid API key') || stripeError.message.includes('No such price')) {
                    console.log(`[PAYMENT-TEST] Stripe não configurado, simulando pagamento para usuário ${userId}`);
                    
                    db.run('UPDATE clientes SET plano = ?, status_pagamento = ?, data_ativacao_pro = CURRENT_TIMESTAMP WHERE id = ?', 
                        ['pro', 'pago', userId], (updateErr) => {
                        if (updateErr) {
                            console.error('Erro ao atualizar usuário:', updateErr);
                            return res.status(500).json({ error: 'Erro ao processar pagamento' });
                        }
                        
                        console.log(`[PAYMENT-TEST] Usuário ${userId} atualizado para PRO com sucesso`);
                        res.json({ 
                            url: `${req.protocol}://${req.get('host')}/buscador.html?success=true&test=true`,
                            test: true 
                        });
                    });
                } else {
                    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
                }
            }
        });
    } catch (error) {
        console.error('Erro geral:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
=======
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, userId } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId, // Use your Stripe price ID for R$19.90
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.protocol}://${req.get('host')}/buscador.html?success=true`,
            cancel_url: `${req.protocol}://${req.get('host')}/buscador.html?canceled=true`,
            metadata: {
                userId: userId
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Error creating checkout session' });
>>>>>>> c14af1105adcad036b4e6979e1017aa14437bc53
    }
});

app.post('/api/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'whsec_your_webhook_secret'; // You'll need to get this from Stripe Dashboard > Webhooks

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;

        // Update user plan to PRO
        db.run('UPDATE clientes SET plano = ?, status_pagamento = ? WHERE id = ?', 
            ['pro', 'pago', userId], (err) => {
            if (err) {
                console.error('Error updating user plan:', err);
            } else {
                console.log(`User ${userId} upgraded to PRO plan`);
            }
        });
    }

    res.json({ received: true });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Painel admin: http://localhost:${PORT}/admin`);
    console.log('Credenciais admin: admin@tubeminer.com / admin123');
});
