document.addEventListener("DOMContentLoaded", function () {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-menu a");

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", function () {
            hamburgerBtn.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", function () {
            hamburgerBtn.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });

    document.addEventListener("click", function (event) {
        const isClickInsideNav = event.target.closest("nav");

        if (!isClickInsideNav && navMenu.classList.contains("active")) {
            hamburgerBtn.classList.remove("active");
            navMenu.classList.remove("active");
        }
    });

    (async () => {
        const container = document.getElementById("listaPresentes");

        try {
            const respostaPresentes = await fetch("/data/presentes.json");
            const presentes = await respostaPresentes.json();

            const respostaStatus = await fetch("/presentes-comprados");
            const statusPresentes = await respostaStatus.json();

            presentes.forEach((presente) => {
                const registros = statusPresentes.filter(
                    (item) => item.presente_id === presente.id
                );

                const aprovado = registros.some(
                    (item) => item.status === "aprovado"
                );

                const pendente = registros.some(
                    (item) => item.status === "pendente"
                );

                let botaoHtml = `
          <button onclick="window.location.href='/formulario?presente=${presente.id}'">
            Escolher presente
          </button>
        `;

                if (aprovado) {
                    botaoHtml = `
    <button disabled class="btn-comprado">
      Já presenteado ❤️
    </button>
  `;
                }
                else if (pendente) {
                    botaoHtml = `
    <button disabled class="btn-pendente">
      Pendente de confirmação
    </button>
  `;
                }

                const card = document.createElement("div");

                card.classList.add("presente-card");

                card.innerHTML = `
          <img src="${presente.imagem}" alt="${presente.nome}">
          <h1>${presente.nome}</h1>

          <p>
            ${presente.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                })}
          </p>

          ${botaoHtml}
        `;

                container.appendChild(card);
            });
        } catch (erro) {
            console.error("Erro ao carregar presentes:", erro);

            container.innerHTML = `
        <p>Não foi possível carregar a lista de presentes.</p>
      `;
        }
    })();
});