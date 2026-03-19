async function createPost(claseId) {
    const contenido = document.getElementById('postContent').value;

    if (!contenido.trim()) return alert("Escribe algo antes de publicar");

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ contenido, clase_id: claseId })
        });

        if (response.ok) {
            location.reload();
        } else {
            alert("Error al publicar");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al publicar");
    }
}

async function deletePost(postId) {
    if (!confirm('¿Eliminar este anuncio?')) return;

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            location.reload();
        } else {
            const errorData = await response.json().catch(() => null);
            alert('No se pudo eliminar el anuncio: ' + (errorData?.error || response.statusText));
        }
    } catch (error) {
        console.error(error);
        alert('Error al eliminar el anuncio');
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
            const errorData = await response.json().catch(() => null);
            alert('No se pudo eliminar la tarea: ' + (errorData?.error || response.statusText));
        }
    } catch (error) {
        console.error(error);
        alert('Error al eliminar la tarea');
    }
}

async function uploadClassBanner(classId, event) {
    const file = event.target.files[0];
    
    if (!file) return;

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
            const bannerDiv = document.querySelector('[style*="background-image"]');
            if (bannerDiv) {
                bannerDiv.style.backgroundImage = `url('${result.url}')`;
            }
            alert('Banner actualizado correctamente');
        } else {
            alert('Error: ' + (result.error || 'No se pudo subir el banner'));
        }
    } catch (error) {
        console.error('Error al subir banner:', error);
        alert('Error al subir la imagen');
    }
}