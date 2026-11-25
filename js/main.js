// Validación del formulario
const formulario = document.getElementById("form-contacto");
if (formulario) {
    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const mensajeInputForm = document.getElementById("mensaje");
    const alertaForm = document.getElementById("alerta-form");

    formulario.addEventListener("submit", (event) => {
        event.preventDefault();
        
        const nombre = nombreInput.value.trim();
        const email = emailInput.value.trim();
        const mensaje = mensajeInputForm.value.trim();

        if (nombre === "" || email === "" || mensaje === "") {
            alertaForm.textContent = "Por favor, completá todos los campos obligatorios.";
            alertaForm.className = "text-danger mt-2 fw-bold text-center";
        } else {
            alertaForm.textContent = "¡Gracias por tu mensaje! Nos contactaremos a la brevedad.";
            alertaForm.className = "text-success mt-2 fw-bold text-center";
            formulario.reset();
        }
    });
}

    } else {
        alertaForm.textContent = "¡Gracias por tu mensaje! Nos contactaremos a la brevedad.";
        alertaForm.className = "text-success mt-2 fw-bold text-center";
        formulario.reset();
    }
});