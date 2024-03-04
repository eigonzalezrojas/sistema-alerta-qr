document.addEventListener('DOMContentLoaded', function () {
    // Captura los IDs desde la URL
    const params = new URLSearchParams(window.location.search);
    const ubicacionId = params.get('ubicacionId');
    const institucionId = params.get('institucionId');

    fetch('/api/tipoAlertas')
        .then(response => response.json())
        .then(alertas => {
            const menu = document.getElementById('menuAlertas');
            alertas.forEach(alerta => {
                const btn = document.createElement('button');
                btn.textContent = alerta.nombre;
                btn.classList.add('btn', 'btn-primary', 'my-2');
                btn.setAttribute('data-id', alerta.id);
                btn.onclick = () => mostrarOpcionesAdicionales(alerta.id, ubicacionId, institucionId);
                menu.appendChild(btn);
            });

            const infoAdicional = document.createElement('textarea');
            infoAdicional.placeholder = 'Información adicional (opcional)';
            infoAdicional.classList.add('form-control', 'my-3', 'hidden');
            infoAdicional.id = 'infoAdicional';
            menu.appendChild(infoAdicional);

            const enviarBtn = document.createElement('button');
            enviarBtn.textContent = 'Enviar';
            enviarBtn.classList.add('btn', 'btn-success', 'my-2', 'hidden');
            enviarBtn.onclick = () => enviarAlerta(ubicacionId, institucionId); // Pasar los IDs al método
            enviarBtn.id = 'enviarBtn';
            menu.appendChild(enviarBtn);
        })
        .catch(error => console.error('Error:', error));
});

function mostrarOpcionesAdicionales(idSeleccionado, ubicacionId, institucionId) {
    const alertaSeleccionada = document.querySelector(`button[data-id="${idSeleccionado}"]`);
    if (alertaSeleccionada) {
        document.getElementById('infoAdicional').classList.remove('hidden');
        document.getElementById('enviarBtn').classList.remove('hidden');
        // Agregar IDs al botón enviar para usar en la función enviarAlerta
        document.getElementById('enviarBtn').setAttribute('data-id', idSeleccionado);
        document.getElementById('enviarBtn').setAttribute('data-ubicacionId', ubicacionId);
        document.getElementById('enviarBtn').setAttribute('data-institucionId', institucionId);
    }
}

function enviarAlerta(ubicacionId, institucionId) {
    const idAlerta = document.getElementById('enviarBtn').getAttribute('data-id');
    const infoAdicional = document.getElementById('infoAdicional').value;

    console.log(idAlerta);
    console.log(infoAdicional);

    fetch('/api/registrarAlerta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tipo_alerta_id: idAlerta,
            usuario_id: 1, // Valor por defecto
            descripcion: infoAdicional,
            estado_id: 1, // Valor por defecto
            ubicacion_id: ubicacionId,
            institucion_id: institucionId,
        }),
    })
    .then(response => response.json())
    .then(data => {
        Swal.fire({
            title: '¡Éxito!',
            text: 'La alerta ha sido registrada exitosamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
    })
    .catch((error) => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al registrar la alerta. Por favor, intenta de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    });
}

