export function mostrarNotificacion(mensaje: string, tipo: "exito" | "error" = "exito"): void {
    const color = tipo === "exito" ? "bg-libre" : "bg-ocupada";
    const notificacion = document.createElement("div");
    notificacion.className = `fixed top-4 left-1/2 -translate-x-1/2 ${color} text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-lg z-50`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

export function mostrarConfirmacion(mensaje: string): Promise<boolean> {
    return new Promise((resolve) => {
        const fondo = document.createElement("div");
        fondo.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-50";
        
        fondo.innerHTML = `
    <div class="bg-tarjeta rounded-lg p-6 max-w-sm w-full mx-4">
        <p class="text-white mb-6">${mensaje}</p>
        <div class="flex gap-2 justify-end">
        <button id="btn-cancelar-confirm" class="bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">Cancelar</button>
        <button id="btn-confirmar-confirm" class="bg-ocupada text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">Confirmar</button>
        </div>
    </div>
    `;

    document.body.appendChild(fondo);

    const btnCancelar = fondo.querySelector("#btn-cancelar-confirm") as HTMLButtonElement;
    const btnConfirmar = fondo.querySelector("#btn-confirmar-confirm") as HTMLButtonElement;

    btnCancelar.addEventListener("click", () => {
        fondo.remove();
        resolve(false);
    });

    btnCancelar.addEventListener("click", () => {
        fondo.remove();
        resolve(true);
       });
    });
}