async function publishAssignment(claseId) {
    const titulo = document.getElementById('taskTitle').value;
    const instrucciones = document.getElementById('taskInstructions').value;
    const puntos = document.getElementById('taskPoints').value;
    const fecha_entrega = document.getElementById('taskDueDate').value;

    if (!titulo) return alert("El título es obligatorio");

    try {
        const response = await fetch('http://localhost:3000/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clase_id: claseId,
                titulo,
                instrucciones,
                puntos_maximos: puntos,
                fecha_entrega
            })
        });

        if (response.ok) {
            location.reload();
        } else {
            alert("Error al crear la tarea");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}