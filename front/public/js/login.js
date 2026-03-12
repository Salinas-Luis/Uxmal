document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    const btn = document.getElementById('loginBtn');

    btn.disabled = true;
    btn.innerText = "Verificando...";
    errorDiv.classList.add('d-none');

    try {
        const response = await fetch('https://uxmal-6t33.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = '/dashboard';
        } else {
            errorDiv.textContent = result.error || "Error al iniciar sesión";
            errorDiv.classList.remove('d-none');
        }
    } catch (error) {
        errorDiv.textContent = "No se pudo conectar con el servidor";
        errorDiv.classList.remove('d-none');
    } finally {
        btn.disabled = false;
        btn.innerText = "Ingresar";
    }
});
async function loginUser(event) {
    event.preventDefault();

    const response = await fetch('https://uxmal-6t33.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = '/dashboard';
    } else {
        alert(result.error);
    }
}