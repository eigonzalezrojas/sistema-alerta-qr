document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/tipoAlertas')
        .then(response => response.json())
        .then(alertas => {            
            const menu = document.getElementById('menuAlertas');
            alertas.forEach(alerta => {
                const btn = document.createElement('button');
                btn.textContent = alerta.nombre;
                btn.classList.add('btn', 'btn-primary', 'my-2');
                btn.setAttribute('data-id', alerta.id);
                btn.onclick = () => seleccionarAlerta(alerta.id, alertas);
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
            enviarBtn.id = 'enviarBtn';
            menu.appendChild(enviarBtn);
        })
        .catch(error => console.error('Error:', error));
});

function seleccionarAlerta(idSeleccionado, alertas) {
    alertas.forEach(alerta => {
        const btn = document.querySelector(`button[data-id="${alerta.id}"]`);
        btn.disabled = alerta.id !== idSeleccionado;
    });

    document.getElementById('infoAdicional').classList.remove('hidden');
    document.getElementById('enviarBtn').classList.remove('hidden');
}
