const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const nav = $('#nav'), links = $('#links');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
$('#burger').addEventListener('click', () => links.classList.toggle('open'));
$$('#links a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

const giant = $('#giantText');
if (!reduced) {
  addEventListener('scroll', () => {
    giant.style.transform = `translateX(${-scrollY * 0.6}px)`;
  }, { passive: true });
}

const cards = $('#cards');
const step = () => (cards.firstElementChild?.offsetWidth || 340) + 24;
$('#next').addEventListener('click', () => cards.scrollBy({ left: step(), behavior: 'smooth' }));
$('#prev').addEventListener('click', () => cards.scrollBy({ left: -step(), behavior: 'smooth' }));

const steps = $$('.step'), dots = $$('.dots i'), proc = $('#process');
function setStep(i) {
  steps.forEach((s, n) => s.classList.toggle('on', n === i));
  dots.forEach((d, n) => d.classList.toggle('on', n === i));
}
steps.forEach((s, i) => s.addEventListener('click', () => setStep(i)));
dots.forEach((d, i) => d.addEventListener('click', () => setStep(i)));


const targets = $$('.title, .lead, .about-body, .cols');
targets.forEach(t => t.classList.add('reveal'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
targets.forEach(t => io.observe(t));

// Portrait: fade in kapag nakikita, fade out kapag hindi na
const portrait = document.querySelector('.portrait');
const heroEl = document.querySelector('#top');
if (portrait && heroEl) {
  new IntersectionObserver(entries => {
    entries.forEach(e => portrait.classList.toggle('show', e.isIntersecting));
  }, { threshold: 0.35 }).observe(heroEl);
}

// Sync the side image with the active step
const sideImg = document.querySelector('.side');
const syncSide = () => {
  sideImg.dataset.step = steps.findIndex(s => s.classList.contains('on'));
};
new MutationObserver(syncSide).observe(proc, { subtree: true, attributes: true, attributeFilter: ['class'] });
syncSide();

// crossfadeLayers: one layer per step, fading between them
(() => {
  const side = document.querySelector('.side');
  const stepEls = [...document.querySelectorAll('.step')];
  const sources = [
    'assets/images/define.jpg',
    'assets/images/design.avif',
    'assets/images/deliver.jpg'
  ];
  side.innerHTML = '';
  const layers = sources.map(src => {
    const d = document.createElement('div');
    d.className = 'layer';
    d.style.backgroundImage = `url("${src}")`;
    side.appendChild(d);
    return d;
  });
  const update = () => {
    const i = Math.max(0, stepEls.findIndex(s => s.classList.contains('on')));
    layers.forEach((l, n) => l.classList.toggle('on', n === i));
  };
  new MutationObserver(update).observe(document.querySelector('.steps'), {
    subtree: true, attributes: true, attributeFilter: ['class']
  });
  update();
})();




// Sound Wave & Background Music
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');

if (musicToggle && bgMusic) {
  const START_TIME = 47; // Simula sa 0:47
  let hasStarted = false;
  let canPlayNow = false;

  // I-load agad ang track para ready
  bgMusic.load();

  // Pagkatapos ng 3 segundo, i-enable ang audio play
  setTimeout(() => {
    canPlayNow = true;
    attemptPlay();
  }, 3000);

  function attemptPlay() {
    if (hasStarted || !canPlayNow) return;

    if (bgMusic.currentTime < START_TIME) {
      bgMusic.currentTime = START_TIME;
    }

    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        hasStarted = true;
        musicToggle.classList.add('playing');
        removeInteractionListeners();
      }).catch(() => {
        // Hinarang ng browser: hintayin ang unang galaw o click ng user
      });
    }
  }

  function handleInteraction() {
    if (!hasStarted && canPlayNow) {
      attemptPlay();
    } else if (!hasStarted && !canPlayNow) {
      // Kung nag-interact bago matapos ang 3s, hintayin pa rin o i-play agad pagka-3s
    }
  }

  // Makikinig sa scroll, click, pointer/mouse movement para ma-unlock ang audio
  ['click', 'scroll', 'touchstart', 'mousemove', 'keydown'].forEach(evt => {
    window.addEventListener(evt, handleInteraction, { passive: true });
  });

  function removeInteractionListeners() {
    ['click', 'scroll', 'touchstart', 'mousemove', 'keydown'].forEach(evt => {
      window.removeEventListener(evt, handleInteraction);
    });
  }

  // Manual Toggle (Play / Pause Button)
  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    canPlayNow = true;

    if (bgMusic.paused) {
      if (bgMusic.currentTime < START_TIME) {
        bgMusic.currentTime = START_TIME;
      }
      bgMusic.play().then(() => {
        musicToggle.classList.add('playing');
        hasStarted = true;
        removeInteractionListeners();
      }).catch(err => console.warn(err));
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });

  // Loop pabalik sa 0:47
  bgMusic.addEventListener('ended', () => {
    bgMusic.currentTime = START_TIME;
    bgMusic.play();
  });
}

// Prevent image drag at right-click save
document.addEventListener("dragstart", (e) => {
  if (e.target.nodeName === "IMG") {
    e.preventDefault();
  }
});

document.addEventListener("contextmenu", (e) => {
  if (e.target.nodeName === "IMG") {
    e.preventDefault();
  }
});

// Disable right click globally
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
}, false);

// Disable inspect element shortcuts
document.addEventListener("keydown", (e) => {
  // F12
  if (e.key === "F12" || e.keyCode === 123) {
    e.preventDefault();
    return false;
  }

  // Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + Shift + C
  if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
    e.preventDefault();
    return false;
  }

  // Ctrl + U (View Source)
  if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
    e.preventDefault();
    return false;
  }

  // Ctrl + S (Save Page)
  if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    return false;
  }
}, false);

// Pigilan ang drag at right-click sa mga contact links
document.querySelectorAll(".cols a, .has-tooltip").forEach((link) => {
  link.addEventListener("dragstart", (e) => e.preventDefault());
  link.addEventListener("contextmenu", (e) => e.preventDefault());
});

// Handle contact link clicks safely without triggering browser bottom-left URL preview
document.querySelectorAll(".contact-link").forEach((item) => {
  item.addEventListener("click", () => {
    const targetUrl = item.getAttribute("data-url");
    if (targetUrl && targetUrl !== "#") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  });
});

// Global click handler para sa custom navigation (No bottom-left browser preview)
document.addEventListener("click", (e) => {
  const scrollTarget = e.target.closest("[data-scroll]");
  if (scrollTarget) {
    e.preventDefault();
    const targetId = scrollTarget.getAttribute("data-scroll");
    if (targetId === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.querySelector(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Isara ang mobile burger menu kung bukas
    const linksMenu = document.getElementById("links");
    if (linksMenu) linksMenu.classList.remove("open");
    return;
  }

  const urlTarget = e.target.closest("[data-url]");
  if (urlTarget) {
    e.preventDefault();
    const dest = urlTarget.getAttribute("data-url");
    if (dest && dest !== "#") {
      if (dest.startsWith("mailto:")) {
        window.location.href = dest;
      } else {
        window.open(dest, "_blank", "noopener,noreferrer");
      }
    }
  }
});
