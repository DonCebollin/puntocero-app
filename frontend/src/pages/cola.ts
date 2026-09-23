import { socket } from "../services/socket";
import { cerrarSesion } from "../services/auth";

interface ItemCola {
    key: string;
    producto: string;
    cantidad: number;
    mesaNumero: number;
}   

export function renderPantallaCola (contenedor: HTMLElement, estacion: "cocina" | "barra"): void {
    const titulo = estacion === "cocina" ? "Cocina" : "Barra";

    contenedor.innerHTML = `
    <div class="min-h-screen bg-superficie p-4">
        <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-white">Cola de ${titulo}</h1>
        <button id="btn-cerrar-sesion" class="bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
            Cerrar sesión
        </button>
    </div>
        <p id="sin-pedidos" class="text-gray-500 text-sm">Esperando pedidos nuevos...</p>
        <div id="lista-cola" class="space-y-3"></div>
    </div>
`;

    const listaCola = contenedor.querySelector("#lista-cola") as HTMLElement;
    const sinPedidos = contenedor.querySelector("#sin-pedidos") as HTMLElement;
    const btnCerrarSesion = contenedor.querySelector("#btn-cerrar-sesion") as HTMLButtonElement;

    btnCerrarSesion.addEventListener("click", () => {
        cerrarSesion();
        window.location.reload();
    });

    const cola: ItemCola[] = [];

    function pintarCola() {
        if (cola.length === 0) {
            sinPedidos.classList.remove("hidden");
            listaCola.innerHTML = "";
            return;
        } 
        sinPedidos.classList.add("hidden");

        listaCola.innerHTML = cola
        .map(
            (item) => `
        <div class="bg-tarjeta rounded-lg p-4 flex justify-between items-center border-l-4 border-ocupada">
        <div>
            <p class="text-white font-semibold">${item.cantidad}x ${item.producto}</p>
            <p class="text-gray-400 text-sm">Mesa ${item.mesaNumero}</p>
        </div>
            <button data-key="${item.key}" class="btn-listo bg-libre text-white text-sm font-semibold px-3 py-1 rounded-lg hover:opacity-90 transition">
            Listo
            </button>
        </div>`
    )
        .join("");

        listaCola.querySelectorAll<HTMLButtonElement>(".btn-listo").forEach((btn) => {
            btn.addEventListener("click", () => {
                const key = btn.dataset.key;
                const index = cola.findIndex((i) => i.key === key);
                if (index !== -1) cola.splice(index, 1);
                pintarCola();
            });
        });
    }

const eventoEscucha = estacion === "cocina" ? "pedido:nuevo:cocina" : "pedido:nuevo:barra";

socket.on(eventoEscucha, (data: { pedidoId: number; mesaNumero: number; items: any[] }) => {
    data.items.forEach((item: any) => {
            cola.push({
            key: `${data.pedidoId}-${item.id}`,
            producto: item.producto,
            cantidad: item.cantidad,
            mesaNumero: data.mesaNumero,
        });
    });
    pintarCola();
});

pintarCola();
}
