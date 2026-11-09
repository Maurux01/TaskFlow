// reloj
function initClock() {
  const el = document.getElementById('clockDisplay');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('es-CO', { hour12: false });
  };
  tick();
  setInterval(tick, 1000);
}


// frase del dia 
async function loadQuote() {
  try {
    const res = await fetch('https://frasedeldia.azurewebsites.net/api/phrase');
    const data = await res.json();
    document.getElementById('dailyQuote').textContent = `“${data.phrase || data.text}”`;
    document.getElementById('quoteAuthor').textContent = `- ${data.author || 'Anónimo'}`;
  } catch (e) {
    // Mantener la frase estática si CORS/falla
  }
}


// ---------- Clima (Open-Meteo) ----------
const WEATHER_CODES = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',
  71:'🌨️',73:'🌨️',75:'🌨️',80:'🌦️',81:'🌧️',82:'🌧️',
  95:'⛈️',96:'⛈️',99:'⛈️'
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

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWeather();
  loadQuote();
  initCalendarButtons();
});
