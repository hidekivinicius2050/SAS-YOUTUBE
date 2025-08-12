const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.get('SELECT * FROM clientes WHERE email = ?', ['teste123@gmail.com'], (err, row) => {
  if (err) {
    console.error('Erro:', err);
  } else {
    console.log('Usuário encontrado:');
    console.log('ID:', row.id);
    console.log('Nome:', row.nome);
    console.log('Email:', row.email);
    console.log('Plano:', row.plano);
    console.log('Status Pagamento:', row.status_pagamento);
    console.log('Buscas Gratuitas Restantes:', row.buscas_gratuitas_restantes);
    console.log('Ativo:', row.ativo);
  }
  db.close();
});

<<<<<<< HEAD

=======
>>>>>>> c14af1105adcad036b4e6979e1017aa14437bc53
