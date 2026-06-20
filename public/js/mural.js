document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (hamburgerBtn && navMenu) {

    hamburgerBtn.addEventListener('click', function() {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

}

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', function(event) {
        const isClickInsideNav = event.target.closest('nav');
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

(async () => {

  const resposta =
    await fetch("/mensagens-mural");

  const mensagens =
    await resposta.json();

  const mural =
    document.getElementById("mural");

  mensagens.forEach(item => {

    mural.innerHTML += `
      <div class="mensagem-card">

        <h3>${item.nome}</h3>

        <p>
          "${item.mensagem}"
        </p>

      </div>
    `;
  });

})();
});