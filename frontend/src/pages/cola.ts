import { socket } from "../services/socket";
import { cerrarSesion } from "../services/auth";
import { obtenerPendientes, marcarItemListo, ItemPendiente } from "../services/api";
import { mostrarNotificacion } from "../services/ui";

function formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

function minutosEspera(fecha: string): number {
    return Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 60000));
}

function estiloUrgencia(minutos: number) {
    if (minutos >= 20) return { borde: "border-red-500", chip: "bg-red-500/20 text-red-400" };
    if (minutos >= 10) return { borde: "border-porcobrar", chip: "bg-porcobrar/20 text-porcobrar" };
    return { borde: "border-libre", chip: "bg-libre/20 text-libre" };
}

export function renderPantallaCola (contenedor: HTMLElement, estacion: "cocina" | "barra"): void {
    const titulo = estacion === "cocina" ? "Cocina" : "Barra";

    contenedor.innerHTML = `
    <div class="min-h-screen bg-superficie p-4">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h1 class="text-2xl font-bold text-white">Cola de ${titulo}</h1>
                <p id="contador" class="text-sm text-gray-400">Sin pendientes</p>
            </div>
            <button id="btn-cerrar-sesion" class="bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
                Cerrar sesión
            </button>
        </div>

        <div id="sin-pedidos" class="bg-tarjeta border border-gray-700 rounded-lg p-8 text-center">
            <p class="text-gray-300 font-semibold">Todo al día</p>
            <p class="text-gray-500 text-sm">Los pedidos nuevos aparecerán aquí automáticamente.</p>
        </div>

        <div id="lista-cola" class="space-y-3"></div>
    </div>
`;

    const listaCola = contenedor.querySelector("#lista-cola") as HTMLElement;
    const sinPedidos = contenedor.querySelector("#sin-pedidos") as HTMLElement;
    const btnCerrarSesion = contenedor.querySelector("#btn-cerrar-sesion") as HTMLButtonElement;
    const contador = contenedor.querySelector("#contador") as HTMLElement;
    btnCerrarSesion.addEventListener("click", () => {
        cerrarSesion();
        window.location.reload();
    });

    let cola: ItemPendiente[] = [];

    function pintarCola() {
        contador.textContent =
        cola.length === 0 ? "Sin pendientes" :
        cola.length === 1 ? "1 producto pendiente" :
        `${cola.length} productos pendientes`;

        if (cola.length === 0) {
            sinPedidos.classList.remove("hidden");
            listaCola.innerHTML = "";
            return;
        }
        sinPedidos.classList.add("hidden");

        listaCola.innerHTML = cola
    .map((item) => {
        const minutos = minutosEspera(item.creado_en);
        const urgencia = estiloUrgencia(minutos);
        return `
        <div class="bg-tarjeta rounded-lg p-4 border-l-4 ${urgencia.borde} shadow-md flex items-center gap-4">
            <div class="bg-superficie text-white font-bold text-xl rounded-lg w-14 h-14 flex items-center justify-center shrink-0">
                ${item.cantidad}x
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-white font-semibold text-lg truncate">${item.producto}</p>
                <p class="text-gray-400 text-sm">Mesa ${item.mesa_numero} · ${item.garzon ?? "Sin registro"}</p>
                <p class="text-gray-500 text-xs">Enviado a las ${formatearHora(item.creado_en)}</p>
            </div>
            <div class="flex flex-col items-end gap-2 shrink-0">
                <span class="text-xs font-semibold px-2 py-1 rounded-full ${urgencia.chip}">${minutos} min</span>
                <button data-id="${item.id}" class="btn-listo bg-libre text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition">
                    Listo
                </button>
            </div>
        </div>`;
    })
    .join("");

        listaCola.querySelectorAll<HTMLButtonElement>(".btn-listo").forEach((btn) => {
            btn.addEventListener("click", async () => {
                try {
                    await marcarItemListo(Number(btn.dataset.id));
                    await cargarPendientes();
                } catch (error: any) {
                    mostrarNotificacion(error.message, "error");
                }
            });
        });
    }

    async function cargarPendientes() {
        try {
            cola = await obtenerPendientes(estacion);
            pintarCola();
        } catch (error: any) {
            mostrarNotificacion(error.message, "error");
        }
    }

    socket.on(`pedido:nuevo:${estacion}`, () => {
        cargarPendientes();
    });

    socket.on("item:listo", () => {
        cargarPendientes();
    });

    socket.on("mesa:actualizada", () => {
        cargarPendientes();
    });

    const temporizador = window.setInterval(() => {
        if(!document.body.contains(listaCola)) {
            clearInterval(temporizador);
            return;
        }
        pintarCola();

    }, 30000);

    cargarPendientes();
    
}