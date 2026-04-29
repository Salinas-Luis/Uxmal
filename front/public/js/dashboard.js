
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById(section + '-section').classList.add('active');
            
            if (window.innerWidth < 992) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            }

            if (section === 'calendar') {
                loadPendingAssignments();
            } else if (section === 'submissions') {
                loadStudentSubmissions();
            }
        });
    });

    loadDashboardSummary();
});

async function loadDashboardSummary() {
    const summary = document.getElementById('dashboardSummary');
    if (!summary) return;

    try {
        const [pendingResponse, submissionsResponse] = await Promise.all([
            fetch('/api/assignments/pending/my-assignments', { credentials: 'include' }),
            fetch('/api/assignments/submissions/my-history', { credentials: 'include' })
        ]);

        const pendingData = pendingResponse.ok ? await pendingResponse.json() : [];
        const submissionsData = submissionsResponse.ok ? await submissionsResponse.json() : [];

        const pendingCount = pendingData.filter(tarea => !tarea.entregado).length;
        const deliveredCount = submissionsData.length;

        summary.innerHTML = `
            <div class="col-md-6 col-xl-4 mb-3">
                <div class="summary-card p-4 rounded-4 shadow-sm h-100">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <h5 class="mb-1">Tareas pendientes</h5>
                            <p class="small text-muted mb-0">Revisa tus próximas entregas</p>
                        </div>
                        <span class="badge bg-warning text-dark fs-6">${pendingCount}</span>
                    </div>
                    <p class="mb-0">${pendingCount > 0 ? 'Tienes tareas por entregar. Abre el calendario para ver los detalles.' : 'No tienes tareas pendientes por ahora.'}</p>
                </div>
            </div>
            <div class="col-md-6 col-xl-4 mb-3">
                <div class="summary-card p-4 rounded-4 shadow-sm h-100">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <h5 class="mb-1">Trabajos entregados</h5>
                            <p class="small text-muted mb-0">Consulta tus entregas recientes</p>
                        </div>
                        <span class="badge bg-primary fs-6">${deliveredCount}</span>
                    </div>
                    <p class="mb-0">${deliveredCount > 0 ? 'Revisa tus entregas en Mis trabajos para ver su estado y calificaciones.' : 'Aún no has entregado ningún trabajo.'}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar el resumen del dashboard:', error);
        summary.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning mb-0">No se pudo cargar el resumen de tareas.</div>
            </div>
        `;
    }
}

async function loadPendingAssignments() {
    const container = document.getElementById('calendarContainer');
    
    try {
        const response = await fetch('/api/assignments/pending/my-assignments', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar tareas pendientes');
        }

        const tareas = await response.json();
        const tareasPendientes = tareas.filter(tarea => !tarea.entregado);

        if (tareasPendientes.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fa-solid fa-check-circle text-success" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-3">¡No hay tareas pendientes!</p>
                </div>
            `;
            return;
        }

        const tareasAgrupadas = {};
        tareasPendientes.forEach(tarea => {
            const fecha = new Date(tarea.fecha_entrega).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (!tareasAgrupadas[fecha]) {
                tareasAgrupadas[fecha] = [];
            }
            tareasAgrupadas[fecha].push(tarea);
        });

        let html = '';
        for (const [fecha, tareasPorFecha] of Object.entries(tareasAgrupadas)) {
            html += `<h5 class="mt-4 mb-3"><i class="fa-solid fa-calendar-day me-2"></i>${fecha}</h5>`;
            
            tareasPorFecha.forEach(tarea => {
                const horaEntrega = new Date(tarea.fecha_entrega).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const claseTarea = tarea.entregado ? 'entregado' : '';
                const iconoEntrega = tarea.entregado ? '<i class="fa-solid fa-check text-success me-2"></i>' : '';
                
                html += `
                    <div class="task-card ${claseTarea}">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h6 class="mb-1">${iconoEntrega}<strong>${tarea.titulo}</strong></h6>
                                <p class="mb-1 small text-muted">${tarea.clases.nombre_clase} - ${tarea.clases.seccion}</p>
                                <p class="mb-0 small text-muted">${tarea.descripcion.substring(0, 100)}...</p>
                            </div>
                            <div class="col-md-4 text-md-end mt-3 mt-md-0">
                                <p class="mb-1"><strong>${horaEntrega}</strong></p>
                                <p class="mb-0 small text-muted">Valor: ${tarea.puntos_maximos} pts</p>
                                ${tarea.entregado ? '<span class="badge bg-success">Entregado</span>' : '<span class="badge bg-warning">Pendiente</span>'}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fa-solid fa-exclamation-circle me-2"></i>
                Error al cargar las tareas: ${error.message}
            </div>
        `;
    }
}

async function loadStudentSubmissions() {
    const container = document.getElementById('submissionsContainer');
    
    try {
        const response = await fetch('/api/assignments/submissions/my-history', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar entregas');
        }

        const entregas = await response.json();

        if (entregas.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fa-solid fa-inbox text-muted" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-3">Aún no has entregado ningún trabajo</p>
                </div>
            `;
            return;
        }

        let html = '';
        entregas.forEach(entrega => {
            const fechaEntrega = new Date(entrega.fecha_envio).toLocaleDateString('es-ES', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const horaEntrega = new Date(entrega.fecha_envio).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const claseEntrega = entrega.calificacion !== null && entrega.calificacion !== undefined ? 'calificado' : '';
            const estadoBadge = entrega.calificacion !== null && entrega.calificacion !== undefined 
                ? `<span class="badge bg-success">Calificado: ${entrega.calificacion}/${entrega.tareas.puntos_maximos}</span>`
                : `<span class="badge bg-info">Por calificar</span>`;

            html += `
                <div class="submission-card ${claseEntrega}">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="mb-1"><strong>${entrega.tareas.titulo}</strong></h6>
                            <p class="mb-1 small text-muted">${entrega.tareas.clases.nombre_clase} - ${entrega.tareas.clases.seccion}</p>
                            <p class="mb-0 small text-muted">Entregado: ${fechaEntrega} a las ${horaEntrega}</p>
                            ${entrega.comentario_alumno ? `<p class="mb-0 small text-muted mt-2"><em>"${entrega.comentario_alumno}"</em></p>` : ''}
                        </div>
                        <div class="col-md-4 text-md-end mt-3 mt-md-0">
                            ${estadoBadge}
                            ${entrega.calificacion !== null && entrega.calificacion !== undefined && entrega.comentario_profesor 
                                ? `<p class="small text-muted mt-2"><strong>Comentario:</strong> ${entrega.comentario_profesor}</p>` 
                                : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fa-solid fa-exclamation-circle me-2"></i>
                Error al cargar las entregas: ${error.message}
            </div>
        `;
    }
}

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
