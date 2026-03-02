async function updateAvatar() {
    const fileInput = document.getElementById('avatarInput');
    const file = fileInput.files[0];
    const user = JSON.parse(localStorage.getItem('user'));

    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', user.id);

    try {
        const response = await fetch('/api/user/update-avatar', {
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

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/login';
}