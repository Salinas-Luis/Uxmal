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