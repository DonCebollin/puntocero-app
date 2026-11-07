const CLAVE = "modoFacil";

function aplicar(activo: boolean) {
    document.documentElement.classList.toggle("facil", activo);
}

function leer(): boolean {
    try {
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

export function iniciarModoFacil(): void {
    aplicar(leer());
}

export function crearBotonModoFacil(): HTMLButtonElement {
    let activo = leer();

    const boton = document.createElement("button");
    boton.id = "btn-modo-facil";

    function pintar() {
        boton.className = `text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition ${activo ? "bg-libre" : "bg-gray-600"}`;
        boton.textContent = activo ? "Modo fácil: activado" : "Modo fácil";
        boton.setAttribute("aria-pressed", String(activo));
    }
    pintar();

    boton.addEventListener("click", () => {
        activo = !activo;
        aplicar(activo);
        guardar(activo);
        pintar();
    });
    return boton;
}