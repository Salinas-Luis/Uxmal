async function createPost(claseId) {
    const contenido = document.getElementById('postContent')?.value.trim();

    if (!validateNotEmpty(contenido, 'El contenido')) return;

    showLoading('Publicando anuncio', 'Por favor espere...');

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ contenido, clase_id: claseId })
        });

        if (response.ok) {
            await showSuccess('¡Anuncio publicado!', 'El anuncio ha sido publicado correctamente');
            location.reload();
        } else {
            showError('Error al publicar', 'No se pudo publicar el anuncio');
        }
    } catch (error) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

async function deletePost(postId) {
    showConfirm(
        '¿Eliminar anuncio?',
        '¿Estás seguro de que deseas eliminar este anuncio?',
        'Sí, eliminar',
        'Cancelar'
    ).then(async (result) => {
        if (!result.isConfirmed) return;

        showLoading('Eliminando anuncio', 'Por favor espere...');

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await showSuccess('Anuncio eliminado', 'El anuncio ha sido eliminado correctamente');
                location.reload();
            } else {
                const errorData = await response.json().catch(() => null);
                showError('Error al eliminar', errorData?.error || 'No se pudo eliminar el anuncio');
            }
        } catch (error) {
            showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
    });
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
                const errorData = await response.json().catch(() => null);
                showError('Error al eliminar', errorData?.error || 'No se pudo eliminar la tarea');
            }
        } catch (error) {
            showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
    });
}

async function uploadClassBanner(classId, event) {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!validateFileType(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) return;
    if (!validateFileSize(file, 5)) return;

    showLoading('Subiendo banner', 'Por favor espere...');

    const formData = new FormData();
    formData.append('banner', file);

    try {
        const response = await fetch(`/api/classes/${classId}/banner`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();
        if (response.ok) {
            const bannerDiv = event.target.closest('.p-5');
            if (bannerDiv) {
                bannerDiv.style.backgroundImage = `url('${result.url}')`;
            }
            await showSuccess('Banner actualizado', 'El banner se ha actualizado correctamente');
        } else {
            showError('Error al subir', result.error || 'No se pudo subir el banner');
        }
    } catch (error) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}