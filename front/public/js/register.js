document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    const btn = document.getElementById('regBtn');

    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');
    btn.disabled = true;
    btn.innerText = "Registrando...";

    try {
        const response = await fetch('https://uxmal-6t33.vercel.app/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, email, password })
        });

        const result = await response.json();

        if (response.ok) {
            successDiv.classList.remove('d-none');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            errorDiv.textContent = result.error || "Error al registrar el usuario";
            errorDiv.classList.remove('d-none');
            btn.disabled = false;
            btn.innerText = "Crear mi cuenta";
        }
    } catch (error) {
        errorDiv.textContent = "Error de conexión con el servidor";
        errorDiv.classList.remove('d-none');
        btn.disabled = false;
        btn.innerText = "Crear mi cuenta";
    }
});