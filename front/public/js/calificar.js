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

    container.innerHTML = `
        <div class="text-start">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>${alumno.nombre} ${alumno.apellido}</h3>
                <div class="d-flex align-items-center">
                    <input type="number" id="notaInput" class="form-control me-2" style="width: 80px;" 
                           value="${alumno.entrega.calificacion || ''}" placeholder="0">
                    <span class="fw-bold">/ ${alumno.puntos_maximos_tarea}</span>
                    <button class="btn btn-success ms-3" onclick="guardarNota('${alumno.entrega.id}')">Calificar</button>
                </div>
            </div>
            
            <h6 class="fw-bold">Archivo entregado:</h6>
            <div class="border rounded p-3 bg-light mb-3">
                <i class="fa-solid fa-file-pdf text-danger me-2"></i>
                ${alumno.entrega.archivo_entrega_url ?
                    `<a href="${alumno.entrega.archivo_entrega_url}" target="_blank">${alumno.entrega.nombre_archivo || 'Ver archivo'}</a>` :
                    `<span class="text-muted">Sin archivo adjunto</span>`
                }
            </div>

            ${alumno.entrega.comentario_alumno ? `
                <h6 class="fw-bold">Comentario del alumno:</h6>
                <div class="border-start border-info rounded p-3 bg-light mb-3">
                    <p class="mb-0">${alumno.entrega.comentario_alumno}</p>
                </div>
            ` : ''}

            <h6 class="fw-bold">Comentario privado del profesor:</h6>
            <textarea id="comentarioProfesor" class="form-control mb-3" rows="3" placeholder="Escribe tu comentario privado para el alumno...">${alumno.entrega.comentario_profesor || ''}</textarea>
        </div>
    `;
}

async function guardarNota(entregaId) {
    const calificacion = document.getElementById('notaInput').value;
    const comentario_profesor = document.getElementById('comentarioProfesor')?.value || '';

    try {
        const response = await fetch(`/api/assignments/grade/${entregaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ calificacion, comentario_profesor })
        });

        if (response.ok) {
            alert("Calificación y comentario guardados");
            location.reload();
        }
    } catch (err) {
        console.error(err);
    }
}