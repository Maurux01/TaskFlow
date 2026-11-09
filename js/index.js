// app.js - Validación del formulario de tareas (Sprint 1 - Tarea 3)
// + creación dinámica de tareas en #taskList

const STORAGE_KEY = 'taskFlowTasks';

// Identificar los campos del formulario
const taskNameInput = document.querySelector('#taskName');
const taskDescInput = document.querySelector('#taskDesc');
const taskStatusInput = document.querySelector('#taskStatus');
const taskDateInput = document.querySelector('#taskDate');

// Contenedor donde se agregan las tareas creadas
const taskList = document.querySelector('#taskList');

// Instancia de TaskManager (Sprint 2 - Tarea 4)
const taskManager = new TaskManager();
console.log(taskManager.tasks);

// ---------- helpers ----------

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function statusClass(status) {
    switch (status) {
        case 'Completada': return 'status-done';
        case 'En progreso': return 'status-progress';
        case 'Importante': return 'status-important';
        default: return 'status-pending';
    }
}

function getStoredTasks() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveStoredTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        // Si no hay localStorage disponible, se mantiene en memoria/DOM
    }
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card card';
    card.dataset.id = task.id;

    const completed = task.status === 'Completada';
    const checked = completed ? 'checked' : '';

    card.innerHTML = `
        <div class="task-card-header">
            <input type="checkbox" class="task-checkbox" ${checked}>
            <span class="task-name ${completed ? 'completed' : ''}">${escapeHtml(task.name)}</span>
            <select class="task-status ${statusClass(task.status)}">
                <option value="Pendiente" ${task.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="En progreso" ${task.status === 'En progreso' ? 'selected' : ''}>En progreso</option>
                <option value="Completada" ${task.status === 'Completada' ? 'selected' : ''}>Completada</option>
                <option value="Importante" ${task.status === 'Importante' ? 'selected' : ''}>Importante</option>
            </select>
        </div>
        <p class="task-desc">${escapeHtml(task.description)}</p>
        <div class="task-card-footer">
            <span class="task-date">📅 ${escapeHtml(task.date)}</span>
            <div class="task-card-actions">
                <button class="complete-btn" title="Marcar como completada">${completed ? '↺ Pendiente' : '✔ Completar'}</button>
                <button class="delete-btn" title="Eliminar">🗑️</button>
            </div>
        </div>
    `;

    if (completed) card.classList.add('task-completed');

    return card;
}

function renderStoredTasks() {
    if (!taskList) return;
    getStoredTasks().forEach(function (task) {
        taskList.appendChild(createTaskCard(task));
    });
}

// Función de validación
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

// Cuando el usuario envía el formulario
document.addEventListener('DOMContentLoaded', function () {
    // Renderizar tareas guardadas previamente
    renderStoredTasks();

    // Inicializar botón de completado en todas las tarjetas (estáticas y dinámicas)
    if (taskList) {
        taskList.querySelectorAll('.task-card').forEach(function (card) {
            const btn = card.querySelector('.complete-btn');
            const nameSpan = card.querySelector('.task-name');
            if (!btn) return;
            const completed = !!(nameSpan && nameSpan.classList.contains('completed'));
            btn.textContent = completed ? '↺ Pendiente' : '✔ Completar';
            if (completed) card.classList.add('task-completed');
        });
    }

    // Eliminar cualquier tarjeta al pulsar su botón "Eliminar"
    if (taskList) {
        taskList.addEventListener('click', function (e) {
            const completeBtn = e.target && e.target.closest ? e.target.closest('.complete-btn') : null;
            if (completeBtn) {
                const card = completeBtn.closest('.task-card');
                if (!card) return;
                const nameSpan = card.querySelector('.task-name');
                const checkbox = card.querySelector('.task-checkbox');
                const select = card.querySelector('.task-status');
                const isDone = !(nameSpan && nameSpan.classList.contains('completed'));
                if (nameSpan) nameSpan.classList.toggle('completed', isDone);
                if (checkbox) checkbox.checked = isDone;
                if (select) {
                    const newStatus = isDone ? 'Completada' : 'Pendiente';
                    select.value = newStatus;
                    select.className = 'task-status ' + statusClass(newStatus);
                }
                card.classList.toggle('task-completed', isDone);
                completeBtn.textContent = isDone ? '↺ Pendiente' : '✔ Completar';

                const id = card.dataset.id;
                if (id) {
                    const tasks = getStoredTasks().map(function (t) {
                        if (String(t.id) === String(id)) t.status = isDone ? 'Completada' : 'Pendiente';
                        return t;
                    });
                    saveStoredTasks(tasks);
                }
                return;
            }

            const deleteBtn = e.target && e.target.closest ? e.target.closest('.delete-btn') : null;
            if (!deleteBtn) return;
            const card = deleteBtn.closest('.task-card');
            if (!card) return;
            const id = card.dataset.id;
            card.remove();
            if (id) {
                const remaining = getStoredTasks().filter(function (t) { return String(t.id) !== String(id); });
                saveStoredTasks(remaining);
            }
        });
    }

    // Editar estado (select) y checkbox de cualquier tarjeta
    if (taskList) {
        taskList.addEventListener('change', function (e) {
            const target = e.target;
            if (!target) return;

            // Cambio de estado mediante select
            if (target.classList && target.classList.contains('task-status')) {
                const card = target.closest('.task-card');
                if (!card) return;
                const newStatus = target.value;
                target.className = 'task-status ' + statusClass(newStatus);

                const checkbox = card.querySelector('.task-checkbox');
                const nameSpan = card.querySelector('.task-name');
                const isDone = newStatus === 'Completada';
                if (checkbox) checkbox.checked = isDone;
                if (nameSpan) nameSpan.classList.toggle('completed', isDone);

                const id = card.dataset.id;
                if (id) {
                    const tasks = getStoredTasks().map(function (t) {
                        if (String(t.id) === String(id)) t.status = newStatus;
                        return t;
                    });
                    saveStoredTasks(tasks);
                }
                return;
            }

            // Cambio de checkbox
            if (target.classList && target.classList.contains('task-checkbox')) {
                const card = target.closest('.task-card');
                if (!card) return;
                const select = card.querySelector('.task-status');
                const nameSpan = card.querySelector('.task-name');
                const isDone = target.checked;
                if (nameSpan) nameSpan.classList.toggle('completed', isDone);
                if (select) {
                    if (isDone) {
                        select.value = 'Completada';
                        select.className = 'task-status ' + statusClass('Completada');
                    }
                }
                const id = card.dataset.id;
                if (id && select) {
                    const tasks = getStoredTasks().map(function (t) {
                        if (String(t.id) === String(id)) t.status = select.value;
                        return t;
                    });
                    saveStoredTasks(tasks);
                }
            }
        });
    }

    const addBtn = document.querySelector('#addTaskBtn');
    const alertBox = document.querySelector('#formAlert');

    if (addBtn) {
        addBtn.addEventListener('click', function () {
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

                // Crear y agregar la tarea al contenedor #taskList
                const task = {
                    id: Date.now(),
                    name: name.trim(),
                    description: description.trim(),
                    status: status,
                    date: date
                };
                if (taskList) {
                    taskList.appendChild(createTaskCard(task));
                }
                // Guardar en localStorage para mantenerla
                const stored = getStoredTasks();
                stored.push(task);
                saveStoredTasks(stored);

                // Limpiar campos
                if (taskNameInput) taskNameInput.value = '';
                if (taskDescInput) taskDescInput.value = '';
                if (taskStatusInput) taskStatusInput.value = 'Pendiente';
                if (taskDateInput) taskDateInput.value = '';

                // Cerrar el formulario
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
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (addBtn) addBtn.click();
        });
    }

    // Botón Cancelar: cerrar el formulario y limpiar campos
    const cancelBtn = document.querySelector('#cancelTaskBtn');
    const collapseForm = document.querySelector('#newTaskForm');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            // Limpiar campos
            if (taskNameInput) taskNameInput.value = '';
            if (taskDescInput) taskDescInput.value = '';
            if (taskStatusInput) taskStatusInput.value = 'Pendiente';
            if (taskDateInput) taskDateInput.value = '';
            // Ocultar alerta
            if (alertBox) alertBox.classList.add('d-none');
            // Cerrar el colapsable
            if (collapseForm) {
                collapseForm.classList.remove('show');
                const btnToggle = document.querySelector('.new-task-btn');
                if (btnToggle) btnToggle.setAttribute('aria-expanded', 'false');
            }
            console.log('Formulario cancelado y limpiado');
        });
    }
});
