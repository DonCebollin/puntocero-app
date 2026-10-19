const CLAVE = "tema";

const ICONO_SOL = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/></svg>`;
const ICONO_LUNA = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>`;

function aplicar(claro : boolean) {
    document.documentElement.classList.toggle("claro", claro);
}

export function mostrarBotonTema() {
    let claro = false;
    try{ claro = localStorage.getItem(CLAVE) === "claro"; } catch{}
    aplicar(claro);

    const btn = document.createElement("button");
    btn.className =
        "fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-tarjeta text-texto shadow-lg text-xl";
    btn.setAttribute("aria-label", "Cambiar tema");
    const pintar = () => (btn.innerHTML = claro ? ICONO_LUNA : ICONO_SOL);
    pintar();

    btn.addEventListener("click", () => {
        claro = !claro;
        aplicar(claro);
        try{ localStorage.setItem(CLAVE, claro ? "claro" : "oscuro"); } catch {
            pintar();
        }
    });
    document.body.appendChild(btn);
}