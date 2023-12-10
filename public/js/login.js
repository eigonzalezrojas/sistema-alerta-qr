document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // IDs formulario HTML
        var usuario = document.getElementById('username').value;
        var clave = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rut: usuario, clave: clave }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error de autenticación');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                window.location.href = data.redirectUrl;
            } else {
                alert(data.message || 'Error al iniciar sesión');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error al iniciar sesión');
        });
    });
});
