require("dotenv").config();

const db = require("./database");
const express = require("express");
const path = require("path");
const fs = require("fs");
const basicAuth = require("express-basic-auth");

const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
const PORT = 3000;
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

app.post("/salvar-formulario", (req, res) => {

    const {
        nome,
        telefone,
        mensagem,
        presente_id
    } = req.body;

    db.run(
        `
        INSERT INTO presentes
        (nome, telefone, mensagem, presente_id)
        VALUES (?, ?, ?, ?)
        `,
        [nome, telefone, mensagem, presente_id],
        function (err) {

            if (err) {
                console.error(err);
                return res.status(500).send("Erro ao salvar");
            }

            res.json({
                sucesso: true,
                id: this.lastID
            });
        }
    );
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
                ]
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

app.get("/cancelar/:id", adminAuth, (req, res) => {

    db.run(
        `
        UPDATE presentes
        SET status = 'cancelado'
        WHERE id = ?
        `,
        [req.params.id],
        function(err) {

            if (err) {
                return res.status(500).send("Erro");
            }

            res.send("Cancelado!");
        }
    );

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

app.get("/admin/dados", adminAuth, (req, res) => {

    db.all(
        `
        SELECT *
        FROM presentes
        ORDER BY data DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json([]);
            }

            res.json(rows);
        }
    );

});

app.get("/cancelar/:id", (req, res) => {

    db.run(
        `
        UPDATE presentes
        SET status = 'cancelado'
        WHERE id = ?
        `,
        [req.params.id],
        function(err) {

            if (err) {
                return res.status(500).send("Erro");
            }

            res.send("Cancelado");
        }
    );

});

app.get("/presentes-comprados", (req, res) => {

    db.all(
        `
        SELECT presente_id, status
        FROM presentes
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json([]);
            }

            res.json(rows);
        }
    );

});

app.get("/aprovar/:id", adminAuth, (req, res) => {

    db.run(
        `
        UPDATE presentes
        SET status = 'aprovado'
        WHERE id = ?
        `,
        [req.params.id],
        function (err) {

            if (err) {
                console.error(err);
                return res.status(500).send("Erro");
            }

            res.send("Aprovado!");
        }
    );

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

app.get("/meus-presentes/:telefone", (req, res) => {

    db.all(
        `
        SELECT *
        FROM presentes
        WHERE telefone = ?
        ORDER BY data DESC
        `,
        [req.params.telefone],
        (err, rows) => {

            if (err) {
                return res.status(500).json([]);
            }

            res.json(rows);
        }
    );

});

app.get("/mensagens-mural", (req, res) => {

    db.all(
        `
        SELECT nome, mensagem
        FROM presentes
        WHERE status = 'aprovado'
        AND mensagem IS NOT NULL
        AND mensagem != ''
        ORDER BY data DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json([]);
            }

            res.json(rows);
        }
    );

});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});