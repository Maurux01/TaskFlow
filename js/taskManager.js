// taskManager.js - Clase TaskManager (Sprint 2 - Tarea 4)

class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
    }

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
}
