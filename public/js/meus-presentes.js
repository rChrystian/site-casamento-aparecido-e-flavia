document.addEventListener('DOMContentLoaded', function () {

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (hamburgerBtn && navMenu) {

        hamburgerBtn.addEventListener('click', function () {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

    }

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', function (event) {
        const isClickInsideNav = event.target.closest('nav');

        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    async function buscarPresentes() {

        const telefone =
            document.getElementById("telefone").value.trim();

        if (!telefone) {
            alert("Digite um telefone.");
            return;
        }

        try {

            const resposta =
                await fetch(`/meus-presentes/${telefone}`);

            const presentes =
                await resposta.json();

            const respostaJson =
                await fetch("/data/presentes.json");

            const catalogo =
                await respostaJson.json();

            const container =
                document.getElementById("resultado");

            container.innerHTML = "";

            if (presentes.length === 0) {

                container.innerHTML = `
                    <p>Nenhum presente encontrado.</p>
                `;

                return;
            }

            presentes.forEach(item => {

                const info = catalogo.find(
                    p => p.id === item.presente_id
                );

                let status = "🟡 Pendente";

                if (item.status === "aprovado") {
                    status = "🔴 Presenteado ❤️";
                }

                if (item.status === "cancelado") {
                    status = "⚫ Cancelado";
                }

                container.innerHTML += `
                    <div class="presente-card">

                        <h2>
                            ${info?.nome || item.presente_id}
                        </h2>

                        <p>
                            <strong>Status:</strong> ${status}
                        </p>

                        <p>
                            <strong>Sua mensagem:</strong>
                            "${item.mensagem || "Nenhuma mensagem"}"
                        </p>

                    </div>
                `;
            });

        } catch (erro) {

            console.error(erro);

            document.getElementById("resultado").innerHTML = `
                <p>Erro ao buscar presentes.</p>
            `;
        }

    }

    const btnBuscar =
        document.getElementById("btnBuscar");

    if (btnBuscar) {
        btnBuscar.addEventListener("click", buscarPresentes);
    }

    const inputTelefone =
        document.getElementById("telefone");

    if (inputTelefone) {

        inputTelefone.addEventListener("keydown", function (e) {

            if (e.key === "Enter") {
                buscarPresentes();
            }

        });

    }

});