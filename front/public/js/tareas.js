async function publishAssignment(claseId) {
    const title = document.getElementById('taskTitle')?.value.trim();
    const instructions = document.getElementById('taskInstructions')?.value.trim();
    const points = document.getElementById('taskPoints')?.value;
    const dueDate = document.getElementById('taskDueDate')?.value;
    const unitId = document.getElementById('taskUnit')?.value;
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
    if (unitId) {
        formData.append('unidad_id', unitId);
    }
    
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

async function loadUnitsForClass(claseId) {
    try {
        const response = await fetch(`/api/units/class/${claseId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Error al cargar unidades');
            return;
        }

        const units = await response.json();
        const selectUnit = document.getElementById('taskUnit');

        if (!selectUnit) return;

        selectUnit.innerHTML = '<option value="">-- Sin unidad --</option>';

        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.id;
            option.textContent = `${unit.numero_unidad}. ${unit.nombre}`;
            selectUnit.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar unidades:', error);
    }
}

async function createUnit(claseId) {
    const unitNumber = document.getElementById('unitNumber')?.value;
    const unitName = document.getElementById('unitName')?.value.trim();
    const unitDescription = document.getElementById('unitDescription')?.value.trim();

    if (!validateNotEmpty(unitName, 'El nombre de la unidad')) return;
    if (!validateRange(unitNumber, 1, 99, 'El número de unidad')) return;

    showLoading('Creando unidad', 'Por favor espere...');

    try {
        const response = await fetch('/api/units', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clase_id: claseId,
                numero_unidad: parseInt(unitNumber),
                nombre: unitName,
                descripcion: unitDescription || null
            }),
            credentials: 'include'
        });

        if (response.ok) {
            await showSuccess('¡Unidad creada!', 'La unidad ha sido creada correctamente');
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createUnitModal'));
            modal?.hide();
            // Limpiar formulario
            document.getElementById('unitForm').reset();
            // Recargar unidades
            loadUnitsForClass(claseId);
        } else {
            const errorData = await response.json();
            showError('Error al crear unidad', errorData.error || 'No se pudo crear la unidad');
        }
    } catch (err) {
        console.error('Error:', err);
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

// Cargar unidades cuando se abre el modal de crear tarea
document.addEventListener('DOMContentLoaded', function() {
    const createAssignmentModal = document.getElementById('createAssignmentModal');
    if (createAssignmentModal) {
        createAssignmentModal.addEventListener('show.bs.modal', function(event) {
            // Obtener claseId del botón que abrió el modal
            const button = event.relatedTarget;
            const claseId = button?.getAttribute('data-clase-id');
            if (claseId) {
                loadUnitsForClass(claseId);
            }
        });
    }

    const editAssignmentModal = document.getElementById('editAssignmentModal');
    if (editAssignmentModal) {
        editAssignmentModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const claseId = button?.getAttribute('data-clase-id');
            if (claseId) {
                loadUnitsForEditModal(claseId);
            }
        });
    }
});

async function editAssignment(taskId, claseId) {
    const response = await fetch(`/api/units/class/${claseId}`, {
        credentials: 'include'
    });

    const units = await response.json();
    const selectUnit = document.getElementById('editTaskUnit');

    if (selectUnit) {
        selectUnit.innerHTML = '<option value="">-- Sin unidad --</option>';
        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.id;
            option.textContent = `${unit.numero_unidad}. ${unit.nombre}`;
            selectUnit.appendChild(option);
        });
    }

    document.getElementById('editAssignmentModal').dataset.taskId = taskId;

    const modal = new bootstrap.Modal(document.getElementById('editAssignmentModal'));
    modal.show();
}

async function loadUnitsForEditModal(claseId) {
    try {
        const response = await fetch(`/api/units/class/${claseId}`, {
            credentials: 'include'
        });

        if (!response.ok) return;

        const units = await response.json();
        const selectUnit = document.getElementById('editTaskUnit');

        if (!selectUnit) return;

        selectUnit.innerHTML = '<option value="">-- Sin unidad --</option>';
        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.id;
            option.textContent = `${unit.numero_unidad}. ${unit.nombre}`;
            selectUnit.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar unidades:', error);
    }
}

async function saveTaskUnit() {
    const unitId = document.getElementById('editTaskUnit')?.value;
    const taskId = document.getElementById('editAssignmentModal')?.dataset.taskId;

    if (!taskId) {
        showError('Error', 'No se pudo identificar la tarea');
        return;
    }

    showLoading('Actualizando tarea', 'Por favor espere...');

    try {
        const response = await fetch(`/api/assignments/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                unidad_id: unitId || null
            }),
            credentials: 'include'
        });

        if (response.ok) {
            await showSuccess('¡Tarea actualizada!', 'La tarea ha sido asignada a la unidad correctamente');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAssignmentModal'));
            modal?.hide();
            location.reload();
        } else {
            const errorData = await response.json();
            showError('Error', errorData.error || 'No se pudo actualizar la tarea');
        }
    } catch (err) {
        console.error('Error:', err);
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

async function deleteUnit(unitId) {
    showConfirm(
        '¿Eliminar unidad?',
        '¿Estás seguro de que deseas eliminar esta unidad? Esta acción no se puede deshacer.',
        'Sí, eliminar',
        'Cancelar'
    ).then(async (result) => {
        if (!result.isConfirmed) return;

        showLoading('Eliminando unidad', 'Por favor espere...');

        try {
            const response = await fetch(`/api/units/${unitId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await showSuccess('Unidad eliminada', 'La unidad ha sido eliminada correctamente');
                location.reload();
            } else {
                const errorData = await response.json();
                showError('Error al eliminar', errorData.error || 'No se pudo eliminar la unidad');
            }
        } catch (error) {
            showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
    });
}