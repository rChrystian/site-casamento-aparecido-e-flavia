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

    function atualizarContador() {
        const dataDestino = new Date('2027-04-03T00:00:00').getTime();
        const agora = new Date().getTime();
        const diferenca = dataDestino - agora;

        if (diferenca > 0) {
            const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

            document.getElementById('dias').textContent = dias;
            document.getElementById('horas').textContent = horas;
            document.getElementById('minutos').textContent = minutos;
            document.getElementById('segundos').textContent = segundos;
        } else {
            document.getElementById('dias').textContent = '0';
            document.getElementById('horas').textContent = '0';
            document.getElementById('minutos').textContent = '0';
            document.getElementById('segundos').textContent = '0';
        }
    }

    atualizarContador();

    setInterval(atualizarContador, 1000);
});

const slides = document.querySelectorAll(".carousel-slide");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let currentSlide = 0;

function mostrarSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");
}

if (slides.length > 0) {

  nextBtn.addEventListener("click", () => {
    currentSlide++;
    
    if (currentSlide >= slides.length) {
      currentSlide = 0;
    }

    mostrarSlide(currentSlide);
  });

  prevBtn.addEventListener("click", () => {
    currentSlide--;

    if (currentSlide < 0) {
      currentSlide = slides.length - 1;
    }

    mostrarSlide(currentSlide);
  });

  setInterval(() => {
    currentSlide++;

    if (currentSlide >= slides.length) {
      currentSlide = 0;
    }

    mostrarSlide(currentSlide);
  }, 4000);
}