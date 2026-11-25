// index.js - Validación del formulario (Sprint 1 - Tarea 3)
// + creación, cambio de estado y eliminación de tareas (Sprint 2)

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

function findTaskById(taskId) {
    return taskManager.tasks.find(function (task) {
        return Number(task.id) === taskId;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.querySelector('#taskList');

    // Recuperar tareas guardadas. Si no hay ninguna, usar las tarjetas de ejemplo del HTML.
    const hadStoredTasks = taskManager.load();
    if (!hadStoredTasks && taskList) {
        taskManager.seedFromStaticCards(Array.from(taskList.querySelectorAll('.task-card')));
        taskManager.save();
    }
    taskManager.render();

    if (taskList) {
        // Clic en los botones de cada tarjeta (delegación de eventos)
        taskList.addEventListener('click', function (event) {
            const target = event.target;
            if (!target || !target.closest) return;

            // Sprint 2 - Tarea 4: marcar / desmarcar como completada
            const completeBtn = target.closest('.complete-btn');
            if (completeBtn) {
                const card = completeBtn.closest('[data-task-id]');
                if (!card) return;

                const task = findTaskById(Number(card.dataset.taskId));
                if (!task) return;

                task.status = task.status === 'Completada' ? 'Pendiente' : 'Completada';
                taskManager.save();
                taskManager.render();
                return;
            }

            // Sprint 2 - Tarea 6 (Paso 3): después de "Marcar como hecho", eliminar tarea
            const deleteButton = target.closest('.delete-button');
            if (deleteButton) {
                const parentTask = deleteButton.closest('[data-task-id]');
                if (!parentTask) return;

                const taskId = Number(parentTask.dataset.taskId);
                if (Number.isNaN(taskId)) return;

                taskManager.deleteTask(taskId);
                taskManager.save();
                taskManager.render();
            }
        });

        // Cambio de estado (select) o checkbox
        taskList.addEventListener('change', function (event) {
            const target = event.target;
            if (!target || !target.classList) return;

            let newStatus = null;
            if (target.classList.contains('task-status')) {
                newStatus = target.value;
            } else if (target.classList.contains('task-checkbox')) {
                newStatus = target.checked ? 'Completada' : 'Pendiente';
            }
            if (!newStatus) return;

            const card = target.closest('[data-task-id]');
            if (!card) return;

            const task = findTaskById(Number(card.dataset.taskId));
            if (!task) return;

            task.status = newStatus;
            taskManager.save();
            taskManager.render();
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
                const form = document.querySelector('#newTaskForm form');
                if (form) form.reset();
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
