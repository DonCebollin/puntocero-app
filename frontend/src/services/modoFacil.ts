const CLAVE = "modoFacil";

function aplicar(activo: boolean) {
    document.documentElement.classList.toggle("facil", activo);
}

function leer(): boolean {
    try{
        return localStorage.getItem(CLAVE) === "1";
    } catch {
        return false;
    }
}

function guardar(activo: boolean) {
    try {
        localStorage.setItem(CLAVE, activo ? "1" : "0");
    } catch {}
}

export function mostrarBotonModoFacil(): void {
    let activo = leer();
    aplicar(activo);

    const boton = document.createElement("button");
    boton.id = "btn-modo-facil";
    boton.className = "fixed bottom-4 left-4 z-50 bg-libre text-white font-semibold px-4 py-2 rounded-full shadow-lg";
    
    function pintar() {
    boton.textContent = activo ? "Modo facil: activado" : "Modo facil";
    boton.setAttribute("aria-pressed", String(activo));
    }
    pintar();

    boton.addEventListener("click", () => {
        activo = !activo;
        aplicar(activo);
        guardar(activo);
        pintar();
    });

    document.body.appendChild(boton);
}