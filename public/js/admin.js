console.log("ADMIN CARREGADO");

async function carregarDados() {

    const resposta =
        await fetch("/admin/dados");

    const dados =
        await resposta.json();

    const tabela =
        document.getElementById("tabelaPresentes");

    tabela.innerHTML = "";

    dados.forEach(item => {

        tabela.innerHTML += `
            <tr>

                <td>${item.id}</td>

                <td>${item.nome}</td>

                <td>${item.telefone}</td>

                <td>${item.presente_id}</td>

                <td>${item.status}</td>

                <td>

                    <button
                        onclick="aprovar(${item.id})">
                        Aprovar
                    </button>

                    <button
                        onclick="cancelar(${item.id})">
                        Cancelar
                    </button>

                </td>

            </tr>
        `;
    });

}

async function aprovar(id) {

    await fetch(`/aprovar/${id}`);

    carregarDados();

}

async function cancelar(id) {

    await fetch(`/cancelar/${id}`);

    carregarDados();

}

carregarDados();