// index.js - Punto de entrada de TaskFlow
// Sprint 1 - Tarea 3: validación del formulario
// Sprint 2 - Tareas 4, 5 y 6: creación, estados y eliminación de tareas
// Sprint 3 - Tarea 7: actualización del estado a DONE (único control de "hecho")
// Integración de APIs (reloj, clima, frase del día y calendario), antes en api.js.

// ============================================================
// APIs y widgets (reloj, clima, frase del día, calendario)
// ============================================================

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
        const current = data.current;

        const tempEl = document.getElementById('weatherTemp');
        const iconEl = document.getElementById('weatherIcon');
        const locationEl = document.getElementById('weatherLocation');

        if (tempEl) tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
        if (iconEl) iconEl.textContent = WEATHER_CODES[current.weather_code] || '🌡️';
        if (locationEl) locationEl.textContent = 'Ubicación actual';
    } catch (error) {
        console.error('Error clima:', error);
        const locationEl = document.getElementById('weatherLocation');
        if (locationEl) locationEl.textContent = 'Sin conexión';
    }
}

function initWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => loadWeather(position.coords.latitude, position.coords.longitude),
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
        const day = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const quote = SPANISH_QUOTES[day % SPANISH_QUOTES.length];

        const quoteEl = document.getElementById('dailyQuote');
        const authorEl = document.getElementById('quoteAuthor');

        if (quoteEl) quoteEl.textContent = `“${quote.text}”`;
        if (authorEl) authorEl.textContent = `- ${quote.author}`;
    } catch (error) {
        console.error('Error frase:', error);
    }
}

// ---------- Calendario (FullCalendar + localStorage) ----------
const EVENTS_KEY = 'taskFlowEvents';

function getEvents() {
    try {
        return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveEvents(events) {
    try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
        console.warn('No se pudieron guardar los eventos:', error);
    }
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
                const remaining = getEvents().filter(function (event) {
                    return String(event.id) !== String(info.event.id);
                });
                saveEvents(remaining);
                info.event.remove();
            }
        }
    });

    calendar.render();
}

function showUpcoming() {
    const events = getEvents()
        .slice()
        .sort((a, b) => String(a.start).localeCompare(String(b.start)));
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = events.filter((event) => String(event.start) >= today).slice(0, 5);

    if (upcoming.length === 0) {
        alert('No hay eventos próximos.');
        return;
    }

    alert(upcoming.map((event) => `${event.start} - ${event.title}`).join('\n'));
}

function addEvent() {
    const title = prompt('Título del evento:');
    if (!title) return;

    const date = prompt('Fecha (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    if (!date) return;

    const event = { id: String(Date.now()), title: title, start: date, allDay: true };
    const events = getEvents();
    events.push(event);
    saveEvents(events);

    if (calendar) calendar.addEvent(event);
}

// ============================================================
// Formulario y TaskManager
// ============================================================

// Identificar los campos del formulario
const taskNameInput = document.querySelector('#taskName');
const taskDescInput = document.querySelector('#taskDesc');
const taskStatusInput = document.querySelector('#taskStatus');
const taskDateInput = document.querySelector('#taskDate');

// Instancia de TaskManager (Sprint 2 - Tarea 4)
const taskManager = new TaskManager();
console.log(taskManager.tasks);

// Función de validación (Sprint 1 - Tarea 3)
function validFormFieldInput(data) {
    // Si no se pasan datos, se leen del formulario
    if (!data) {
        data = {
            name: taskNameInput ? taskNameInput.value : '',
            description: taskDescInput ? taskDescInput.value : '',
            status: taskStatusInput ? taskStatusInput.value : '',
            date: taskDateInput ? taskDateInput.value : ''
        };
    }

    // Soportar también las claves por id del input
    const name = String(data.name || data.taskName || '').trim();
    const description = String(data.description || data.taskDesc || data.taskDescription || '').trim();
    const status = String(data.status || data.taskStatus || '').trim();
    const date = String(data.date || data.taskDate || '').trim();

    // Comprobar los datos ingresados
    console.log('name: ' + name);
    console.log('description: ' + description);
    console.log('status: ' + status);
    console.log('date: ' + date);

    let isValid = true;

    // Nombre no puede estar vacío
    if (name === '') {
        isValid = false;
    }
    // Descripción no puede estar vacía
    if (description === '') {
        isValid = false;
    }
    // Estado debe tener una opción seleccionada
    if (status === '') {
        isValid = false;
    }
    // Fecha de entrega debe contener una fecha válida
    if (date === '' || isNaN(Date.parse(date))) {
        isValid = false;
    }

    return isValid;
}

document.addEventListener('DOMContentLoaded', function () {
    // ---------- Inicio de APIs y widgets ----------
    initClock();
    initWeather();
    loadQuote();
    initCalendar();

    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) addEventBtn.addEventListener('click', addEvent);

    const todayBtn = document.getElementById('todayBtn');
    if (todayBtn) todayBtn.addEventListener('click', () => { if (calendar) calendar.today(); });

    const monthBtn = document.getElementById('monthBtn');
    if (monthBtn) monthBtn.addEventListener('click', () => { if (calendar) calendar.changeView('dayGridMonth'); });

    const weekBtn = document.getElementById('weekBtn');
    if (weekBtn) weekBtn.addEventListener('click', () => { if (calendar) calendar.changeView('timeGridWeek'); });

    const upcomingBtn = document.getElementById('upcomingBtn');
    if (upcomingBtn) upcomingBtn.addEventListener('click', showUpcoming);

    // ---------- Inicio de tareas ----------
    const taskList = document.querySelector('#taskList');

    // Recuperar tareas guardadas. Si no hay ninguna, usar las tarjetas de ejemplo del HTML.
    const hadStoredTasks = taskManager.load();
    if (!hadStoredTasks && taskList) {
        taskManager.seedFromStaticCards(Array.from(taskList.querySelectorAll('.task-card')));
        taskManager.save();
    }
    taskManager.render();

    if (taskList) {
        // Sprint 3 - Tarea 7: un único EventListener de click sobre la lista de tareas
        taskList.addEventListener('click', function (event) {
            const target = event.target;
            if (!target || !target.closest) return;

            // Sprint 2 - Tarea 6 (Paso 3): eliminar la tarea seleccionada
            const deleteButton = target.closest('.delete-button');
            if (deleteButton) {
                const parentTask = deleteButton.closest('[data-task-id]');
                if (!parentTask) return;

                const taskId = Number(parentTask.dataset.taskId);
                if (Number.isNaN(taskId)) return;

                taskManager.deleteTask(taskId);
                taskManager.save();
                taskManager.render();
                return;
            }

            // Sprint 3 - Tarea 7 (Pasos 2 y 5): identificar el botón, obtener el id,
            // recuperar la tarea con getTaskById() y cambiar su status a DONE.
            const doneButton = target.closest('.done-button');
            if (doneButton) {
                const parentTask = doneButton.closest('[data-task-id]');
                if (!parentTask) return;

                // Prueba del Paso 2: imprimir el elemento de la tarea seleccionada.
                console.log(parentTask);

                const taskId = Number(parentTask.dataset.taskId);
                if (Number.isNaN(taskId)) return;

                const task = taskManager.getTaskById(taskId);
                if (!task) return;

                task.status = 'DONE';
                taskManager.save();
                taskManager.render();
            }
        });

        // Cambio de categoría/estado desde el select. El checkbox es solo indicador visual.
        taskList.addEventListener('change', function (event) {
            const target = event.target;
            if (!target || !target.classList || !target.classList.contains('task-status')) return;

            const newStatus = target.value;
            if (!newStatus) return;

            const card = target.closest('[data-task-id]');
            if (!card) return;

            const task = taskManager.getTaskById(Number(card.dataset.taskId));
            if (!task) return;

            task.status = newStatus;
            taskManager.save();
            taskManager.render();
        });
    }

    const addTaskBtn = document.querySelector('#addTaskBtn');
    const alertBox = document.querySelector('#formAlert');

    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function () {
            // Recuperar los valores ingresados
            const name = taskNameInput ? taskNameInput.value : '';
            const description = taskDescInput ? taskDescInput.value : '';
            const status = taskStatusInput ? taskStatusInput.value : '';
            const date = taskDateInput ? taskDateInput.value : '';

            // Imprimir lo que guarda el formulario
            console.log('Datos del formulario:', { name: name, description: description, status: status, date: date });

            const data = {
                name: name,
                description: description,
                status: status,
                date: date
            };

            if (validFormFieldInput(data)) {
                // Datos válidos: ocultar la alerta
                if (alertBox) alertBox.classList.add('d-none');
                console.log('Formulario válido');

                // Sprint 2 - Tarea 5: registrar la tarea desde el formulario
                taskManager.addTask(name.trim(), description.trim(), date, status);
                taskManager.save();
                taskManager.render();

                // Limpiar campos
                if (taskNameInput) taskNameInput.value = '';
                if (taskDescInput) taskDescInput.value = '';
                if (taskStatusInput) taskStatusInput.value = 'Pendiente';
                if (taskDateInput) taskDateInput.value = '';

                // Cerrar el formulario
                const newTaskForm = document.querySelector('#newTaskForm form');
                if (newTaskForm) newTaskForm.reset();
                const collapseForm = document.querySelector('#newTaskForm');
                if (collapseForm) {
                    collapseForm.classList.remove('show');
                    const btnToggle = document.querySelector('.new-task-btn');
                    if (btnToggle) btnToggle.setAttribute('aria-expanded', 'false');
                }
            } else {
                // Datos inválidos: mostrar la alerta
                if (alertBox) alertBox.classList.remove('d-none');
                console.log('Formulario inválido');
            }
        });
    }

    // También validar al enviar el formulario (por si se usa Enter)
    const form = document.querySelector('.new-task-form');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (addTaskBtn) addTaskBtn.click();
        });
    }

    // Botón Cancelar: cerrar el formulario y limpiar campos
    const cancelBtn = document.querySelector('#cancelTaskBtn');
    const collapseForm = document.querySelector('#newTaskForm');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            if (taskNameInput) taskNameInput.value = '';
            if (taskDescInput) taskDescInput.value = '';
            if (taskStatusInput) taskStatusInput.value = 'Pendiente';
            if (taskDateInput) taskDateInput.value = '';
            if (alertBox) alertBox.classList.add('d-none');

            if (collapseForm) {
                collapseForm.classList.remove('show');
                const btnToggle = document.querySelector('.new-task-btn');
                if (btnToggle) btnToggle.setAttribute('aria-expanded', 'false');
            }

            console.log('Formulario cancelado y limpiado');
        });
    }
});
