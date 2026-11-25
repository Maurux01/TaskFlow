// taskManager.js - Clase TaskManager (Sprint 2 - Tareas 4, 5 y 6)

const TASK_STORAGE_KEY = 'taskFlowTasks';

function escapeTaskHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function taskStatusClass(status) {
    switch (status) {
        case 'Completada': return 'status-done';
        case 'En progreso': return 'status-progress';
        case 'Importante': return 'status-important';
        default: return 'status-pending';
    }
}

class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
        this.storageKey = TASK_STORAGE_KEY;
    }

    // Sprint 2 - Tarea 5: registrar tareas con id consecutivo
    addTask(name, description, dueDate, status) {
        this.currentId++;
        this.tasks.push({
            id: this.currentId,
            name: name,
            description: description,
            dueDate: dueDate,
            status: status || 'PORHACER'
        });
        return this.tasks[this.tasks.length - 1];
    }

    // Sprint 2 - Tarea 6: eliminar la tarea seleccionada
    deleteTask(taskId) {
        const newTasks = [];

        for (let task of this.tasks) {
            if (task.id !== taskId) {
                newTasks.push(task);
            }
        }

        this.tasks = newTasks;
    }

    // Persistencia en localStorage
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
        }
    }

    load() {
        try {
            const stored = JSON.parse(localStorage.getItem(this.storageKey));
            if (!Array.isArray(stored)) return false;

            this.tasks = stored;
            this.currentId = stored.reduce(function (max, task) {
                return Math.max(max, Number(task.id) || 0);
            }, 0);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Convierte las tarjetas de ejemplo del HTML en tareas del manager
    seedFromStaticCards(cards) {
        cards.forEach((card) => {
            const nameEl = card.querySelector('.task-name');
            const descEl = card.querySelector('.task-desc');
            const dateEl = card.querySelector('.task-date');
            const statusEl = card.querySelector('.task-status');

            this.addTask(
                nameEl ? nameEl.textContent.trim() : 'Tarea',
                descEl ? descEl.textContent.trim() : '',
                dateEl ? dateEl.textContent.replace('📅', '').trim() : '',
                statusEl ? statusEl.value : 'PORHACER'
            );
        });
    }

    // HTML de cada tarjeta: incluye el botón delete-button (Tarea 6)
    createTaskHtml(task) {
        const card = document.createElement('div');
        card.className = 'task-card card';
        card.dataset.taskId = task.id;

        const completed = task.status === 'Completada';
        const checked = completed ? 'checked' : '';
        const dueDate = task.dueDate || task.date || '';

        card.innerHTML = `
            <div class="task-card-header">
                <input type="checkbox" class="task-checkbox" ${checked}>
                <span class="task-name ${completed ? 'completed' : ''}">${escapeTaskHtml(task.name)}</span>
                <select class="task-status ${taskStatusClass(task.status)}">
                    <option value="Pendiente" ${task.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En progreso" ${task.status === 'En progreso' ? 'selected' : ''}>En progreso</option>
                    <option value="Completada" ${completed ? 'selected' : ''}>Completada</option>
                    <option value="Importante" ${task.status === 'Importante' ? 'selected' : ''}>Importante</option>
                </select>
            </div>
            <p class="task-desc">${escapeTaskHtml(task.description)}</p>
            <div class="task-card-footer">
                <span class="task-date">📅 ${escapeTaskHtml(dueDate)}</span>
                <div class="task-card-actions">
                    <button type="button" class="complete-btn" title="Marcar como completada">${completed ? '↺ Pendiente' : '✔ Completar'}</button>
                    <button type="button" class="delete-button delete-btn" title="Eliminar">🗑️ Eliminar</button>
                </div>
            </div>
        `;

        if (completed) card.classList.add('task-completed');

        return card;
    }

    // Dibuja la lista completa desde this.tasks
    render() {
        const taskList = document.querySelector('#taskList');
        if (!taskList) return;

        taskList.innerHTML = '';
        this.tasks.forEach((task) => {
            taskList.appendChild(this.createTaskHtml(task));
        });
    }
}
