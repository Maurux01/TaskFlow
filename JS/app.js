// app.js - Validación del formulario de tareas (Sprint 1 - Tarea 3)

// Identificar los campos del formulario
const taskNameInput = document.querySelector('#taskName');
const taskDescInput = document.querySelector('#taskDesc');
const taskStatusInput = document.querySelector('#taskStatus');
const taskDateInput = document.querySelector('#taskDate');

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
});
