// En panel-admin.js
document.addEventListener('DOMContentLoaded', function() {
    cargarAlertas();
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
