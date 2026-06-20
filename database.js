const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./casamento.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Banco conectado!");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS presentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefone TEXT NOT NULL,
            mensagem TEXT,
            presente_id TEXT NOT NULL,
            status TEXT DEFAULT 'pendente',
            data DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;