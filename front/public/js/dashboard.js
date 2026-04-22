
async function createClass() {
    const nombre_clase = document.getElementById('className')?.value.trim();
    const seccion = document.getElementById('classSection')?.value.trim();
    const materia = document.getElementById('classSubject')?.value.trim();

    const user = JSON.parse(localStorage.getItem('user'));

    if (!validateNotEmpty(nombre_clase, 'El nombre de la clase')) return;
    if (!validateNotEmpty(seccion, 'La sección')) return;

    try {
        const response = await fetch('/api/classes/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre_clase, 
                seccion, 
                materia, 
                profesor_id: user.id 
            }),
            credentials: 'include'
        });

        const result = await response.json();
        if (response.ok) {
            await showSuccess('¡Clase creada!', 'La clase se ha creado correctamente');
            location.reload(); 
        } else {
            showError('Error al crear clase', result.error || 'No se pudo crear la clase');
        }
    } catch (error) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

async function joinClass() {
    const codigo_acceso = document.getElementById('classCode')?.value.trim();
    const user = JSON.parse(localStorage.getItem('user'));

    if (!validateNotEmpty(codigo_acceso, 'El código de clase')) return;

    try {
        const response = await fetch('/api/classes/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                codigo_acceso, 
                estudiante_id: user.id 
            }),
            credentials: 'include'
        });

        const result = await response.json();
        if (response.ok) {
            await showSuccess('¡Unido exitosamente!', 'Te has unido a la clase');
            location.reload();
        } else {
            showError('Código no válido', result.error || 'El código de clase no es válido');
        }
    } catch (error) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

async function uploadBanner(classId, event) {
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
            const bannerElement = event.target.closest('.card-header');
            if (bannerElement) {
                bannerElement.style.backgroundImage = `url('${result.url}')`;
            }
            await showSuccess('Banner actualizado', 'El banner se ha actualizado correctamente');
        } else {
            showError('Error al subir banner', result.error || 'No se pudo subir el banner');
        }
    } catch (error) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

function logout() {
    showConfirm(
        '¿Cerrar sesión?',
        '¿Estás seguro de que deseas cerrar sesión?',
        'Sí, cerrar sesión',
        'Cancelar'
    ).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }
    });
}
