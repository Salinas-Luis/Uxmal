async function createPost(claseId) {
    const contenido = document.getElementById('postContent').value;
    const user = JSON.parse(localStorage.getItem('user'));

    if (!contenido) return alert("El mensaje no puede estar vacío");

    try {
        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clase_id: claseId,
                autor_id: user.id,
                contenido: contenido
            })
        });

        if (response.ok) {
            location.reload(); 
        } else {
            alert("Error al publicar el anuncio");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
document.getElementById('btnPublicarAnuncio').addEventListener('click', async () => {
    const contenido = document.getElementById('textoAnuncio').value;
    const claseId = window.location.pathname.split('/').pop();

    if (!contenido.trim()) return alert("Escribe algo antes de publicar");

    const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido, clase_id: claseId })
    });

    if (response.ok) {
        location.reload(); 
    } else {
        alert("Error al publicar");
    }
});