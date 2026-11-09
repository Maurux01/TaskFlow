// api.js - Integración de APIs (reloj, clima, frase del día, calendario)

// ---------- Reloj ----------
function initClock() {
  const el = document.getElementById('clockDisplay');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('es-CO', { hour12: false });
  };
  tick();
  setInterval(tick, 1000);
}

// ---------- Clima (Open-Meteo) ----------
const WEATHER_CODES = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 80: '🌦️', 81: '🌧️', 82: '🌧️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

async function loadWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const res = await fetch(url);
    const data = await res.json();
    const c = data.current;
    document.getElementById('weatherTemp').textContent = `${Math.round(c.temperature_2m)}°C`;
    document.getElementById('weatherIcon').textContent = WEATHER_CODES[c.weather_code] || '🌡️';
    document.getElementById('weatherLocation').textContent = 'Ubicación actual';
  } catch (e) {
    console.error('Error clima:', e);
    document.getElementById('weatherLocation').textContent = 'Sin conexión';
  }
}

function initWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
      () => loadWeather(4.711, -74.0721)
    );
  } else {
    loadWeather(4.711, -74.0721);
  }
}

// ---------- Frase del día (lista local en español) ----------
const SPANISH_QUOTES = [
  { text: 'El único modo de hacer un gran trabajo es amar lo que haces.', author: 'Steve Jobs' },
  { text: 'La vida es lo que pasa mientras estás ocupado haciendo otros planes.', author: 'John Lennon' },
  { text: 'No cuentes los días, haz que los días cuenten.', author: 'Muhammad Ali' },
  { text: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', author: 'Robert Collier' },
  { text: 'Cree en ti mismo y todo será posible.', author: 'Anónimo' },
  { text: 'La disciplina es el puente entre metas y logros.', author: 'Jim Rohn' },
  { text: 'No hay caminos fáciles, solo pasos firmes.', author: 'Anónimo' },
  { text: 'La constancia vence lo que la dicha no alcanza.', author: 'Refrán' }
];

function loadQuote() {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    const q = SPANISH_QUOTES[day % SPANISH_QUOTES.length];
    document.getElementById('dailyQuote').textContent = `“${q.text}”`;
    document.getElementById('quoteAuthor').textContent = `- ${q.author}`;
  } catch (e) {
    console.error('Error frase:', e);
  }
}



// ---------- Calendario (FullCalendar + localStorage) ----------
const EVENTS_KEY = 'taskFlowEvents';

function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveEvents(events) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (e) {}
}

let calendar = null;

function initCalendar() {
  const el = document.getElementById('calendar');
  if (!el || !window.FullCalendar) return;
  calendar = new FullCalendar.Calendar(el, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: getEvents(),
    eventClick: function (info) {
      if (confirm(`¿Eliminar el evento "${info.event.title}"?`)) {
        const remaining = getEvents().filter(function (e) {
          return String(e.id) !== String(info.event.id);
        });
        saveEvents(remaining);
        info.event.remove();
      }
    }
  });
  calendar.render();
}

function showUpcoming() {
  const events = getEvents().slice().sort((a, b) => String(a.start).localeCompare(String(b.start)));
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => String(e.start) >= now).slice(0, 5);
  if (upcoming.length === 0) {
    alert('No hay eventos próximos.');
    return;
  }
  alert(upcoming.map((e) => `${e.start} - ${e.title}`).join('\n'));
}

function addEvent() {
  const title = prompt('Título del evento:');
  if (!title) return;
  const date = prompt('Fecha (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
  if (!date) return;
  const ev = { id: String(Date.now()), title: title, start: date, allDay: true };
  const events = getEvents();
  events.push(ev);
  saveEvents(events);
  if (calendar) calendar.addEvent(ev);
}

// ---------- Init ----------
console.log('api.js cargado');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded (api.js)');
  initClock();
  initWeather();
  loadQuote();
  initCalendar();
  const addBtn = document.getElementById('addEventBtn');
  if (addBtn) addBtn.addEventListener('click', addEvent);
  const todayBtn = document.getElementById('todayBtn');
  if (todayBtn) todayBtn.addEventListener('click', () => { if (calendar) calendar.today(); });
  const monthBtn = document.getElementById('monthBtn');
  if (monthBtn) monthBtn.addEventListener('click', () => { if (calendar) calendar.changeView('dayGridMonth'); });
  const weekBtn = document.getElementById('weekBtn');
  if (weekBtn) weekBtn.addEventListener('click', () => { if (calendar) calendar.changeView('timeGridWeek'); });
  const upcomingBtn = document.getElementById('upcomingBtn');
  if (upcomingBtn) upcomingBtn.addEventListener('click', showUpcoming);
});
