
async function loadAllRubrics() {
    try {
        const response = await fetch('/api/rubrics', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar rúbricas');
        const rubrics = await response.json();
        displayRubrics(rubrics);
    } catch (err) {
        console.error('Error al cargar rúbricas:', err);
        showError('Error', 'No se pudieron cargar las rúbricas');
    }
}


function displayRubrics(rubrics) {
    const tbody = document.getElementById('rubricsTableBody');
    if (!tbody) return;

    if (!rubrics || rubrics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay rúbricas aún</td></tr>';
        return;
    }

    tbody.innerHTML = rubrics.map(r => `
        <tr>
            <td><strong>${r.criterio}</strong></td>
            <td>${r.descripcion || '-'}</td>
            <td class="text-center">${r.puntos_maximos}</td>
            <td class="text-center">
                <button class="menu-button-sm" onclick="editRubric('${r.id}', '${r.criterio.replace(/'/g, "\\'")}', '${(r.descripcion || '').replace(/'/g, "\\'")}', ${r.puntos_maximos})">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button class="menu-button-sm" onclick="deleteRubric('${r.id}', '${r.criterio}')">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}


async function createNewRubric() {
    const criterio = document.getElementById('newRubricCriterio')?.value;
    const descripcion = document.getElementById('newRubricDescripcion')?.value || '';
    const puntos_maximos = document.getElementById('newRubricPuntos')?.value;

    if (!validateNotEmpty(criterio, 'El criterio')) return;
    if (!validateNotEmpty(puntos_maximos, 'Los puntos máximos')) return;
    if (!validateRange(puntos_maximos, 1, 1000, 'Los puntos máximos')) return;

    try {
        const response = await fetch('/api/rubrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ criterio, descripcion, puntos_maximos: Number(puntos_maximos) })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al crear rúbrica');
        }

        await showSuccess('Rúbrica creada', 'La rúbrica se agregó correctamente');
        document.getElementById('newRubricCriterio').value = '';
        document.getElementById('newRubricDescripcion').value = '';
        document.getElementById('newRubricPuntos').value = '';
        
        if (typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('rubricModal'));
            if (modal) modal.hide();
        }

        loadAllRubrics();
    } catch (err) {
        console.error('Error:', err);
        showError('Error', err.message);
    }
}


function editRubric(id, criterio, descripcion, puntos) {
    document.getElementById('editRubricId').value = id;
    document.getElementById('editRubricCriterio').value = criterio;
    document.getElementById('editRubricDescripcion').value = descripcion;
    document.getElementById('editRubricPuntos').value = puntos;

    if (typeof bootstrap !== 'undefined') {
        new bootstrap.Modal(document.getElementById('editRubricModal')).show();
    }
}


async function saveRubricChanges() {
    const id = document.getElementById('editRubricId').value;
    const criterio = document.getElementById('editRubricCriterio').value;
    const descripcion = document.getElementById('editRubricDescripcion').value || '';
    const puntos_maximos = document.getElementById('editRubricPuntos').value;

    if (!validateNotEmpty(criterio, 'El criterio')) return;
    if (!validateNotEmpty(puntos_maximos, 'Los puntos máximos')) return;

    try {
        const response = await fetch(`/api/rubrics/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ criterio, descripcion, puntos_maximos: Number(puntos_maximos) })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al actualizar');
        }

        await showSuccess('Rúbrica actualizada', 'Los cambios se guardaron correctamente');
        
        if (typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editRubricModal'));
            if (modal) modal.hide();
        }

        loadAllRubrics();
    } catch (err) {
        showError('Error', err.message);
    }
}


async function deleteRubric(id, criterio) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la rúbrica "${criterio}"?`)) return;

    try {
        const response = await fetch(`/api/rubrics/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al eliminar');
        }

        await showSuccess('Rúbrica eliminada', 'Se eliminó correctamente');
        loadAllRubrics();
    } catch (err) {
        showError('Error', err.message);
    }
}


async function loadRubricsForAssignment() {
    try {
        const response = await fetch('/api/rubrics', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar rúbricas');
        const rubrics = await response.json();
        
        const container = document.getElementById('rubricsCheckboxContainer');
        if (!container) return;

        if (!rubrics || rubrics.length === 0) {
            container.innerHTML = '<p class="small text-muted mb-0">No hay rúbricas disponibles. <a href="#rubricManagement" onclick="openRubricManagement()">Crear una</a></p>';
            return;
        }

        container.innerHTML = rubrics.map(r => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${r.id}" id="rubrica_${r.id}" name="rubricaIds">
                <label class="form-check-label" for="rubrica_${r.id}">
                    <strong>${r.criterio}</strong> - ${r.puntos_maximos} pts
                    ${r.descripcion ? `<div class="small text-muted ms-4">${r.descripcion}</div>` : ''}
                </label>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error al cargar rúbricas:', err);
    }
}


async function loadRubricsForGrading(tareaId) {
    try {
        const response = await fetch(`/api/rubrics/task/${tareaId}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar rúbricas');
        const rubrics = await response.json();

        const container = document.getElementById('rubricGradingContainer');
        if (!container) return;

        if (!rubrics || rubrics.length === 0) {
            container.innerHTML = '<p class="text-muted small">No hay rúbricas para esta tarea.</p>';
            return;
        }

        container.innerHTML = '<h6 class="fw-bold mb-3">Calificar por rúbrica:</h6>' + 
            rubrics.map((tr, idx) => {
                const rubric = tr.rubricas || tr;
                return `
                    <div class="mb-3 p-3 border rounded bg-light">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <strong>${rubric.criterio}</strong>
                                ${rubric.descripcion ? `<div class="small text-muted">${rubric.descripcion}</div>` : ''}
                            </div>
                            <span class="badge bg-primary">${rubric.puntos_maximos} pts</span>
                        </div>
                        <input type="number" class="form-control form-control-sm rubric-grade-input" 
                               id="rubricGrade_${rubric.id}" 
                               min="0" max="${rubric.puntos_maximos}" 
                               placeholder="Calificación" style="max-width: 120px;">
                    </div>
                `;
            }).join('');
    } catch (err) {
        console.error('Error al cargar rúbricas para calificación:', err);
    }
}


async function saveRubricGrades(entregaId) {
    const inputs = document.querySelectorAll('.rubric-grade-input');
    const calificaciones = {};
    let valido = true;

    inputs.forEach(input => {
        const rubricId = input.id.replace('rubricGrade_', '');
        const valor = input.value;
        
        if (valor === '') {
            input.classList.add('is-invalid');
            valido = false;
        } else {
            input.classList.remove('is-invalid');
            calificaciones[rubricId] = Number(valor);
        }
    });

    if (!valido) {
        showError('Error de validación', 'Completa todas las calificaciones de rúbricas');
        return;
    }

    try {
        const response = await fetch(`/api/rubrics/submission/${entregaId}/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ calificaciones })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al guardar');
        }

        await showSuccess('Calificaciones guardadas', 'Se registraron las puntuaciones por rúbrica');
    } catch (err) {
        showError('Error', err.message);
    }
}


async function loadStudentRubricGrades(entregaId) {
    try {
        const response = await fetch(`/api/rubrics/submission/${entregaId}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar calificaciones');
        const grades = await response.json();

        const container = document.getElementById('studentRubricGradesContainer');
        if (!container) return;

        if (!grades || grades.length === 0) {
            container.innerHTML = '<p class="text-muted small">No hay calificaciones por rúbrica aún.</p>';
            return;
        }

        let totalScore = 0;
        let maxScore = 0;
        
        const gradesHtml = grades.map(g => {
            const rubric = g.rubricas || g;
            totalScore += g.calificacion || 0;
            maxScore += rubric.puntos_maximos;
            const percent = ((g.calificacion || 0) / rubric.puntos_maximos * 100).toFixed(0);
            
            return `
                <div class="mb-2 p-2 border-start border-info ps-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${rubric.criterio}</strong>
                            <div class="small text-muted">${g.calificacion || 0}/${rubric.puntos_maximos}</div>
                        </div>
                        <span class="badge ${percent >= 70 ? 'bg-success' : percent >= 50 ? 'bg-warning' : 'bg-danger'}">${percent}%</span>
                    </div>
                </div>
            `;
        }).join('');

        const avgPercent = (totalScore / maxScore * 100).toFixed(0);
        const color = avgPercent >= 70 ? 'success' : avgPercent >= 50 ? 'warning' : 'danger';

        container.innerHTML = `
            <div class="bg-light p-3 rounded mb-3">
                <h6 class="fw-bold mb-3">Desglose de puntuación:</h6>
                ${gradesHtml}
                <div class="mt-3 pt-3 border-top">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>Total:</strong>
                        <span class="badge bg-${color} fs-6">${totalScore}/${maxScore} (${avgPercent}%)</span>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Error al cargar calificaciones:', err);
    }
}
