
async function createClass() {
    const nombre_clase = document.getElementById('className').value;
    const seccion = document.getElementById('classSection').value;
    const materia = document.getElementById('classSubject').value;

    const user = JSON.parse(localStorage.getItem('user'));

    if (!nombre_clase) return alert("El nombre de la clase es obligatorio");

    try {
        const response = await fetch('https://uxmal-6t33.vercel.app/api/classes/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre_clase, 
                seccion, 
                materia, 
                profesor_id: user.id 
            })
        });

        const result = await response.json();
        if (response.ok) {
            location.reload(); 
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error al crear clase:", error);
    }
}

async function joinClass() {
    const codigo_acceso = document.getElementById('classCode').value;
    const user = JSON.parse(localStorage.getItem('user'));

    if (!codigo_acceso) return alert("Introduce un código");

    try {
        const response = await fetch('https://uxmal-6t33.vercel.app/api/classes/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                codigo_acceso, 
                estudiante_id: user.id 
            })
        });

        const result = await response.json();
        if (response.ok) {
            location.reload();
        } else {
            alert(result.error || "Código no válido");
        }
    } catch (error) {
        console.error("Error al unirse:", error);
    }
}

async function uploadBanner(classId, event) {
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
            const bannerElement = event.target.previousElementSibling?.parentElement;
            if (bannerElement) {
                bannerElement.style.backgroundImage = `url('${result.url}')`;
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

const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            localStorage.clear();

            sessionStorage.clear();
        });
    }