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

document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const titleEl = document.getElementById("track-title");
    const btnPrev = document.getElementById("btn-prev");
    const btnPlayPause = document.getElementById("btn-play-pause");
    const btnNext = document.getElementById("btn-next");
    const volumen = 0.03;

    if (!audio || !titleEl || !btnPrev || !btnPlayPause || !btnNext) return;

    const STORAGE_KEY = "inaba_now_playing_state";

    const playlist = [
        { title: "Heaven", src: "resources/audio/Heaven.mp3" },
        { title: "Your Affection", src: "resources/audio/Your-Affection.mp3" },
        { title: "Heartbeat", src: "resources/audio/Heartbeat-Heartbreak.mp3" },
        { title: "Signs Of Love", src: "resources/audio/Signs-Of-Love.mp3" }
    ];

    let currentIndex = 0;

    function loadSavedState() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveState(forcePaused = null) {
        try {
            const isPlaying = typeof forcePaused === "boolean" ? forcePaused : !audio.paused;
            const state = {
                index: currentIndex,
                time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
                isPlaying
            };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // Ignorar errores de cuota o modo restringido
        }
    }

    function tryPlay() {
        audio.play().then(() => {
            btnPlayPause.textContent = "⏸";
            saveState(true);
        }).catch(() => {
            // Si el navegador bloquea el autoplay al cambiar de página, sincronizamos el botón
            btnPlayPause.textContent = "▶";
            saveState(false);
        });
    }

    function loadTrack(index, { autoPlay = false, startTime = 0 } = {}) {
        currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
        const track = playlist[currentIndex];

        titleEl.textContent = track.title;
        titleEl.title = track.title;
        btnPlayPause.textContent = "▶";

        audio.src = track.src;
        audio.volume = volumen;

        const applyStartTimeAndPlay = () => {
            if (startTime > 0 && Number.isFinite(audio.duration) && startTime < audio.duration) {
                audio.currentTime = startTime;
            } else if (startTime > 0) {
                // Fallback por si metadata aún no expone duration en algunos navegadores
                audio.currentTime = startTime;
            }

            if (autoPlay) {
                tryPlay();
            } else {
                saveState(false);
            }
        };

        if (audio.readyState >= 1) {
            applyStartTimeAndPlay();
        } else {
            audio.addEventListener("loadedmetadata", applyStartTimeAndPlay, { once: true });
        }
    }

    btnPlayPause.addEventListener("click", () => {
        if (audio.paused) {
            tryPlay();
        } else {
            audio.pause();
            btnPlayPause.textContent = "▶";
            saveState(false);
        }
    });

    btnPrev.addEventListener("click", () => {
        loadTrack(currentIndex - 1, { autoPlay: !audio.paused, startTime: 0 });
    });

    btnNext.addEventListener("click", () => {
        loadTrack(currentIndex + 1, { autoPlay: !audio.paused, startTime: 0 });
    });

    audio.addEventListener("ended", () => {
        loadTrack(currentIndex + 1, { autoPlay: true, startTime: 0 });
    });

    // Guardar el progreso periódicamente mientras suena
    audio.addEventListener("timeupdate", () => {
        if (!audio.paused) {
            saveState(true);
        }
    });

    // Guardar estado exacto justo antes de salir o navegar a otra página
    window.addEventListener("pagehide", () => {
        saveState(!audio.paused);
    });

    // Restaurar estado al cargar la página
    const saved = loadSavedState();
    if (saved) {
        const validIndex = Number.isInteger(saved.index) ? saved.index : 0;
        const validTime = typeof saved.time === "number" && saved.time >= 0 ? saved.time : 0;
        const shouldPlay = Boolean(saved.isPlaying);

        loadTrack(validIndex, { autoPlay: shouldPlay, startTime: validTime });
    } else {
        loadTrack(0, { autoPlay: false, startTime: 0 });
    }
});