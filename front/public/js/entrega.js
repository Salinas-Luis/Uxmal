
document.getElementById('submissionFile')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || "";
    document.getElementById('fileNameDisplay').textContent = fileName;
});

async function submitTask(tareaId) {
    const fileInput = document.getElementById('submissionFile');
    const comentario = document.getElementById('comentarioAlumno')?.value || '';
    const user = JSON.parse(localStorage.getItem('user'));

    if (!fileInput.files[0]) {
        const confirmSubmit = confirm('No has seleccionado un archivo. ¿Estás seguro de que deseas entregar la tarea sin archivo?');
        if (!confirmSubmit) {
            return;
        }
    }

    const formData = new FormData();
    formData.append('tarea_id', tareaId);
    formData.append('estudiante_id', user.id);
    formData.append('comentario_alumno', comentario);
    if (fileInput.files[0]) {
        formData.append('archivo_entrega', fileInput.files[0]);
    }

    try {
        const response = await fetch('/api/assignments/submit', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            alert("¡Tarea entregada con éxito!");
            location.reload();
        } else {
            alert("Error al entregar la tarea");
        }
    } catch (error) {
        console.error(error);
    }
}

async function cancelSubmission(entregaId) {
    const confirmCancel = confirm('¿Estás seguro de que deseas anular la entrega? Esta acción no se puede deshacer.');
    if (!confirmCancel) {
        return;
    }

    try {
        const response = await fetch(`/api/assignments/submission/${entregaId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert("Entrega anulada");
            location.reload();
        } else {
            alert("Error al anular la entrega");
        }
    } catch (error) {
        console.error(error);
    }
}