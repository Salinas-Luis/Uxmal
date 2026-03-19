async function updateAvatar() {
    const fileInput = document.getElementById('avatarInput');
    const file = fileInput.files[0];
    const user = JSON.parse(localStorage.getItem('user'));

    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', user.id);

    try {
        const response = await fetch('https://uxmal-6t33.vercel.app/api/user/update-avatar', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('profileImage').src = result.url;
            user.avatar_url = result.url;
            localStorage.setItem('user', JSON.stringify(user));
            alert("Foto actualizada correctamente");
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteAvatar() {
    if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) return;

    try {
        const response = await fetch('/api/auth/delete-avatar', {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            // Actualizar la imagen a la por defecto
            document.getElementById('profileImage').src = '/public/img/default-avatar.png';
            // Remover el botón de eliminar
            const deleteBtn = document.querySelector('button[onclick="deleteAvatar()"]');
            if (deleteBtn) deleteBtn.remove();
            
            alert('Foto de perfil eliminada correctamente');
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'No se pudo eliminar la foto de perfil'));
        }
    } catch (err) {
        console.error(err);
        alert('Error al eliminar la foto de perfil');
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/logout';
}

document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    
    try {
        const response = await fetch('/api/auth/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ nombre, apellido, email })
        });
        
        if (response.ok) {
            alert('Perfil actualizado correctamente');
            location.reload();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'No se pudo actualizar el perfil'));
        }
    } catch (err) {
        console.error(err);
        alert('Error al actualizar el perfil');
    }
});

async function deleteAccount() {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return;
    
    if (!confirm('Esta es tu última oportunidad. ¿Realmente quieres eliminar tu cuenta permanentemente?')) return;
    
    try {
        const response = await fetch('/api/auth/delete-account', {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Cuenta eliminada correctamente');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'No se pudo eliminar la cuenta'));
        }
    } catch (err) {
        console.error(err);
        alert('Error al eliminar la cuenta');
    }
}