document.getElementById('submissionFile')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || "";
    document.getElementById('fileNameDisplay').textContent = fileName;
});

async function submitTask(tareaId) {
    const fileInput = document.getElementById('submissionFile');
    const comentario = document.getElementById('comentarioAlumno')?.value.trim() || '';
    const user = JSON.parse(localStorage.getItem('user'));

    if (!fileInput.files[0]) {
        showConfirm(
            'Sin archivo',
            '¿Estás seguro de que deseas entregar la tarea sin archivo adjunto?',
            'Sí, entregar sin archivo',
            'Cancelar'
        ).then(result => {
            if (!result.isConfirmed) return;
            submitTaskWithoutFile(tareaId, comentario, user.id);
        });
        return;
    }

    if (!validateFileSize(fileInput.files[0], 20)) return;

    submitTaskWithoutFile(tareaId, comentario, user.id, fileInput.files[0]);
}

async function submitTaskWithoutFile(tareaId, comentario, estudianteId, archivo = null) {
    showLoading('Entregando tarea', 'Por favor espere...');

    const formData = new FormData();
    formData.append('tarea_id', tareaId);
    formData.append('estudiante_id', estudianteId);
    formData.append('comentario_alumno', comentario);
    if (archivo) {
        formData.append('archivo_entrega', archivo);
    }

    try {
        const response = await fetch('/api/assignments/submit', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            await showSuccess('¡Tarea entregada!', 'Tu tarea ha sido entregada correctamente');
            location.reload();
        } else {
            showError('Error al entregar', 'No se pudo entregar la tarea');
        }
    } catch (error) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

async function cancelSubmission(entregaId) {
    showConfirm(
        '¿Anular entrega?',
        '¿Estás seguro de que deseas anular la entrega? Esta acción no se puede deshacer.',
        'Sí, anular entrega',
        'Cancelar'
    ).then(async (result) => {
        if (!result.isConfirmed) return;

        showLoading('Anulando entrega', 'Por favor espere...');

        try {
            const response = await fetch(`/api/assignments/submission/${entregaId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await showSuccess('Entrega anulada', 'La entrega ha sido anulada correctamente');
                history.back();
            } else {
                showError('Error al anular', 'No se pudo anular la entrega');
            }
        } catch (error) {
            showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
    });
}