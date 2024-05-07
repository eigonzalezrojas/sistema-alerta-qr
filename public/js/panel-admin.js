document.addEventListener('DOMContentLoaded', function() {
    const seccionAlertas = document.getElementById('seccionAlertas');
    const seccionUsuarios = document.getElementById('seccionUsuarios');
    const seccionUbicaciones = document.getElementById('seccionUbicaciones');
    const seccionQr = document.getElementById('seccionQR');
    const seccionInstituciones = document.getElementById('seccionInstituciones');


    seccionAlertas.style.display = 'block';
    seccionUsuarios.style.display = 'none';
    seccionInstituciones.style.display = 'none';
    seccionUbicaciones.style.display = 'none';
    seccionQr.style.display = 'none';
    cargarAlertas();


    linkAlertas.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'block';
        seccionUsuarios.style.display = 'none';
        seccionInstituciones.style.display = 'none';
        seccionUbicaciones.style.display = 'none';
        seccionQr.style.display = 'none';
        cargarAlertas();
    });

    linkUsuarios.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'none';
        seccionUsuarios.style.display = 'block';
        seccionInstituciones.style.display = 'none';
        seccionUbicaciones.style.display = 'none';
        seccionQr.style.display = 'none';
        cargarUsuarios();
    });

    linkInstituciones.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'none';
        seccionUsuarios.style.display = 'none';
        seccionInstituciones.style.display = 'block';
        seccionUbicaciones.style.display = 'none';
        seccionQr.style.display = 'none';
        cargarInstituciones();
        
    });

    linkUbicaciones.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'none';
        seccionUsuarios.style.display = 'none';
        seccionInstituciones.style.display = 'none';
        seccionUbicaciones.style.display = 'block';
        seccionQr.style.display = 'none';
        cargarUbicacionesTabla();
        
    });

    linkQR.addEventListener('click', function (event) {
        event.preventDefault();
        seccionAlertas.style.display = 'none';
        seccionUsuarios.style.display = 'none';
        seccionInstituciones.style.display = 'none';
        seccionUbicaciones.style.display = 'none';
        seccionQr.style.display = 'block';
        cargarInstitucionesForm('selectInstitucion');        
    });

});

function cargarUsuarios() {
    fetch('/api/usuarios')
    .then(response => response.json())
    .then(usuarios => {        
        const tablaUsuariosBody = document.getElementById('tablaUsuariosBody');
        tablaUsuariosBody.innerHTML = '';

        usuarios.forEach(usuario => {
            let fila = tablaUsuariosBody.insertRow();
            fila.insertCell(0).textContent = usuario.nombre;
            fila.insertCell(1).textContent = usuario.email;
            fila.insertCell(2).textContent = usuario.rut;
            fila.insertCell(3).textContent = usuario.rol;
            fila.insertCell(4).textContent = usuario.institucion;
            
            // Celda para los botones de acción
            let celdaAcciones = fila.insertCell(5);

            // Botón de editar
            let botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";
            botonEditar.classList.add("btn", "btn-warning");
            botonEditar.onclick = function() {
                editarUsuario(usuario.id);                
            };
            celdaAcciones.appendChild(botonEditar);

            // Botón de eliminar
            let botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.classList.add("btn", "btn-danger");
            botonEliminar.onclick = function() {
                eliminarUsuario(usuario.rut);
            };
            celdaAcciones.appendChild(botonEliminar);
        });
    })
    .catch(error => console.error('Error:', error));
}


function eliminarUsuario(rut) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/eliminar-usuario/${rut}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire(
                        '¡Eliminado!',
                        'El usuario ha sido eliminado.',
                        'success'
                    );
                    cargarUsuarios();
                } else {
                    throw new Error('Error al eliminar el usuario');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire(
                    'Error',
                    'No se pudo eliminar el usuario: ' + error.message,
                    'error'
                );
            });
        }
    })
}



function cargarInstituciones() {
    fetch('/api/instituciones')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.statusText);
        }
        return response.json();
    })
    .then(instituciones => {
        const tablaInstitucionesBody = document.getElementById('tablaInstitucionesBody');
        tablaInstitucionesBody.innerHTML = ''; // Limpiar la tabla antes de cargar los datos

        instituciones.forEach(institucion => {
            let fila = tablaInstitucionesBody.insertRow();
            fila.insertCell(0).textContent = institucion.nombre;
            fila.insertCell(1).textContent = institucion.descripcion;

            // Celda para los botones de acción
            let celdaAcciones = fila.insertCell(2);

            // Botón de editar
            let botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";
            botonEditar.classList.add("btn", "btn-warning");
            botonEditar.onclick = function() {
                editarInstitucion(institucion.id); // Reemplazar con tu función de edición
            };
            celdaAcciones.appendChild(botonEditar);

            // Botón de eliminar
            let botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.classList.add("btn", "btn-danger");
            botonEliminar.onclick = function() {
                eliminarInstitucion(institucion.id); // Reemplazar con tu función de eliminación
            };
            celdaAcciones.appendChild(botonEliminar);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al cargar las instituciones. Por favor, intente de nuevo.',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    });
}

function cargarUbicacionesTabla() {
    fetch('/api/ubicaciones')
    .then(response => {        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.statusText);
        }
        return response.json();        
    })
    .then(ubicaciones => {
        const tablaUbicacionesBody = document.getElementById('tablaUbicacionesBody');

        tablaUbicacionesBody.innerHTML = '';

        ubicaciones.forEach(ubicacion => {
            let fila = tablaUbicacionesBody.insertRow();

            fila.insertCell(0).textContent = ubicacion.nombre;
            fila.insertCell(1).textContent = ubicacion.descripcion;
            fila.insertCell(2).textContent = ubicacion.institucion;

            // Celda para los botones de acción
            let celdaAcciones = fila.insertCell(3);

            // Botón de editar
            let botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";
            botonEditar.classList.add("btn", "btn-warning");
            botonEditar.onclick = function() {
                editarUbicacion(ubicacion.id); // Asegúrate de que esta función esté definida
            };
            celdaAcciones.appendChild(botonEditar);

            // Botón de eliminar
            let botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.classList.add("btn", "btn-danger");
            botonEliminar.onclick = function() {
                eliminarubicacion(ubicacion.id); // Asegúrate de que esta función esté definida
            };
            celdaAcciones.appendChild(botonEliminar);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al cargar las ubicaciones. Por favor, intente de nuevo.',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    });
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

function cargarRolesForm() {
    fetch('/api/roles')
        .then(response => response.json())
        .then(roles => {
            const selectRol = document.getElementById('rolUsuario');
            selectRol.innerHTML = '<option disabled selected>Seleccione un rol</option>'; // Opción predeterminada
            selectRol.innerHTML += roles.map(rol => `<option value="${rol.id}">${rol.nombre}</option>`).join('');
        })
        .catch(error => console.error('Error:', error));
}

function cargarInstitucionesForm(formulario) {
    fetch('/api/instituciones')
        .then(response => response.json())
        .then(instituciones => {
            const selectInstitucion = document.getElementById(formulario);
            selectInstitucion.innerHTML = '<option disabled selected>Seleccione una institución</option>'; // Opción predeterminada
            selectInstitucion.innerHTML += instituciones.map(institucion => `<option value="${institucion.id}">${institucion.nombre}</option>`).join('');
        })
        .catch(error => console.error('Error:', error));
}

function cargarUbicacionesPorInstitucion(institucionId) {
    fetch(`/api/ubicaciones/${institucionId}`)
        .then(response => response.json())
        .then(ubicaciones => {
            const selectUbicacion = document.getElementById('selectUbicacion');
            selectUbicacion.innerHTML = '<option disabled selected>Seleccione una ubicación</option>'; // Opción predeterminada
            selectUbicacion.innerHTML += ubicaciones.map(ubicacion => `<option value="${ubicacion.id}">${ubicacion.nombre}</option>`).join('');
        })
        .catch(error => console.error('Error:', error));
}

function validarRut(rut) {
    // Limpiar el RUT dejando solo números y el dígito verificador
    var valor = rut.replace(/[\.\-]/g, '');
    
    // Dividir el RUT en dígito verificador y el resto
    var cuerpo = valor.slice(0, -1);
    var dv = valor.slice(-1).toUpperCase();

    // Calcular el dígito verificador
    var suma = 0;
    var multiplo = 2;

    for(var i = 1; i <= cuerpo.length; i++) {
        var index = multiplo * valor.charAt(cuerpo.length - i);
        suma += index;
        if (multiplo < 7) {
            multiplo += 1;
        } else {
            multiplo = 2;
        }
    }

    var dvEsperado = 11 - (suma % 11);
    dv = (dv == 'K') ? 10 : dv;
    dv = (dv == 0) ? 11 : dv;

    // Retornar si el dígito verificador coincide
    return dvEsperado == dv;
}

function cargarAlertas() {
    fetch('/api/alertas')
        .then(response => response.json())
        .then(alertas => {
            const tablaBody = document.getElementById('tablaAlertasBody');
            tablaBody.innerHTML = ''; // Limpiar la tabla antes de cargar nuevas filas
            alertas.forEach(alerta => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${alerta.id}</td>
                    <td>${alerta.nombre_tipo_alerta}</td>
                    <td>${alerta.nombre_institucion}</td>
                    <td>${alerta.nombre_ubicacion}</td>
                    <td>${alerta.descripcion}</td>
                    <td>${new Date(alerta.fecha_hora).toLocaleString()}</td>
                    <td>
                        <select onchange="cambiarEstado(${alerta.id}, this.value)">
                            <option value="1" ${alerta.estado_id === 1 ? 'selected' : ''}>Pendiente</option>
                            <option value="2" ${alerta.estado_id === 2 ? 'selected' : ''}>En Proceso</option>
                            <option value="3" ${alerta.estado_id === 3 ? 'selected' : ''}>Cerrado</option>
                        </select>
                    </td>`;
                tablaBody.appendChild(fila);
            });
        })
        .catch(error => console.error('Error:', error));
}

function cambiarEstado(alertaId, nuevoEstadoId) {
    fetch('/api/cambiarEstadoAlerta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertaId, nuevoEstadoId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Estado actualizado con éxito', data);
        // Aquí podrías agregar lógica para reflejar el cambio en la interfaz de usuario
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById('selectInstitucion').addEventListener('change', function () {
    const institucionId = this.value; // Obtiene el ID de la institución seleccionada
    cargarUbicacionesPorInstitucion(institucionId); // Llama a la función para cargar las ubicaciones
});

document.getElementById('btnGenerarQR').addEventListener('click', function() {
    const institucionId = document.getElementById('selectInstitucion').value;
    const ubicacionId = document.getElementById('selectUbicacion').value;

    // Asegúrate de que tanto la institución como la ubicación están seleccionadas
    if (!institucionId || !ubicacionId) {
        Swal.fire({
            title: 'Error',
            text: 'Debes seleccionar una institución y una ubicación.',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
        return; // Detiene la ejecución si no hay selección
    }

    fetch(`/generateQR?institucionId=${institucionId}&ubicacionId=${ubicacionId}`)
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

var modalUsuarios = new bootstrap.Modal(document.getElementById('modalCrearUsuario'));
document.getElementById('btnCrearUsuario').addEventListener('click', function() {
    cargarRolesForm();
    cargarInstitucionesForm('institucionUsuario');
    modalUsuarios.show();
});

document.getElementById('formCrearUsuario').addEventListener('submit', function(e) {
    e.preventDefault();

    var rut = document.getElementById('rutUsuario').value;
    var nombre = document.getElementById('nombreUsuario').value;
    var email = document.getElementById('emailUsuario').value;
    var rolId = document.getElementById('rolUsuario').value;
    var institucionId = document.getElementById('institucionUsuario').value;


    if (!validarRut(rut)) {
        Swal.fire({
            title: 'Error',
            text: 'El RUT ingresado no es válido.',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
        return;
    }

    fetch('/crear-usuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rut: rut, nombre: nombre, email: email, rolId: rolId, institucionId: institucionId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        Swal.fire({
            title: '¡Éxito!',
            text: 'Usuario creado con éxito.',
            icon: 'success',
            confirmButtonText: 'Cerrar'
        }).then(() => {
            cargarUsuarios();
        });
        modalUsuarios.hide();
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al crear el usuario.',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    });
});

var modalInsitucion = new bootstrap.Modal(document.getElementById('modalCrearInstitucion'));
document.getElementById('btnCrearInstitucion').addEventListener('click', function() {
    modalInsitucion.show();
});

document.getElementById('formCrearInstitucion').addEventListener('submit', function(e) {
    e.preventDefault();
  
    var nombre = document.getElementById('nombreInstitucion').value;
    var detalle = document.getElementById('detalleInstitucion').value;
  
    fetch('/crear-institucion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre: nombre, detalle: detalle })
    })
    .then(response => response.json())
    .then(data => {
      Swal.fire({
        title: '¡Éxito!',
        text: data.message,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        cargarInstituciones();
      });
      modalInsitucion.hide();
    })
    .catch((error) => {
      console.error('Error:', error);

      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al crear la institución.',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        cargarInstituciones();
      });
      modalInsitucion.hide();
    });
});

var modalUbicacion = new bootstrap.Modal(document.getElementById('modalCrearUbicacion'));
document.getElementById('btnCrearUbicacion').addEventListener('click', function() {
    cargarInstitucionesForm('institucionUbicacion');
    modalUbicacion.show();
});

document.getElementById('formCrearUbicacion').addEventListener('submit', function(e) {
    e.preventDefault();
  
    var nombre = document.getElementById('nombreUbicacion').value;
    var detalle = document.getElementById('nombreSector').value;
    var institucionId = document.getElementById('institucionUbicacion').value;
  
    fetch('/crear-ubicacion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre: nombre, detalle: detalle, institucionId: institucionId })
    })
    .then(response => response.json())
    .then(data => {
      Swal.fire({
        title: '¡Éxito!',
        text: data.message,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        cargarUbicacionesTabla();
      });
      modalUbicacion.hide();
    })
    .catch((error) => {
      console.error('Error:', error);

      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al crear la institución.',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        cargarUbicacionesTabla();
      });
      modalUbicacion.hide();
    });
});