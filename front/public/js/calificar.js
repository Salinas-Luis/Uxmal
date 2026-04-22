function verDetalleEntrega(alumnoStr) {
    const alumno = JSON.parse(alumnoStr);
    const container = document.getElementById('detalleEntrega');

    if (!alumno.entrega) {
        container.innerHTML = `
            <h3>${alumno.nombre} ${alumno.apellido}</h3>
            <p class="text-danger">El alumno aún no ha realizado la entrega.</p>
        `;
        return;
    }

    let archivoHtml = '';
    if (alumno.entrega.archivo_entrega_url) {
        const url = alumno.entrega.archivo_entrega_url;
        const isPdf = url.toLowerCase().includes('.pdf') || url.includes('application/pdf');
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        
        if (isPdf) {
            archivoHtml = `
                <div class="border rounded mb-3 bg-white">
                    <iframe src="${url}" style="width: 100%; height: 500px; border: none; border-radius: 4px;"></iframe>
                </div>
            `;
        } else if (isImage) {
            archivoHtml = `
                <div class="border rounded mb-3 bg-white p-3 text-center">
                    <img src="${url}" alt="Archivo entregado" style="max-width: 100%; max-height: 500px; border-radius: 4px;">
                </div>
            `;
        } else {
            archivoHtml = `
                <div class="border rounded p-3 bg-light mb-3">
                    <i class="fa-solid fa-file me-2"></i>
                    <a href="${url}" target="_blank" class="text-decoration-none">${alumno.entrega.nombre_archivo || 'Descargar archivo'}</a>
                </div>
            `;
        }
    } else {
        archivoHtml = `
            <div class="border rounded p-3 bg-light mb-3">
                <span class="text-muted"><i class="fa-solid fa-circle-exclamation me-2"></i>Sin archivo adjunto</span>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="text-start">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>${alumno.nombre} ${alumno.apellido}</h3>
                <div class="d-flex align-items-center">
                    <input type="number" id="notaInput" class="form-control me-2" style="width: 80px;" 
                           value="${alumno.entrega.calificacion || ''}" placeholder="0" min="0" max="${alumno.puntos_maximos_tarea}">
                    <span class="fw-bold">/ ${alumno.puntos_maximos_tarea}</span>
                    <button class="btn btn-success ms-3" onclick="guardarNota('${alumno.entrega.id}', ${alumno.puntos_maximos_tarea})">Calificar</button>
                </div>
            </div>
            
            <h6 class="fw-bold mb-3">Comentario privado del profesor:</h6>
            <textarea id="comentarioProfesor" class="form-control mb-4" rows="3" placeholder="Escribe tu comentario privado para el alumno...">${alumno.entrega.comentario_profesor || ''}</textarea>

            <h6 class="fw-bold mb-3">Archivo entregado:</h6>
            ${archivoHtml}

            ${alumno.entrega.comentario_alumno ? `
                <h6 class="fw-bold mt-4 mb-3">Comentario del alumno:</h6>
                <div class="border-start border-info rounded p-3 bg-light">
                    <p class="mb-0">${alumno.entrega.comentario_alumno}</p>
                </div>
            ` : ''}
        </div>
    `;
}

async function guardarNota(entregaId, puntoMaximo) {
    const calificacion = document.getElementById('notaInput').value;
    const comentario_profesor = document.getElementById('comentarioProfesor')?.value || '';

    if (!validateNotEmpty(calificacion, 'La calificación')) return;
    if (!validateRange(calificacion, 0, puntoMaximo, 'La calificación')) return;

    showLoading('Guardando calificación', 'Por favor espere...');

    try {
        const response = await fetch(`/api/assignments/grade/${entregaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ calificacion, comentario_profesor })
        });

        if (response.ok) {
            await showSuccess('Calificación guardada', 'La calificación y comentario han sido guardados correctamente');
            location.reload();
        } else {
            showError('Error al guardar', 'No se pudo guardar la calificación');
        }
    } catch (err) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}