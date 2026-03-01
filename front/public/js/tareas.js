async function publishAssignment(claseId) {
    const formData = new FormData();
    const fileInput = document.getElementById('taskFile');

    formData.append('clase_id', claseId);
    formData.append('titulo', document.getElementById('taskTitle').value);
    formData.append('instrucciones', document.getElementById('taskInstructions').value);
    formData.append('puntos_maximos', document.getElementById('taskPoints').value);
    formData.append('fecha_entrega', document.getElementById('taskDueDate').value);
    
    if (fileInput.files[0]) {
        formData.append('archivo_guia', fileInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/api/assignments', {
            method: 'POST',
            body: formData 
        });

        if (response.ok) location.reload();
        else alert("Error al subir tarea");
    } catch (error) {
        console.error(error);
    }
}