/* script.js
   - Robust typing effect
   - Theme toggle with persistence
   - Reveal animations using IntersectionObserver
   - Projects: default demo projects (placeholders), Check modal, Add Project form (file or URL), localStorage persistence
*/

(() => {
  /* ------------------ Utilities ------------------ */
  const themeKey = 'portfolio-theme-v3';
  const projectsKey = 'portfolio-projects-v3';

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  /* ------------------ Theme ------------------ */
  const themeBtn = qs('#theme-toggle');
  function applyTheme(isDark) {
    document.body.classList.toggle('dark', !!isDark);
    if (themeBtn) {
      themeBtn.textContent = isDark ? '☀️' : '🌙';
      themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }
  }
  function initTheme() {
    const saved = localStorage.getItem(themeKey);
    if (saved === 'dark') applyTheme(true);
    else if (saved === 'light') applyTheme(false);
    else {
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefers);
    }
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isNowDark = !document.body.classList.contains('dark');
      applyTheme(isNowDark);
      localStorage.setItem(themeKey, isNowDark ? 'dark' : 'light');
    });
  }

  /* ------------------ Typing animation ------------------ */
  const typingEl = qs('#typing');
  const words = ["Shivam Kumar", "a Web Developer", "a Full Stack Engineer", "a Data Enthusiast"];
  let wi = 0, ci = 0, deleting = false;
  function typeTick() {
    if (!typingEl) return;
    const current = words[wi];
    if (!deleting) {
      ci = Math.min(current.length, ci + 1);
      typingEl.textContent = current.slice(0, ci);
    } else {
      ci = Math.max(0, ci - 1);
      typingEl.textContent = current.slice(0, ci);
    }

    let delay = deleting ? 45 : 110;
    if (!deleting && ci === current.length) { deleting = true; delay = 1300; }
    else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { typingEl.textContent = words[0]; qs('.cursor').style.animation = 'none'; return; }

    setTimeout(typeTick, delay);
  }

  /* ------------------ Reveal on scroll ------------------ */
  function setupReveal() {
    if (!('IntersectionObserver' in window)) {
      qsa('.reveal, .reveal-item').forEach(el => el.classList.add('active'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains('reveal-group')) {
          const children = qsa('.reveal-item', el);
          children.forEach((child, idx) => {
            child.style.transitionDelay = `${idx * 80}ms`;
            child.classList.add('active');
          });
          el.classList.add('active');
        } else if (el.classList.contains('reveal-item')) {
          const parentGroup = el.closest('.reveal-group');
          if (!parentGroup) el.classList.add('active');
        } else {
          el.classList.add('active');
        }
        obs.unobserve(el);
      });
    }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    qsa('.reveal, .reveal-group, .reveal-item').forEach(node => observer.observe(node));
  }

  /* ------------------ Placeholder image generator (data URI SVG) ------------------ */
  function makePlaceholder(title = 'Project', bg = '#2563eb', fg = '#ffffff') {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='${bg}' /><text x='50%' y='50%' dy='.35em' font-family='Poppins,system-ui' font-weight='600' font-size='44' fill='${fg}' text-anchor='middle'>${escapeXml(title)}</text></svg>`;
    return 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svg);
  }
  function escapeXml(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ------------------ Projects: data & render ------------------ */
  const demoProjects = [
    { id: genId(), title: 'Full Stack Java App', desc: 'CRUD web application built using Java Spring Boot and React.', link: '#', image: makePlaceholder('Full Stack Java') },
    { id: genId(), title: 'Restaurant Site', desc: 'Frontend project using pure HTML & CSS.', link: 'https://shivamkr01.github.io/restaurant-site/', image: makePlaceholder('Restaurant') },
    { id: genId(), title: 'Academy Site', desc: 'Frontend project using pure HTML & CSS.', link: 'https://shivamkr01.github.io/acedemy_site.github.io/', image: makePlaceholder('Academy') }
  ];

  function genId() { return Math.random().toString(36).slice(2, 9); }

  function loadProjects() {
    try {
      const raw = localStorage.getItem(projectsKey);
      if (!raw) return demoProjects.slice();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return demoProjects.slice();
      return parsed;
    } catch (e) {
      console.warn('Failed to parse projects from storage, using demo', e);
      return demoProjects.slice();
    }
  }

  function saveProjects(list) {
    try { localStorage.setItem(projectsKey, JSON.stringify(list)); }
    catch (e) { console.warn('Could not save projects', e); }
  }

  const projectGrid = qs('#project-grid');
  let projects = loadProjects();

  function renderProjects() {
    if (!projectGrid) return;
    projectGrid.innerHTML = '';
    projects.forEach(p => projectGrid.appendChild(createCard(p)));
  }

  function createCard(p) {
    const article = document.createElement('article');
    article.className = 'project-card reveal-item';
    article.dataset.id = p.id;

    const img = document.createElement('img');
    img.className = 'project-thumb';
    img.src = p.image || makePlaceholder(p.title);
    img.alt = p.title;

    const body = document.createElement('div');
    body.className = 'project-body';

    const h3 = document.createElement('h3'); h3.textContent = p.title;
    const pdesc = document.createElement('p'); pdesc.textContent = p.desc;

    const actions = document.createElement('div'); actions.className = 'project-actions';
    const view = document.createElement('a'); view.className = 'btn small'; view.textContent = 'View'; view.href = p.link || '#'; view.target = '_blank'; view.rel = 'noopener';
    const check = document.createElement('button'); check.className = 'btn small outline'; check.textContent = 'Check'; check.type = 'button';
    check.addEventListener('click', () => openModal(p.id));

    actions.appendChild(view);
    actions.appendChild(check);

    body.appendChild(h3);
    body.appendChild(pdesc);
    body.appendChild(actions);

    article.appendChild(img);
    article.appendChild(body);

    return article;
  }

  /* ------------------ Modal (Check) ------------------ */
  const modalOverlay = qs('#modal-overlay');
  const modalClose = qs('#modal-close');
  const modalImage = qs('#modal-image');
  const modalTitle = qs('#modal-title');
  const modalDesc = qs('#modal-desc');
  const modalLink = qs('#modal-link');

  function openModal(id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    modalImage.src = p.image || makePlaceholder(p.title);
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;
    modalLink.href = p.link || '#';
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    // focus for accessibility
    modalClose.focus();
  }
  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
  }
  modalClose && modalClose.addEventListener('click', closeModal);
  modalOverlay && modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  /* ------------------ Add Project modal + form ------------------ */
  const addOverlay = qs('#add-overlay');
  const openAdd = qs('#open-add');
  const addClose = qs('#add-close');
  const addCancel = qs('#add-cancel');
  const addForm = qs('#add-project-form');

  function openAddModal() {
    addOverlay.classList.add('open');
    addOverlay.setAttribute('aria-hidden', 'false');
    qs('input[name="title"]', addForm).focus();
  }
  function closeAddModal() {
    addOverlay.classList.remove('open');
    addOverlay.setAttribute('aria-hidden', 'true');
    addForm.reset();
  }
  openAdd && openAdd.addEventListener('click', openAddModal);
  addClose && addClose.addEventListener('click', closeAddModal);
  addCancel && addCancel.addEventListener('click', closeAddModal);
  addOverlay && addOverlay.addEventListener('click', (e) => { if (e.target === addOverlay) closeAddModal(); });

  addForm && addForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const title = (form.title.value || '').trim();
    const desc = (form.desc.value || '').trim();
    const link = (form.link.value || '').trim();
    const imageURL = (form.imageURL.value || '').trim();
    const fileInput = form.imageFile;
    if (!title || !desc) {
      alert('Please provide title and description.');
      return;
    }

    // handle file if provided
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const newP = { id: genId(), title, desc, link, image: dataUrl };
        projects.unshift(newP);
        saveProjects(projects);
        renderProjects();
        // animate the newly added item (stagger)
        setTimeout(() => {
          const item = qs(`.project-card[data-id="${newP.id}"]`);
          if (item) item.classList.add('active');
        }, 50);
        closeAddModal();
      };
      reader.readAsDataURL(file);
    } else if (imageURL) {
      const newP = { id: genId(), title, desc, link, image: imageURL };
      projects.unshift(newP);
      saveProjects(projects);
      renderProjects();
      setTimeout(() => {
        const item = qs(`.project-card[data-id="${newP.id}"]`);
        if (item) item.classList.add('active');
      }, 50);
      closeAddModal();
    } else {
      const newP = { id: genId(), title, desc, link, image: makePlaceholder(title) };
      projects.unshift(newP);
      saveProjects(projects);
      renderProjects();
      setTimeout(() => {
        const item = qs(`.project-card[data-id="${newP.id}"]`);
        if (item) item.classList.add('active');
      }, 50);
      closeAddModal();
    }
  });

  /* ------------------ Keyboard accessibility ------------------ */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (addOverlay && addOverlay.classList.contains('open')) closeAddModal();
      if (modalOverlay && modalOverlay.classList.contains('open')) closeModal();
    }
  });

  /* ------------------ Profile picture default ------------------ */
  const profilePicEl = qs('#profile-pic');
  if (profilePicEl) {
    // if user has a profile.jpg in folder, browser will load it; otherwise use placeholder
    const testImg = new Image();
    testImg.onload = () => { profilePicEl.src = 'profile.jpg'; };
    testImg.onerror = () => { profilePicEl.src = makePlaceholder('Shivam', '#111827', '#fff'); };
    testImg.src = 'profile.jpg';
  }

  /* ------------------ Init ------------------ */
  function init() {
    initTheme();
    renderProjects();
    setupReveal();
    typeTick();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
