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
