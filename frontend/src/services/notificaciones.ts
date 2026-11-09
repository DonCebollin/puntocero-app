import { socket } from "./socket";
import { obtenerEmpleadoActual } from "./auth";

let contexto: AudioContext | null = null;
let iniciado = false;

function obtenerContexto() : AudioContext {
    if(!contexto) {
        const Constructor = window.AudioContext || (window as any).webkitAudioContext;
        contexto = new Constructor();
    }
    return contexto;
}

function desbloquearAudio() {
    const ctx = obtenerContexto();
    if (ctx.state === "suspended") ctx.resume();
}


function tocarSonido(tipo: "pedido" | "listo") {// solo acepta estos 2 valores
    const ctx = obtenerContexto();
    if(ctx.state === "suspended") ctx.resume(); //para obtener sonido, si desactivado se reactiva
    const notas = tipo === "pedido" ? [660, 880] : [880, 660, 880];

    notas.forEach((frecuencia, i) => {
        const oscilador = ctx.createOscillator();
        const ganancia = ctx.createGain();
        const inicio = ctx.currentTime + i * 0.18;
        oscilador.type = "sine";
        oscilador.frequency.value = frecuencia;
        ganancia.gain.setValueAtTime(0.0001, inicio);
        ganancia.gain.exponentialRampToValueAtTime(0.4, inicio + 0.02);
        ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.16);
        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);
        oscilador.start(inicio);
        oscilador.stop(inicio + 0.18);
    });
}

function vibrar() {
    if (navigator.vibrate) navigator.vibrate([200,100, 200]);
}

function obtenerContenedor(): HTMLElement {
    let contenedor = document.getElementById("avisos");
    if(!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "avisos";
        contenedor.className = "fixed top-3 inset-x-3 z-50 flex flex-col gap-3 pointer-events-none";
        document.body.appendChild(contenedor);
    }
    return contenedor;
}

function mostrarAviso(titulo: string, detalle: string, color: string, persistente: boolean) {
    const aviso = document.createElement("button");
    aviso.className = `pointer-events-auto w-full text-left ${color} text-white rounded-2xl p-4 shadow-lg`;
    const tituloEl = document.createElement("span");
    tituloEl.className = "block text-lg font-bold";
    tituloEl.textContent = titulo;
    const detalleEl = document.createElement("span");
    detalleEl.className = "block text-base";
    detalleEl.textContent = detalle;

    const cerrarEl = document.createElement("span");
    cerrarEl.className = "block text-xs opacity-80 mt-1";
    cerrarEl.textContent = "Toca para cerrar";

    aviso.append(tituloEl, detalleEl, cerrarEl);
    aviso.addEventListener("click", () => aviso.remove());
    obtenerContenedor().appendChild(aviso);

    if(!persistente) {
        setTimeout(() => aviso.remove(), 8000);
    }
}

export function iniciarAvisos() {
    if (iniciado) return;
    const empleado = obtenerEmpleadoActual();
    if(!empleado) return;
    iniciado = true;

    document.addEventListener("click", desbloquearAudio, {once: true});
    document.addEventListener("touchstart", desbloquearAudio, {once: true});

    if(empleado.rol === "cocina" || empleado.rol === "barra") {
        socket.on(
            `pedido:nuevo:${empleado.rol}`,
            (data: {mesaNumero?: number; items: { cantidad: number; producto: string}[] }) => {
                tocarSonido("pedido");
                vibrar();
                const detalle = data.items.map((i) => `${i.cantidad}x ${i.producto}`).join(", ");
                mostrarAviso(`Nuevo pedido · Mesa ${data.mesaNumero ?? "?"}`, detalle, "bg-porcobrar", false);
            }
        );
    }

    if (empleado.rol === "garzon") {
        socket.on(
            "item:listo",
            (data: { garzonId: number | null; mesaNumero: number; producto: string; cantidad: number }) => {
                if (data.garzonId !== empleado.id) return;
                tocarSonido("listo");
                vibrar();
                mostrarAviso(
                    `Mesa ${data.mesaNumero}: pedido listo`,
                    `${data.cantidad}x ${data.producto}`,
                    "bg-libre",
                    true
                );
            }
        );
    }
}
