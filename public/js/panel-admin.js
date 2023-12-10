document.addEventListener('DOMContentLoaded', function() {
    const seccionAlertas = document.getElementById('seccionAlertas');
    const seccionUsuarios = document.getElementById('seccionUsuarios');
    const seccionUbicaciones = document.getElementById('seccionUbicaciones');
    const seccionQr = document.getElementById('seccionQR');



    seccionAlertas.style.display = 'block';
    seccionUsuarios.style.display = 'none';
    seccionUbicaciones.style.display = 'none';
    seccionQr.style.display = 'none';


    linkAlertas.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'block';
        seccionUsuarios.style.display = 'none';
        seccionUbicaciones.style.display = 'none';
        seccionQr.style.display = 'none';
        cargarAlertas();
    });

    linkUsuarios.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'none';
        seccionUsuarios.style.display = 'block';
        seccionUbicaciones.style.display = 'none';
        seccionQr.style.display = 'none';
        
    });

    linkUbicaciones.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'none';
        seccionUsuarios.style.display = 'none';
        seccionUbicaciones.style.display = 'block';
        seccionQr.style.display = 'none';
        
    });

    linkQR.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'none';
        seccionUsuarios.style.display = 'none';
        seccionUbicaciones.style.display = 'none';
        seccionQr.style.display = 'block';
        cargarUbicaciones();
    });

});

function cargarAlertas() {
    fetch('/api/alertas')
    .then(response => response.json())
    .then(alertas => {
        const tablaAlertasBody = document.getElementById('tablaAlertasBody');
        tablaAlertasBody.innerHTML = ''; // Limpiar la tabla antes de cargar los datos
        alertas.forEach(alerta => {
            let fila = tablaAlertasBody.insertRow();
            // Añadir las celdas con los datos de la alerta
            fila.insertCell(0).textContent = alerta.id;
            fila.insertCell(1).textContent = alerta.nombre;
            fila.insertCell(2).textContent = alerta.descripcion;
            fila.insertCell(3).textContent = alerta.estadoActual;

            let celdaFecha = fila.insertCell(4);
            celdaFecha.textContent = formatearFecha(alerta.fecha);

            // Celda para el menú desplegable de estados
            let celdaEstado = fila.insertCell(4);
            let selectEstado = document.createElement('select');
            selectEstado.classList.add('form-select');
            selectEstado.innerHTML = `
                <option value="1">Pendiente</option>
                <option value="2">En Proceso</option>
                <option value="3">Resuelta</option>
            `;
            selectEstado.value = alerta.estadoActualId; // Asumiendo que cada alerta tiene un estadoActualId
            selectEstado.addEventListener('change', (e) => cambiarEstadoAlerta(alerta.id, e.target.value));
            celdaEstado.appendChild(selectEstado);
        });
    })
    .catch(error => console.error('Error:', error));
}


function cargarUbicaciones() {
    fetch('/api/ubicaciones')
        .then(response => response.json())
        .then(ubicaciones => {
            const selectUbicacion = document.getElementById('selectUbicacion');
            selectUbicacion.innerHTML = '';
            ubicaciones.forEach(ubicacion => {
                let option = document.createElement('option');
                option.value = ubicacion.id;
                option.textContent = ubicacion.nombre;
                selectUbicacion.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar ubicaciones:', error));
}


document.getElementById('btnGenerarQR').addEventListener('click', function() {
    const locationId = document.getElementById('selectUbicacion').value;

    fetch(`/generateQR?locationId=${locationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud al servidor. Estado: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.qrCode) {
                var contenedorQR = document.getElementById('contenedorQR');
                var imagenParaImpresion = document.getElementById('imagenParaImpresion');

                contenedorQR.innerHTML = `<img src="${data.qrCode}">`;
                imagenParaImpresion.src = data.qrCode;
                document.getElementById('btnImprimirQR').style.display = 'block';
                document.getElementById('btnDescargarQR').style.display = 'block';
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Código QR generado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Cerrar'
                });
            } else {
                throw new Error('Respuesta del servidor no contiene código QR');
            }
        })
        .catch(error => {
            console.error('Error al generar QR:', error);
            Swal.fire({
                title: 'Error',
                text: `Hubo un problema al generar el código QR: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Cerrar'
            });
        });
});


document.getElementById('btnImprimirQR').addEventListener('click', function() {
    var contenido = document.getElementById('contenedorImpresionQR').innerHTML;
    var ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(contenido);
    ventanaImpresion.document.close();
    setTimeout(function() {
        ventanaImpresion.focus();
        ventanaImpresion.print();
        ventanaImpresion.close();
    }, 250);
});


document.getElementById('btnDescargarQR').addEventListener('click', function() {
    var qrImagen = document.getElementById('imagenParaImpresion').src; // Asume que tu QR está en este elemento
    var linkDescarga = document.createElement('a');
    linkDescarga.href = qrImagen;

    linkDescarga.download = 'codigoQR.png'; 

    document.body.appendChild(linkDescarga);
    linkDescarga.click();
    document.body.removeChild(linkDescarga);
});


function cambiarEstadoAlerta(idAlerta, nuevoEstadoId) {
    // Enviar la solicitud al servidor para cambiar el estado
    fetch('/api/cambiarEstadoAlerta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idAlerta, estadoId: nuevoEstadoId })
    })
    .then(response => {
        if (response.ok) {
            console.log('Estado actualizado');
            cargarAlertas(); // Recargar las alertas para reflejar el cambio
        } else {
            console.error('Error al actualizar el estado');
        }
    })
    .catch(error => console.error('Error:', error));
}


document.getElementById('logoutButton').addEventListener('click', function(event) {
    event.preventDefault();

    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cerrar sesión');
        }
        return response.text();
    })
    .then(() => {
        window.location.href = '/'; // Redirigir a la página de inicio de sesión
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error al cerrar sesión');
    });
});

