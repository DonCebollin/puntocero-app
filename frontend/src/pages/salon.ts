import { obtenerMesas, actualizarEstadoMesa, Mesa } from "../services/api";
import { socket } from "../services/socket";

const colorPorEstado: Record<Mesa["estado"], string> = {
    libre: "bg-green-500",
    ocupada: "bg-red-500",
    por_cobrar: "bg-yellow-500"
};

const siguienteEstado: Record<Mesa["estado"], Mesa["estado"]> = {
    libre: "ocupada",
    ocupada: "por_cobrar",
    por_cobrar: "libre",
};

export async function renderPantallaSalon(contenedor: HTMLElement): Promise<void> {
    contenedor.innerHTML = `
    <div class= "p-4>
        <h1 class="text-2xl font-bold mb-4 text-gray-800">Punto Cero — Plano de Salón</h1>
        <div id="zonas-container"></div>
    </div>
  `;

  const zonasContainer = contenedor.querySelector("#zonas-container") as HTMLElement;
  
  async function cargarMesas() {
    const mesas = await obtenerMesas();
    pintarMesasPorZona(mesas);
  }

  function pintarMesasPorZona(mesas: Mesa[]) {
    const mesasPorZona = new Map<string, Mesa[]>();
    for (const mesa of mesas) {
      const zona = mesa.zona_nombre || "Sin zona";
      if (!mesasPorZona.has(zona)) mesasPorZona.set(zona, []);
      mesasPorZona.get(zona)!.push(mesa);
    }

    zonasContainer.innerHTML = "";

    for (const [zona, mesasDeZona] of mesasPorZona) {
      const seccion = document.createElement("div");
      seccion.className = "mb-6";
      seccion.innerHTML = `
        <h2 class="text-lg font-semibold text-gray-600 mb-2 border-b pb-1">${zona}</h2>
        <div class="grid grid-cols-4 gap-3">
          ${mesasDeZona
            .map(
              (mesa) => `
            <button
              data-id="${mesa.id}"
              data-estado="${mesa.estado}"
              class="mesa-btn ${colorPorEstado[mesa.estado]} text-white font-semibold rounded-lg py-6 shadow hover:opacity-90 transition"
            >
              Mesa ${mesa.numero}
            </button>
          `
            )
            .join("")}
        </div>
      `;
      zonasContainer.appendChild(seccion);
    }

    zonasContainer.querySelectorAll<HTMLButtonElement>(".mesa-btn").forEach((boton) => {
    boton.addEventListener("click", async () => {
        const id = Number(boton.dataset.id);
        const estadoActual = boton.dataset.estado as Mesa["estado"];
        await actualizarEstadoMesa(id, siguienteEstado[estadoActual]);
        });
    });
}

socket.on("mesa:actualizada", () => {
    cargarMesas()
});

    await cargarMesas();
}