import { obtenerMesas, actualizarEstadoMesa, obtenerZonas, crearMesa, eliminarMesa, Mesa, Zona } from "../services/api";
import { socket } from "../services/socket";
import { cerrarSesion } from "../services/auth";
import { renderPantallaPedido } from "./pedido";
import { obtenerEmpleadoActual } from "../services/auth";
import { mostrarNotificacion, mostrarConfirmacion } from "../services/ui";

const colorBorde: Record<Mesa ["estado"], string> = {
  libre: "border-libre",
  ocupada: "border-ocupada",
  por_cobrar: "border-porcobrar"
};

const colorBadge: Record<Mesa["estado"], string> = {
  libre: "bg-libre/20 text-libre",
  ocupada: "bg-ocupada/20 text-ocupada",
  por_cobrar: "bg-porcobrar/20 text-porcobrar",
};

const textoEstado: Record<Mesa["estado"], string> = {
  libre: "Libre",
  ocupada: "Ocupada",
  por_cobrar: "Por Cobrar",
};

const siguienteEstado: Record<Mesa["estado"], Mesa["estado"]> = {
  libre: "ocupada",
  ocupada: "por_cobrar",
  por_cobrar: "libre",
};

export async function renderPantallaSalon(contenedor: HTMLElement): Promise<void> {
    const empleado = obtenerEmpleadoActual();
    const esAdmin = empleado?.rol === "administrador";
    contenedor.innerHTML = `
    <div class="min-h-screen bg-superficie p-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-white">Punto Cero — Plano de Salón</h1>
        <div class="flex gap-2">
          ${esAdmin ? `
          <button id="btn-agregar-mesa" class="bg-libre text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
            + Agregar Mesa
          </button>` : ''}
          <button id="btn-cerrar-sesion" class="bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
            Cerrar sesión
          </button>
        </div>
      </div>
      <div id="stats-container" class="mb-4"></div>
      <div id="formulario-container"></div>
      <div id="zonas-container"></div>
    </div>
  `;
    

  const zonasContainer = contenedor.querySelector("#zonas-container") as HTMLElement;
  const formularioContainer = contenedor.querySelector("#formulario-container") as HTMLElement;
  const btnAgregar = contenedor.querySelector("#btn-agregar-mesa") as HTMLButtonElement | null;
  const btnCerrarSesion = contenedor.querySelector("#btn-cerrar-sesion") as HTMLButtonElement;
  btnCerrarSesion.addEventListener("click", () => {
    cerrarSesion();
    window.location.reload();
  });

  let zonasDisponibles: Zona[] = [];

    async function mostrarFormulario() {
    if (zonasDisponibles.length === 0) {
      zonasDisponibles = await obtenerZonas();
    }

    formularioContainer.innerHTML = `
      <div class="bg-tarjeta rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Número de mesa</label>
          <input id="input-numero" type="number" min="1" class="bg-superficie text-white rounded px-3 py-2 w-32" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Zona</label>
          <select id="select-zona" class="bg-superficie text-white rounded px-3 py-2">
            ${zonasDisponibles.map((z) => `<option value="${z.id}">${z.nombre}</option>`).join("")}
          </select>
        </div>
        <button id="btn-confirmar-mesa" class="bg-libre text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
          Guardar
        </button>
        <button id="btn-cancelar-mesa" class="bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
          Cancelar
        </button>
      </div>
    `;

    const btnConfirmar = formularioContainer.querySelector("#btn-confirmar-mesa") as HTMLButtonElement;
    const btnCancelar = formularioContainer.querySelector("#btn-cancelar-mesa") as HTMLButtonElement;
    const inputNumero = formularioContainer.querySelector("#input-numero") as HTMLInputElement;
    const selectZona = formularioContainer.querySelector("#select-zona") as HTMLSelectElement;

    btnCancelar.addEventListener("click", () => {
      formularioContainer.innerHTML = "";
    });

    btnConfirmar.addEventListener("click", async () => {
      const numero = Number(inputNumero.value);
      const zonaId = Number(selectZona.value);

      if (!numero || numero <= 0) {
        mostrarNotificacion("Ingresa un número de mesa válido.", "error");
        return;
      }

      await crearMesa(numero, zonaId);
      formularioContainer.innerHTML = "";
    });
  }

  async function cargarMesas() {
    const mesas = await obtenerMesas();
    pintarMesasPorZona(mesas);
  }

  btnAgregar?.addEventListener("click", () => {
    if (formularioContainer.innerHTML.trim() === "") {
      mostrarFormulario();
    } else {
      formularioContainer.innerHTML = "";
    }
  });

  function pintarMesasPorZona(mesas: Mesa[]) {
    const statsContainer = contenedor.querySelector("#stats-container") as HTMLElement;
    const libres = mesas.filter((m) => m.estado === "libre").length;
    const ocupadas = mesas.filter((m) => m.estado === "ocupada").length;
    const porCobrar = mesas.filter((m) => m.estado === "por_cobrar").length;

    statsContainer.innerHTML = `
      <div class="bg-tarjeta rounded-lg p-3 flex flex-wrap gap-5 items-center text-sm">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-libre"></span>
          <span class="text-gray-300">Libres: <strong class="text-white">${libres}</strong></span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-ocupada"></span>
          <span class="text-gray-300">Ocupadas: <strong class="text-white">${ocupadas}</strong></span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-porcobrar"></span>
          <span class="text-gray-300">Por Cobrar: <strong class="text-white">${porCobrar}</strong></span>
        </div>
        <div class="text-gray-500 ml-auto">${mesas.length} mesas en total</div>
      </div>
    `;
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
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          ${zona}
          <span class="text-gray-500 normal-case font-normal">(${mesasDeZona.filter((m) => m.estado !== "libre").length} Ocupadas / ${mesasDeZona.length} Totales)</span>
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${mesasDeZona
            .map(
              (mesa) => `
            <button
              data-id="${mesa.id}"
              data-estado="${mesa.estado}"
              class="mesa-btn relative bg-tarjeta hover:bg-tarjeta-hover border-l-4 ${colorBorde[mesa.estado]} rounded-lg p-4 text-left transition shadow-md"
            >
                ${esAdmin ? `<span data-eliminar-id="${mesa.id}" data-eliminar-numero="${mesa.numero}" class="btn-eliminar absolute top-1 right-2 text-gray-500 hover:text-red-400 text-sm">✕</span>` : ''}
              <div class="text-2xl font-bold text-white mb-2">${mesa.numero}</div>
              <span class="inline-block text-xs font-semibold px-2 py-1 rounded-full ${colorBadge[mesa.estado]}">
                ${textoEstado[mesa.estado]}
              </span>
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
        const mesa = mesas.find((m) => m.id === id)
        if (!mesa) return;
        renderPantallaPedido(contenedor, mesa, () => renderPantallaSalon(contenedor));  
        });
    });

    zonasContainer.querySelectorAll<HTMLSpanElement>(".btn-eliminar").forEach((span) => {
      span.addEventListener("click", async (evento) => {
        evento.stopPropagation();
        const id = Number(span.dataset.eliminarId);
        const numero = span.dataset.eliminarNumero;
        
        const confirmado = await mostrarConfirmacion(`¿Eliminar la mesa ${numero}? Esta acción no se puede deshacer.`);
        if (!confirmado) return;
        try {
          await eliminarMesa(id);
          cargarMesas();
        } catch (error: any) {
          mostrarNotificacion(error.message, "error");
        }
      });
    });
}

socket.on("mesa:actualizada", () => {
    cargarMesas()
});

    await cargarMesas();
}