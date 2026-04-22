async function publishAssignment(claseId) {
    const title = document.getElementById('taskTitle')?.value.trim();
    const instructions = document.getElementById('taskInstructions')?.value.trim();
    const points = document.getElementById('taskPoints')?.value;
    const dueDate = document.getElementById('taskDueDate')?.value;
    const fileInput = document.getElementById('taskFile');

    if (!validateNotEmpty(title, 'El título de la tarea')) return;
    if (!validateNotEmpty(instructions, 'Las instrucciones')) return;
    if (!validateRange(points, 1, 100, 'Los puntos máximos')) return;
    if (!validateDate(dueDate)) return;

    const rubricaCheckboxes = document.querySelectorAll('input[name="rubricaIds"]:checked');
    const rubricaIds = Array.from(rubricaCheckboxes).map(input => input.value);

    if (fileInput.files[0]) {
        if (!validateFileSize(fileInput.files[0], 20)) return;
    }

    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('descripcion', instructions);
    formData.append('puntos_maximos', points);
    formData.append('fecha_entrega', dueDate);
    formData.append('clase_id', claseId);
    formData.append('rubrica_ids', JSON.stringify(rubricaIds));
    
    if (fileInput.files[0]) {
        formData.append('archivo_guia', fileInput.files[0]);
    }

    showLoading('Creando tarea', 'Por favor espere...');

    try {
        const response = await fetch('/api/assignments', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            await showSuccess('¡Tarea creada!', 'La tarea ha sido publicada correctamente');
            location.reload();
        } else {
            const errorData = await response.json();
            showError('Error al crear tarea', errorData.error || 'No se pudo subir la tarea');
        }
    } catch (err) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

async function deleteAssignment(assignmentId) {
    showConfirm(
        '¿Eliminar tarea?',
        '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.',
        'Sí, eliminar',
        'Cancelar'
    ).then(async (result) => {
        if (!result.isConfirmed) return;

        showLoading('Eliminando tarea', 'Por favor espere...');

        try {
            const response = await fetch(`/api/assignments/${assignmentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await showSuccess('Tarea eliminada', 'La tarea ha sido eliminada correctamente');
                location.reload();
            } else {
                showError('Error al eliminar', 'No se pudo eliminar la tarea');
            }
        } catch (error) {
            showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
    });
}