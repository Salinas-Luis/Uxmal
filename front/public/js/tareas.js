async function publishAssignment(claseId) {
    const title = document.getElementById('taskTitle').value;
    const instructions = document.getElementById('taskInstructions').value;
    const points = document.getElementById('taskPoints').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const fileInput = document.getElementById('taskFile');

    if (!title) return alert("El título es obligatorio");

    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('descripcion', instructions);
    formData.append('puntos_maximos', points);
    formData.append('fecha_entrega', dueDate);
    formData.append('clase_id', claseId);
    
    if (fileInput.files[0]) {
        formData.append('archivo_guia', fileInput.files[0]);
    }

    try {
        const response = await fetch('/api/assignments', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            location.reload();
        } else {
            const errorData = await response.json();
            alert("Error: " + (errorData.error || "No se pudo subir la tarea"));
        }
    } catch (err) {
        console.error("Error en la petición:", err);
        alert("Error de conexión con el servidor");
    }
}

async function deleteAssignment(assignmentId) {
    if (!confirm('¿Eliminar esta tarea?')) return;

    try {
        const response = await fetch(`/api/assignments/${assignmentId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            location.reload();
        } else {
            alert('No se pudo eliminar la tarea');
        }
    } catch (error) {
        console.error(error);
        alert('Error al eliminar la tarea');
    }
}