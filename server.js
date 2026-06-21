require("dotenv").config();

const db = require("./database");
(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS presentes (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                telefone TEXT NOT NULL,
                mensagem TEXT,
                presente_id TEXT NOT NULL,
                status TEXT DEFAULT 'pendente',
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    } catch (err) {

        console.error(err);
    }
    
})();

const express = require("express");
const path = require("path");
const fs = require("fs");
const basicAuth = require("express-basic-auth");

const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
const PORT = process.env.PORT || 3000
const adminAuth = basicAuth({
    users: {
        admin: "casamento123"
    },
    challenge: true
});

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

console.log("Mercado Pago conectado!");


app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

app.get("/lista", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "lista.html"));
});

app.get("/mural", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "mural.html"));
});

app.get("/formulario", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "formulario.html"));
});

app.get("/pagamento", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "pagamento.html"));
});

app.post("/salvar-formulario", async (req, res) => {

    const {
        nome,
        telefone,
        mensagem,
        presente_id
    } = req.body;

    try {

        const resultado = await db.query(
            `
            INSERT INTO presentes
            (nome, telefone, mensagem, presente_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            `,
            [nome, telefone, mensagem, presente_id]
        );

        res.json({
            sucesso: true,
            id: resultado.rows[0].id
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Erro ao salvar");

    }

});

// MERCADO PAGO
app.get("/criar-pagamento/:id", async (req, res) => {

    const registroId = req.query.registro;

    try {

        const presentes = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, "public", "data", "presentes.json"),
                "utf8"
            )
        );

        const presente = presentes.find(
            p => p.id === req.params.id
        );

        if (!presente) {
            return res.status(404).send("Presente não encontrado");
        }

        const resposta = await preference.create({
            body: {
                external_reference: String(registroId),

                items: [
                    {
                        title: presente.nome,
                        quantity: 1,
                        currency_id: "BRL",
                        unit_price: Number(presente.preco)
                    }
                ],
            }
        });

        console.log(resposta);
        console.log(JSON.stringify(resposta, null, 2));
        console.log("Presente:", presente);
        console.log("Preço:", presente.preco);
        console.log("Tipo:", typeof presente.preco);
        res.redirect(resposta.init_point);

    } catch (erro) {

        console.error("ERRO MP:");
        console.error(erro);

        res.status(500).send("Erro ao gerar pagamento");
    }
});

app.get("/sucesso", (req, res) => {

    res.send(`
        <h1>Pagamento aprovado!</h1>
        <p>Obrigado pelo presente ❤️</p>
        <a href="/">Voltar ao início</a>
    `);

});

app.get("/falha", (req, res) => {

    res.send(`
        <h1>Pagamento recusado</h1>
        <a href="/">Voltar</a>
    `);

});

app.get("/pendente", (req, res) => {

    res.send(`
        <h1>Pagamento pendente</h1>
        <p>Estamos aguardando a confirmação do pagamento.</p>
        <a href="/">Voltar</a>
    `);

});

app.get("/cancelar/:id", adminAuth, async (req, res) => {
    try {
        await db.query(
            `
            UPDATE presentes
            SET status = 'cancelado'
            WHERE id = $1
            `,
            [req.params.id]
        );

        res.send("Cancelado!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro");
    }
});

app.get("/admin", adminAuth, (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "views",
            "admin.html"
        )
    );

});

app.get("/admin/dados", adminAuth, async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT *
            FROM presentes
            ORDER BY data DESC
        `);

        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

app.get("/presentes-comprados", async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT presente_id, status
            FROM presentes
        `);

        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

app.get("/aprovar/:id", adminAuth, async (req, res) => {
    try {
        await db.query(
            `
            UPDATE presentes
            SET status = 'aprovado'
            WHERE id = $1
            `,
            [req.params.id]
        );

        res.send("Aprovado!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro");
    }
});

app.get("/meus-presentes", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "views",
            "meus-presentes.html"
        )
    );
});

app.get("/meus-presentes/:telefone", async (req, res) => {
    try {
        const resultado = await db.query(
            `
            SELECT *
            FROM presentes
            WHERE telefone = $1
            ORDER BY data DESC
            `,
            [req.params.telefone]
        );

        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

app.get("/mensagens-mural", async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT nome, mensagem
            FROM presentes
            WHERE status = 'aprovado'
            AND mensagem IS NOT NULL
            AND mensagem != ''
            ORDER BY data DESC
        `);

        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});