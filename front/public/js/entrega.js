
document.getElementById('submissionFile')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || "";
    document.getElementById('fileNameDisplay').textContent = fileName;
});

async function submitWork(tareaId) {
    const fileInput = document.getElementById('submissionFile');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!fileInput.files[0]) return alert("Por favor, selecciona un archivo");

    const formData = new FormData();
    formData.append('tarea_id', tareaId);
    formData.append('estudiante_id', user.id);
    formData.append('archivo_entrega', fileInput.files[0]);

    try {
        const response = await fetch('/api/submissions', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert("¡Tarea entregada con éxito!");
            location.reload();
        } else {
            alert("Error al entregar la tarea");
        }
    } catch (error) {
        console.error(error);
    }
}