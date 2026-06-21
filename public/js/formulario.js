const params = new URLSearchParams(window.location.search);
const idPresente = params.get("presente");

console.log("ID recebido:", idPresente);

fetch("/data/presentes.json")
  .then(res => res.json())
  .then(presentes => {

    const presente = presentes.find(
      item => item.id === idPresente
    );

    console.log("Presente encontrado:", presente);

    if (!presente) {
      document.getElementById("titulo").innerText =
        "Presente não encontrado";
      return;
    }

    document.getElementById("titulo").innerText =
      `Você está prestes a presentear o casal com ${presente.nome}!`;

    document.getElementById("descricao").innerText =
      `No valor de: ${presente.preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}`;

    document
      .getElementById("btnPagamento")
      .addEventListener("click", async () => {

        const form = document.getElementById("formPresente");

        if (!form.reportValidity()) {
          return;
        }

        const nome =
          document.querySelector('[name="nome"]').value;

        const telefone =
          document.querySelector('[name="telefone"]').value;

        const mensagem =
          document.querySelector('[name="mensagem"]').value;

        try {
          const resposta = await fetch(
            "/salvar-formulario",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                nome,
                telefone,
                mensagem,
                presente_id: presente.id
              })
            }
          );

          const dados = await resposta.json();

          const urlPagamento =
            `/criar-pagamento/${presente.id}?registro=${dados.id}`;

          window.open(urlPagamento, "_blank");
        } catch (erro) {
          console.error("Erro ao salvar formulário:", erro);
          alert("Não foi possível salvar seus dados. Tente novamente.");
        }
      });
  })
  .catch(err => {
    console.error(err);
  });