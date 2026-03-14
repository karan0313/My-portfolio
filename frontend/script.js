/* ═══════════════════════════════════════
   KARAN GANESAN PORTFOLIO — script.js
   Connects to Express + MySQL backend
═══════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────────────
// Change this to your backend URL when deployed
const API_BASE = 'http://localhost:3000';

// ── LOADER ───────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1800);
});

// ── CURSOR ───────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  setTimeout(() => {
    follower.style.left = e.clientX + 'px';
    follower.style.top  = e.clientY + 'px';
  }, 80);
});

document.querySelectorAll('a, button, .service-card, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => follower.style.transform = 'translate(-50%,-50%) scale(1.6)');
  el.addEventListener('mouseleave', () => follower.style.transform = 'translate(-50%,-50%) scale(1)');
});

// ── HEADER SCROLL ────────────────────────────────────────
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  header.classList.toggle('scrolled', window.scrollY > 50);
  highlightNav();
});

// ── MOBILE NAV ───────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
  });
});

// ── ACTIVE NAV HIGHLIGHT ─────────────────────────────────
function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollY = window.scrollY + 120;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}

// ── TYPEWRITER ────────────────────────────────────────────
const texts = [
  'Java Full Stack Apps.',
  'REST APIs with Spring.',
  'Responsive UIs.',
  'Database Solutions.',
  'Clean, Scalable Code.'
];
let tIdx = 0, cIdx = 0, deleting = false;
const twEl = document.getElementById('typewriter');

function typeWriter() {
  const current = texts[tIdx];
  if (!deleting) {
    twEl.textContent = current.slice(0, ++cIdx);
    if (cIdx === current.length) {
      deleting = true;
      return setTimeout(typeWriter, 1800);
    }
  } else {
    twEl.textContent = current.slice(0, --cIdx);
    if (cIdx === 0) {
      deleting = false;
      tIdx = (tIdx + 1) % texts.length;
    }
  }
  setTimeout(typeWriter, deleting ? 60 : 100);
}
setTimeout(typeWriter, 2000);

// ── RESUME TABS ───────────────────────────────────────────
document.querySelectorAll('.rtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rtab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── SCROLL REVEAL ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.service-card, .project-card, .tl-item, .skill-item, .cinfo-item, .info-row'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ── CONTACT FORM → MySQL Backend ─────────────────────────
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const statusEl   = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name:    form.name.value.trim(),
    email:   form.email.value.trim(),
    phone:   form.phone.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim()
  };

  // Basic validation
  if (!data.name || !data.email || !data.subject || !data.message) {
    showStatus('Please fill in all required fields.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Sending...</span><i class="bx bx-loader-alt bx-spin"></i>';
  statusEl.textContent = '';
  statusEl.className = 'form-status';

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok && result.success) {
      showStatus('✓ Message sent! I\'ll get back to you shortly.', 'success');
      form.reset();
    } else {
      showStatus(result.message || 'Something went wrong. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Form submit error:', err);
    showStatus('⚠ Could not connect to server. Please email me directly.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Send Message</span><i class="bx bx-send"></i>';
  }
});

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className   = 'form-status ' + type;
}

// ── SMOOTH SCROLL ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});