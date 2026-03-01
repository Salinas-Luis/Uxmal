
async function createClass() {
    const nombre_clase = document.getElementById('className').value;
    const seccion = document.getElementById('classSection').value;
    const materia = document.getElementById('classSubject').value;

    const user = JSON.parse(localStorage.getItem('user'));

    if (!nombre_clase) return alert("El nombre de la clase es obligatorio");

    try {
        const response = await fetch('http://localhost:3000/api/classes/create', {
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
        const response = await fetch('http://localhost:3000/api/classes/join', {
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