// ADR Motorbikes · comportamiento propio de la página
// (navegación, hover/press y horario los gestiona assets/system.js del kit)

const root = document.documentElement;

// ---------------------------------------------------------------------
// Fade-in al hacer scroll: marca [data-reveal] con .is-in una sola vez.
// Sin IntersectionObserver o con reduced-motion, todo queda visible.
// ---------------------------------------------------------------------
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = document.querySelectorAll('[data-reveal]');

if (!reduce && 'IntersectionObserver' in window && items.length) {
  root.classList.add('adr-js');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------
// Contacto del taller. Los enlaces wa.me y tel: ya están en el HTML
// (funcionan sin JS); esta constante la usa el formulario.
// ---------------------------------------------------------------------
const WHATSAPP = '34618828672';

// ---------------------------------------------------------------------
// Formulario de cita: valida al enviar y abre WhatsApp con el mensaje
// ya redactado (el taller no tiene correo público). No hay "éxito" falso: el envío lo hace
// el propio cliente desde su app.
// ---------------------------------------------------------------------
const form = document.getElementById('cita-form');
const note = document.getElementById('cita-note');

const MSG = {
  valueMissing: 'Obligatorio',
  patternMismatch: 'Mínimo 9 cifras',
};

function check(field) {
  const label = field.closest('.field');
  const err = label?.querySelector('.field__err');
  if (!err) return true;
  const v = field.validity;
  const text = v.valid ? '' : (v.valueMissing ? MSG.valueMissing : MSG.patternMismatch);
  err.textContent = text;
  label.toggleAttribute('data-invalid', !v.valid);
  field.setAttribute('aria-invalid', String(!v.valid));
  return v.valid;
}

if (form) {
  // Una vez marcado un error, se corrige en vivo al escribir
  form.addEventListener('input', (e) => {
    if (e.target.closest('.field')?.hasAttribute('data-invalid')) check(e.target);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('[required]')];
    const bad = fields.filter((f) => !check(f));
    if (bad.length) { bad[0].focus(); return; }

    const d = Object.fromEntries(new FormData(form));
    const body =
      `Hola, quiero pedir cita en ADR Motorbikes.\n\n` +
      `Nombre: ${d.nombre}\nTeléfono: ${d.telefono}\nMoto: ${d.moto}\n` +
      `Servicio: ${d.servicio}\nObservación: ${d.mensaje}`;

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(body)}`;
    // Misma pestaña: sin ventanas emergentes que el navegador pueda bloquear.
    // En el móvil abre la app de WhatsApp; en el ordenador, WhatsApp Web.
    note.textContent = 'Abriendo WhatsApp con tu mensaje… Solo falta pulsar enviar.';
    note.classList.add('is-ok');
    window.location.assign(url);
  });
}

// ---------------------------------------------------------------------
// "Abierto ahora" en español y con jornada partida (el del kit no la
// contempla). Hora de Madrid. Minutos desde las 0:00.
// ---------------------------------------------------------------------
const HORARIO = {
  1: [[480, 810], [900, 1080]], // lunes: 8:00–13:30 y 15:00–18:00
  2: [[480, 810], [900, 1080]],
  3: [[480, 810], [900, 1080]],
  4: [[480, 810], [900, 1080]],
  5: [[480, 840]],              // viernes: 8:00–14:00
  6: [], 0: [],                 // fin de semana cerrado
};
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const hhmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

function abiertoAhora() {
  const out = document.querySelectorAll('[data-adr-open]');
  if (!out.length) return;
  let p;
  try {
    p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Madrid',
    }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  } catch { return; }
  const hoy = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  const ahora = (+p.hour % 24) * 60 + +p.minute;

  let texto = '';
  let abierto = false;
  const tramo = HORARIO[hoy].find(([a, c]) => ahora >= a && ahora < c);
  if (tramo) {
    abierto = true;
    texto = `Abierto ahora, hasta las ${hhmm(tramo[1])}`;
  } else {
    for (let k = 0; k < 8 && !texto; k++) {
      const d = (hoy + k) % 7;
      const sig = HORARIO[d].find(([a]) => k > 0 || a > ahora);
      if (!sig) continue;
      const cuando = k === 0 ? 'hoy' : k === 1 ? 'mañana' : `el ${DIAS[d]}`;
      texto = `Cerrado ahora · abrimos ${cuando} a las ${hhmm(sig[0])}`;
    }
  }
  out.forEach((o) => { o.textContent = texto; o.toggleAttribute('data-open', abierto); });
}
abiertoAhora();
setInterval(abiertoAhora, 60_000);

// ---------------------------------------------------------------------
// Marquesina de reseñas: duplica cada pista (copia oculta a lectores de
// pantalla) para el bucle sin saltos. En el teléfono la única columna
// visible recibe también las reseñas de la segunda. Botón de pausa (WCAG 2.2.2).
// ---------------------------------------------------------------------
document.querySelectorAll('[data-mq]').forEach((mq) => {
  if (reduce) return; // queda como lista fija
  const cols = [...mq.querySelectorAll('.mq__track')];
  const phone = window.matchMedia('(max-width: 639px)').matches;
  if (phone && cols[1]) {
    // intercala las de la segunda columna en la primera
    const a = [...cols[0].children], b = [...cols[1].children];
    cols[0].replaceChildren(...a.flatMap((el, i) => (b[i] ? [el, b[i].cloneNode(true)] : [el])));
  }
  cols.forEach((track) => {
    [...track.children].forEach((card) => {
      const copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });
  mq.classList.add('is-running');
  const btn = mq.querySelector('.mq__pause');
  btn?.addEventListener('click', () => {
    const paused = mq.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    btn.setAttribute('aria-label', paused ? 'Reanudar el desplazamiento de las reseñas' : 'Pausar el desplazamiento de las reseñas');
  });
});

// ---------------------------------------------------------------------
// Foco que sigue al puntero: actualiza --mx/--my en la tarjeta bajo el
// ratón (un solo listener delegado; solo con ratón fino).
// ---------------------------------------------------------------------
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest?.('[data-spot]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}
