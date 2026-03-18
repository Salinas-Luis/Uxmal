async function createPost(claseId) {
    const contenido = document.getElementById('postContent').value;

    if (!contenido.trim()) return alert("Escribe algo antes de publicar");

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            method: 'DELETE'
        });

        if (response.ok) {
            location.reload();
        } else {
            alert('No se pudo eliminar el anuncio');
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
            method: 'DELETE'
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