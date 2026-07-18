(() => {
  'use strict';

  const nav = document.querySelector('nav');
  const menuBtn = document.querySelector('nav button');
  const menu = document.getElementById('mobile-menu');

  // Nav transparente no topo, sólida depois que rola. A página é escura, então a
  // nav sólida é escura também — links e logo ficam claros o tempo todo.
  function onScroll() {
    const scrolled = window.scrollY > 20;
    nav.classList.toggle('bg-zinc-950/80', scrolled);
    nav.classList.toggle('backdrop-blur-md', scrolled);
    nav.classList.toggle('shadow-md', scrolled);
    nav.classList.toggle('py-3', scrolled);
    nav.classList.toggle('bg-transparent', !scrolled);
    nav.classList.toggle('py-5', !scrolled);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menu mobile
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => menu.classList.toggle('hidden'));
    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => menu.classList.add('hidden'))
    );
  }

  // Scroll reveal — reproduz o que o framer-motion fazia no bundle original.
  const revealables = document.querySelectorAll('.reveal');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  // Rolagem suave nas âncoras, descontando a altura da nav fixa
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      ev.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Campos de filhos: só aparecem quando a idade é "Criança" (máximo de 3)
  const idade = document.getElementById('idade');
  const modalidade = document.getElementById('modalidade');
  const filhosWrap = document.getElementById('filhos-wrap');
  const filhosLista = document.getElementById('filhos-lista');
  const addFilho = document.getElementById('add-filho');
  const MAX_FILHOS = 3;

  const nomesFilhos = () =>
    Array.from(filhosLista.querySelectorAll('[data-filho]'))
      .map((el) => el.value.trim())
      .filter(Boolean);

  if (idade && filhosWrap && filhosLista && addFilho) {
    idade.addEventListener('change', () => {
      const ehCrianca = idade.value === 'Criança';
      filhosWrap.classList.toggle('hidden', !ehCrianca);
      // Só é obrigatório enquanto o bloco está visível, senão trava o envio escondido
      filhosLista.querySelectorAll('[data-filho]').forEach((el, i) => {
        el.required = ehCrianca && i === 0;
      });
      // Criança só tem uma turma: trava a modalidade em Infantil.
      // Adulto não pode escolher Infantil, então a opção some da lista.
      if (modalidade) {
        const opInfantil = modalidade.querySelector('[value="Infantil"]');
        const adultas = modalidade.querySelectorAll('option:not([value="Infantil"])');

        if (ehCrianca) {
          modalidade.value = 'Infantil';
        } else if (modalidade.value === 'Infantil') {
          modalidade.value = '';
        }
        if (opInfantil) {
          opInfantil.hidden = !ehCrianca;
          // hidden sozinho não impede a seleção por teclado em todo navegador
          opInfantil.disabled = !ehCrianca;
        }
        // As turmas de adulto só fazem sentido para adulto
        adultas.forEach((op) => {
          if (!op.value) return; // mantém o placeholder
          op.hidden = ehCrianca;
          op.disabled = ehCrianca;
        });
        modalidade.disabled = ehCrianca;
        modalidade.classList.toggle('opacity-60', ehCrianca);
        modalidade.classList.toggle('cursor-not-allowed', ehCrianca);
      }
    });

    addFilho.addEventListener('click', () => {
      const total = filhosLista.querySelectorAll('[data-filho]').length;
      if (total >= MAX_FILHOS) return;
      const campo = filhosLista.firstElementChild.cloneNode(true);
      campo.id = `filho-${total + 1}`;
      campo.value = '';
      campo.required = false;
      campo.placeholder = `Nome do filho(a) ${total + 1}`;
      filhosLista.appendChild(campo);
      addFilho.disabled = filhosLista.querySelectorAll('[data-filho]').length >= MAX_FILHOS;
    });
  }

  // Formulário -> WhatsApp (não há backend aqui)
  const form = document.querySelector('#contact form');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const v = (id) => (document.getElementById(id) || {}).value || '';
      const filhos = filhosLista && !filhosWrap.classList.contains('hidden') ? nomesFilhos() : [];
      // "meu filho" no singular, "meus filhos" quando há mais de um
      const paraQuem = filhos.length
        ? ` para ${filhos.length > 1 ? 'os meus filhos' : 'o meu filho(a)'} ${filhos.join(', ')}`
        : '';
      const texto =
        `Olá! Quero agendar uma aula experimental${paraQuem}. ` +
        `Me chamo: ${v('nome')}, Modalidade: ${v('modalidade')}`;
      const tel = form.dataset.whatsapp || '5582991637133';
      window.open(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`, '_blank');
    });
  }
})();
